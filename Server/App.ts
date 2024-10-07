import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import multer from 'multer';
import {S3Client, PutObjectCommand,ListBucketsCommand} from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import path from 'path';
import fs from 'fs';
import {requestNotification} from './PushNotifications/RequestNotification';
import {AudioNotification} from './PushNotifications/AudioNotification';

const app = express();
const connectedUsers: { [key: string]: string } = {};

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8081',
  },
});

const sequelize = new Sequelize({
  database: process.env.DB_DATABASE || 'walkietalkie',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: false,
});

app.use(
  cors({
    origin: 'http://localhost:8081',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(
  // ====================Configuración de la sesión EN EL DEPLOY=============
  session({
    secret: 'ÑLKJHGFDSAMNBVCXZPOIUYTREWQ',
    resave: true,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 1000, // 1 día en milisegundos
      httpOnly: true,
      secure: true, // Establece a true si estás usando HTTPS
      sameSite: 'none',
    },
  })
  // ================Configuración de la sesión EN LOCALHOST=================
//   session({
//     secret: 'secreto',
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24, // 1 día en milisegundos
//       httpOnly: true,
//       secure: false, // Establece a true si estás usando HTTPS
//     },
//     resave: true,
//     saveUninitialized: false,
//   })
);

// =================================================================
// * Users *
// =================================================================
class Users extends Model {
  declare id: number;
  declare username: string;
  declare info: string;
  declare email: string;
  declare password: string;
  declare groups: string;
  declare contacts: string;
  declare profilePicture: string;
  declare requests: string;
  declare isBusy: boolean;
  declare token: string;

  // Method to set the password, hashes password and sets the password
  setPassword(password: string): void {
    const saltRounds = 10; // or another salt round as per security requirement
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    this.password = hashedPassword;
  }

  // Method to check the password against the hashed password
  checkPassword(password: string): boolean {
    const result = bcrypt.compareSync(password, this.password);
    console.log(`Checking password for ${this.username}: ${result} - ${this.password} - ${password}`); // Debug print
    return result;
  }

  // Method to set the groups, stringifies groups and sets the groups
  setgroups(groups: object): void {
    this.groups = JSON.stringify(groups);
  }
  // Method to set the contacts, stringifies contacts and sets the contacts
  setcontacts(contacts: object): void {
    this.contacts = JSON.stringify(contacts);
  }

  setrequests(requests: object): void {
    this.requests = JSON.stringify(requests);
  }

  setisbusy(isBusy: boolean): void {
    this.isBusy = isBusy;
  }

  setToken(token: string): void {
    this.token = token;
  }

  static async emailExists(email: string): Promise<boolean> {
    const user = await Users.findOne({ where: { email } });
    return user !== null;
  }

  toString(): string {
    return `<Users ${this.username}>`;
  }
}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    info: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    password: DataTypes.STRING(128),

    groups: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
    },
    contacts: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
    },
    profilePicture: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    requests: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '[]',
    },
    isBusy: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    token: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
  },
  {
    sequelize, // This is the sequelize instance
    modelName: 'Users',
    // Other model options go here
  }
);

// =================================================================
//* Contacts *
// =================================================================

class Contacts extends Model {
  declare id: number;
  declare userId: number;
  declare contactId: number;
  declare room: string;
  public readonly User?: Users;
}

Contacts.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Contacts',
    tableName: 'contacts',
  }
);

Contacts.belongsTo(Users, { as: 'ContactUser', foreignKey: 'contactId' });
Users.hasMany(Contacts, { as: 'ContactUser', foreignKey: 'userId' });
Contacts.belongsTo(Users, { as: 'User', foreignKey: 'userId' });

Users.afterUpdate(async (user, options) => {
  console.log('User updated:', user.username);
  try {
    // Encuentra todos los contactos que tienen a este usuario en su lista de contactos
    const contacts = await Contacts.findAll({
      attributes: ['userId'], // Selecciona los campos de Contacts
      include: [
        {
          model: Users,
          as: 'User',
          attributes: ['id', 'username'], // Selecciona los campos de Users
        },
      ],
      where: {
        contactId: user.id, // Filtra por el campo contactId
      },
    });
    const socketUser = connectedUsers[user.id];
    // Aquí puedes definir lo que quieres hacer, por ejemplo, notificar a los contactos o actualizar algún campo relacionado
    for (const contact of contacts) {
      // Lógica de actualización o notificación
      if (contact.User !== undefined) {
        console.log(
          `El contacto con ID ${contact.userId} con nombre ${contact.User.username} necesita ser notificado del cambio en el usuario ${user.username}`
        );
        const socketContact = connectedUsers[contact.User.id];

        console.log('socketUser:', socketContact);
        if (socketContact) {
          io.to(socketContact).emit('refreshcontacts');
        }

        // Ejemplo de notificación
      }
      // Ejemplo de lógica adicional, como actualizar algún campo
      // await someUpdateFunction(contact.user_id, user);
    }
    if (socketUser) {
      io.to(socketUser).emit('refreshcontacts');
    }
  } catch (error) {
    console.error('Error actualizando contactos:', error);
  }
});
// =================================================================
// * Rooms *
// =================================================================
class Rooms extends Model {
  declare id: number;
  declare name: string;
  declare info: string;
}

Rooms.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    info: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
  },
  {
    sequelize, // This is the sequelize instance
    modelName: 'Rooms',
    // Other model options go here
  }
);

// =================================================================
// * Login *
// =================================================================
app.post('/create-user', async (req, res) => {
  const userData = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  };
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await Users.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
    });

    console.log('User created successfully:', newUser);
    res.status(201).send('User created successfully.');
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const errorMessage = error.errors
        .map((err: any) => {
          if (err.path === 'username') {
            return 'Username already exists.';
          } else if (err.path === 'email') {
            return 'Email already exists.';
          }
          return 'Unique constraint error.';
        })
        .join(' ');

      console.error('Unique constraint error:', error);
      res.status(400).send(errorMessage);
    } else {
      console.error('Error creating user:', error);
      res.status(500).send('Failed to create user.');
    }
  }
});

app.post('/toggleBusy', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.setisbusy(!user.isBusy); // Alterna el estado de isBusy
    await user.save().then(() => {
      console.log('User busy state updated successfully.');
      const socketId = connectedUsers[userId];
      if (socketId) {
        io.to(socketId).emit('refreshcontacts');
      }
    });

    res.status(200).send({ isBusy: user.isBusy });
  } catch (error) {
    console.error('Error toggling busy state:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/update-user', async (req, res) => {
  const { PropToChange, userID, newProp } = req.body;
  try {
    const user = await Users.findOne({ where: { id: userID } });
    if (!user) {
      return res.status(404).send('User not found.');
    }

    if (PropToChange === 'password') {
      user.setPassword(newProp);
    } else if (PropToChange === 'email') {
      const emailExists = await Users.emailExists(newProp);
      if (!emailExists) {
        user.email = newProp;
      } else {
        return res.status(400).json({ message: 'Email already exists.' });
      }
    } else if (PropToChange === 'info') {
      user.info = newProp;
    } else if (PropToChange === 'username') {
      const usernameExists = await Users.findOne({ where: { username: newProp } });
      if (!usernameExists) {
        user.username = newProp;
      } else {
        return res.status(400).json({ message: 'Username already exists.' });
      }
    } else {
      return res.status(400).send('Invalid property to change.');
    }
    await user.save();
    res.status(200).send('User updated successfully.');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Failed to update user.');
  }
});
app.get('/getsession', async (req, res) => {
  res.json(req.session);
});
//-----------------------------------------------------
app.post('/login', async (req, res) => {
  console.log('Entrando a login');

  const { username, password } = req.body;
  console.log(`Username: ${username}`);

  const user = await Users.findOne({
    where: {
      username: username,
    },
  });

  if (user && user.checkPassword(password)) {
    console.log('User found in database');
    user.dataValues.password = undefined; // Remove password from user info
    user.dataValues.groups = JSON.parse(user.dataValues.groups); // parsea los grupos de usuario
    user.dataValues.contacts = JSON.parse(user.dataValues.contacts); // Remove contacts from user info
    user.dataValues.requests = JSON.parse(user.dataValues.requests); // Remove contacts from user info
    console.log('UserValuesLISTOS:', user.dataValues);
    req.session.user = user.dataValues; // Store user info in session

    req.session.save();
    console.log('sesion guardada:', req.session);
    res.status(200).send(req.session);
  } else {
    res.status(401).send('Invalid login');
  }
});

app.post('/refreshSession', async (req, res) => {
  const { id } = req.body;
  const user = await Users.findOne({
    where: {
      id: id,
    },
  });

  if (user) {
    user.dataValues.password = undefined; // Remove password from user info
    user.dataValues.groups = JSON.parse(user.dataValues.groups); // Remove groups from user info
    user.dataValues.contacts = JSON.parse(user.dataValues.contacts); // Remove contacts from user info
    user.dataValues.requests = JSON.parse(user.dataValues.requests); // Remove contacts from user info
    req.session.user = user.dataValues; // Store user info in session
    req.session.save();
    res.json(req.session);
  } else {
    res.status(401).send('Invalid login');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Could not log out.');
    } else {
      res.status(200).send('Logout successful');
    }
  });
});
// =================================================================Search Room=================================================================
app.post('/searchRoom', async (req, res) => {
  const { roomsearch, username } = req.body;

  if (!username) {
    return res.status(400).send(' Username is required');
  }
  console.log('server room: ' + roomsearch);

  const user = await Users.findOne({
    where: {
      username: username,
    },
  });
  let groupsofuser = [];
  let groupsofuserDB;

  if (user && user !== null && user.groups !== null) {
    groupsofuserDB = JSON.parse(user.groups);

    if (typeof groupsofuserDB === 'string') {
      groupsofuserDB = JSON.parse(groupsofuserDB);
    }
  }

  groupsofuser = groupsofuserDB.map((group: any) => group.name); // se obtienen los nombres de los grupos del usuario

  const rooms = await Rooms.findAll({
    where: {
      [Op.and]: [
        {
          name: {
            [Op.like]: `%${roomsearch}%`, // This will match any room that contains the search string
          },
        },
        {
          name: {
            [Op.notIn]: groupsofuser, // This will exclude the groups provided
          },
        },
      ],
    },
  });

  if (rooms.length > 0) {
    res.status(200).send(rooms); // Send back the list of matching rooms
  } else {
    res.status(404).send('No rooms found');
  }
});
// =================================================================

app.post('/saveToken', async (req, res) => {
  console.log('entro a saveToken');
  const { token, username } = req.body;
  const user = await Users.findOne({
    where: {
      username: username,
    },
  });
  if (user) {
    console.log('token', token);
    user.setToken(token);
    user.save().then(() => {
      console.log('Token saved successfully');
      res.status(200).send('Token saved successfully');
    });
  } else {
    res.status(404).send('User not found');
  }

 
});
// =================================================================Search User=================================================================
app.post('/searchUser', async (req, res) => {
  const { usernamesearch, userID } = req.body;

  if (!userID) {
    return res.status(400).send(' userID is required');
  }

  console.log('server user: ' + usernamesearch);

  // Use the Op.like operator to search for usernames that contain the search string
  const user = await Users.findOne({
    where: {
      id: userID,
    },
  });
  let contactsofuser = [];
  let contactsofuserDB;

  if (user && user !== null && user.contacts !== null) {
    contactsofuserDB = JSON.parse(user.contacts);

    if (typeof contactsofuserDB === 'string') {
      contactsofuserDB = JSON.parse(contactsofuserDB);
    }
  }

  contactsofuser = contactsofuserDB.map((contact: any) => contact.id); // se obtienen los nombres de los contactos del usuario

  const users = await Users.findAll({
    where: {
      [Op.and]: [
        {
          username: {
            [Op.like]: `%${usernamesearch}%`, // This will match any username that contains the search string
          },
        },
        {
          id: {
            [Op.notIn]: [userID, ...contactsofuser], // This will exclude the username provided and those in contactsofuser
          },
        },
      ],
    },
  });

  if (users.length > 0) {
    res.status(200).send(users); // Send back the list of matching users
  } else {
    res.status(404).send('No users found');
  }
});

app.post('/getContacts', async (req, res) => {
  const { userId } = req.body;

  const contacts = await Contacts.findAll({
    attributes: ['room'], // Selecciona los campos de Contacts
    include: [
      {
        model: Users,
        as: 'User',
        attributes: ['id','username', 'info', 'profilePicture', 'isBusy'], // Selecciona los campos de Users
      },
    ],
    where: {
      userId: {
        [Op.ne]: userId, // Excluye el contacto con userId igual al valor dado
      },
      contactId: userId, // Añade la condición de que contactId debe ser igual a userId
    },
  });

  console.log('contacts:', contacts);

  if (contacts) {
    res.status(200).send(contacts);
  } else {
    res.status(200).send('No contacts found');
  }
});

//Problema aqui tal vez o EN LA SCREEN DE NOTIFICACIONES
app.post('/getRequest', async (req, res) => {
  const { userID } = req.body;
  const user = await Users.findOne({
    where: {
      id: userID,
    },
  });
  console.log('entro a getRequest');
  if (user && user.requests) {
    let requests = JSON.parse(user.requests);
    if (typeof requests === 'string') {
      requests = JSON.parse(requests);
    }
    const requestsList = [];
    for (let i = 0; i < requests.length; i++) {
      const userRequest = await Users.findOne({
        where: {
          id: requests[i],
        },
      });
      if(userRequest){
        userRequest.dataValues.password = undefined; // Remove password from user info
        userRequest.dataValues.groups = undefined; // Remove groups from user info
        userRequest.dataValues.contacts = undefined; // Remove contacts from user info
        userRequest.dataValues.requests = undefined; // Remove contacts from user info
        userRequest.dataValues.token = undefined; // Remove contacts from user info
        console.log('userRequest: DATOSSSSSSSSSSSSSSSSSS', userRequest);
        requestsList.push(userRequest?.dataValues);
      }
      console.log('userRequest: DATOSSSSSSSSSSSSSSSSSS', userRequest);
      requestsList.push(userRequest?.dataValues);


    }
    res.status(200).send(requestsList);
    
  

  }
});

// =================================================================
// * Messages and socket.io*
// =================================================================

const savecontacts = (user: any, userIdContact: number|undefined, usernameContact: string|undefined, currentRoom: any) => {

  if(userIdContact === undefined || usernameContact === undefined){
    return;
  }

  // funcion para guardar los contactos en la base de datos
  if (user && user.contacts) {
    let contacts = JSON.parse(user.contacts);

    if (typeof contacts === 'string') {
      contacts = JSON.parse(contacts);
    }
    const contact = {id: userIdContact, username: usernameContact, room: currentRoom };
    if (!contacts.some((c: any) => c.username === contact.username && c.room === contact.room && c.id === contact.id)) {
      // se verifica si el contacto ya esta en la lista de contactos
      contacts.push(contact);
      user.setcontacts(contacts);
      user.save().then(() => {
        console.log('Los cambios han sido guardados exitosamente.');
      });
    } else {
      console.log('Ya esta en con el contacto');
    }
  }
};
interface WaitingUser {
  userID: string;
  socket: string;
  // Otras propiedades si las hay
}
let waitingUser: WaitingUser | null = null; // Para manejar usuarios en espera
io.on('connection', (socket: Socket) => {
  console.log('sockets activoOOOOOOOOOOOOOOOOOOOOOOOOOOs:', io.sockets.sockets.size);
  const groups = socket.handshake.query.groups as string | undefined;
  const userID = socket.handshake.query.userID as number | undefined;
  const contacts = socket.handshake.query.contacts as string | undefined;

  if (typeof groups === 'string' && groups.trim()) {
    try {
      JSON.parse(groups).map((group: any) => {
        socket.join(group.name);
        console.log('User joined group:', group);
      });
    } catch (error) {
      console.error('Error parsing groups:', error);
    }
  }
  if (typeof contacts === 'string' && contacts.trim()) {
    try {
      JSON.parse(contacts).map((contact: any) => {
        if (contact.room) {
          socket.join(contact.room);
          console.log('User joined room:', contact.room);
        } else {
          console.log('No se encontro la sala');
        }
      });
    } catch (error) {
      console.error('Error parsing groups:', error);
    }
  }

  console.log('User connected:', socket.id);
  if (userID) {
    connectedUsers[userID] = socket.id;
    console.log(`Usuario registrado: ${userID} con socket ID: ${socket.id}`);
    console.log('Usuarios conectadossssssssssssssss:', connectedUsers);
  }

  // =================================================================
  // *Socket Join room*
  // =================================================================
  socket.on('join', async (data) => {
    const room = data.room; // Nombre de la sala a la que se une
    // const forContacts = data.forContacts;
    socket.join(room);
    console.log('salas', socket.rooms);
    console.log('Entra a una sala');
    console.log('Username:', data.username);

    // if(!forContacts){
    const user = await Users.findOne({
      where: {
        username: data.username,
      },
    });
    if (user && user.groups) {
      let groups = JSON.parse(user.groups);

      if (typeof groups === 'string') {
        groups = JSON.parse(groups);
      }
      const newgroup = { name: room };

      if (!groups.some((g: any) => g.name === newgroup.name)) {
        // se verifica si el grupo ya esta en la lista
        groups.push(newgroup);
        user.setgroups(groups);
        user
          .save()
          .then(() => {
            console.log('Los cambios han sido guardados exitosamente.');
            socket.emit('refreshgroups'); // se envia la señal para que se actualicen los grupos en tiempo real
          })
          .catch((error) => {
            console.error('Error al guardar los cambios: ', error);
          });
      } else {
        console.log('Ya esta en el grupo');
      }
    }
    // }
    socket.to(room).emit('notification', `${user ? user.username : 'null'} has entered the room.`);
    console.log(`${user ? user.username : 'null'} joined room: ${room}`);
  });
  // ======================*END Socket JOIN*===================

  // ==========================DECLINE REQUEST=======================================
  socket.on('decline_request', async (data: { senderId: string; receiverId: string }) => {
    const { senderId, receiverId } = data;
    console.log('Entra a DECLINE REQUEST');
    const userReceiver = await Users.findOne({
      where: {
        username: receiverId,
      },
    });

    if (userReceiver && userReceiver !== null && userReceiver.requests !== null) {
      const receiverSocketId = connectedUsers[userReceiver.id];
      let requestsReceiver = JSON.parse(userReceiver.requests);

      if (typeof requestsReceiver === 'string') {
        requestsReceiver = JSON.parse(requestsReceiver);
      }
      console.log('requestsReceiver:', requestsReceiver);
      const updatedRequests = requestsReceiver.filter((r: any) => r !== senderId);
      console.log('updatedRequests:', updatedRequests, 'el que envio fue:', senderId);
      userReceiver.setrequests(updatedRequests);
      userReceiver.save().then(() => {
        console.log('La solicitud ha sido eliminada exitosamente.');
        io.to(receiverSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen las solicitudes en tiempo real
      });
    } else {
      console.log('No se encontro el usuario');
    }
  });
  //===================================================================

  // ============================= DELETE CONTACT ====================================

  socket.on('deleteContact', async (data) => {
    const { username, contact } = data;
    const userA = await Users.findOne({
      where: {
        username: username,
      },
    });
    const userB = await Users.findOne({
      where: {
        id: contact.id,
      },
    });

    if (userA && userA !== null && userA.contacts !== null && userB && userB !== null && userB.contacts !== null) {
      const senderSocketId = connectedUsers[userA.id];
      const receiverSocketId = connectedUsers[userB.id];

      Contacts.destroy({
        // se elimina el contacto de la base de datos
        where: {
          userId: userA.id,
          contactId: userB.id,
        },
      });
      Contacts.destroy({
        where: {
          userId: userB.id,
          contactId: userA.id,
        },
      });

      let contactsUserA = JSON.parse(userA.contacts);
      let contactsUserB = JSON.parse(userB.contacts);
      if (typeof contactsUserA === 'string') {
        contactsUserA = JSON.parse(contactsUserA);
      }
      if (typeof contactsUserB === 'string') {
        contactsUserB = JSON.parse(contactsUserB);
      }
      contactsUserA = contactsUserA.filter((contactuserA: any) => contactuserA.room !== contact.room);
      contactsUserB = contactsUserB.filter((contactuserB: any) => contactuserB.room !== contact.room);
      userA.setcontacts(contactsUserA);
      userB.setcontacts(contactsUserB);
      userA.save();
      userB.save();
      console.log('Contacto eliminado');
      socket.leave(contact.room);
      io.to(receiverSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen los contactos en tiempo real
      io.to(senderSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen los contactos en tiempo real
    } else {
      console.log('No se encontro el contacto');
    }
  });

  // =================================================================

  // ============================= DELETE GROUP ====================================

  socket.on('deleteGroup', async (data) => {
    const { username, group } = data;
    console.log('username:', username);
    console.log('group:', group);
    const userA = await Users.findOne({
      where: {
        username: username,
      },
    });

    if (userA && userA !== null && userA.groups !== null) {
      let groupsUserA = JSON.parse(userA.groups);
      if (typeof groupsUserA === 'string') {
        groupsUserA = JSON.parse(groupsUserA);
      }
      groupsUserA = groupsUserA.filter((groupuserA: any) => groupuserA.name !== group.name);
      userA.setgroups(groupsUserA);
      userA.save();
      console.log('Grupo eliminado');
      socket.leave(group.name);
      socket.emit('refreshgroups'); // se envia la señal para que se actualicen los grupos en tiempo real
    } else {
      console.log('No se encontro el grupo');
    }
  });

  // =================================================================

  // *join_random_room*
  socket.on('random_zalk', async (userID) => {
    if (waitingUser && waitingUser.userID !== userID) {
      const userA = await Users.findOne({
        where: {
          id: userID,
        },
      });
      const userB = await Users.findOne({
        where: {
          id: waitingUser.userID,
        },
      });
      if (!userA || !userB) {
        console.log(`User ${userID} or ${waitingUser.userID} not found`);
        waitingUser = { userID: userID, socket: socket.id };
        return;
      }
      const room = `room_${waitingUser}_${socket.id}`;
      socket.join(room);
      io.sockets.sockets.get(waitingUser.socket)?.join(room);
      io.to(waitingUser.socket).emit('room_assigned', room, userA.username, userID);
      socket.emit('room_assigned', room, userB.username, waitingUser.userID);
      console.log(`Room assigned to ${userID} and ${waitingUser.userID}`);
      waitingUser = null; // Limpiar el usuario en espera
    } else {
      waitingUser = { userID: userID, socket: socket.id };
      console.log(`User ${userID} is waiting for a room`);
    }
  });

  // =================================================================
  // *leave to waitingUser*

  socket.on('leave_waiting', (userID) => {
    if (waitingUser && waitingUser.userID === userID) {
      waitingUser = null;
      console.log(`User ${userID} has left the waiting room`);
    }
  });
  // =================================================================

  // *LeaveRoom*
  socket.on('leave_room', (room, theOtherUserID) => {
    const usersocket = connectedUsers[theOtherUserID];
    io.sockets.sockets.get(usersocket)?.leave(room);
    socket.leave(room);

    io.to(usersocket).emit('CloseConection');

    console.log('User left room:', room);
  });
  //================================================================

  // *Socket send request*
  // =================================================================
  socket.on('send_request', async (data: { senderId: string; receiverId: string; message: string }) => {
    const { senderId, receiverId, message } = data;

    const userA = await Users.findOne({
      where: {
        id: receiverId,
      },
    });

    const userB = await Users.findOne({
      where: {
        username: senderId,
      },
    });
    if (userA && userA !== null && userA.requests !== null && userB && userB !== null && userB.requests !== null) {
      const receiverSocketId = connectedUsers[userA.id];

// Si el usuario ya esta en las solicitudes no se envia la notificacion y se agregan a la lista de contactos
      let RequestSender= JSON.parse(userB.requests);

      if (typeof RequestSender === 'string') {
        RequestSender = JSON.parse(RequestSender);
      }

      if(RequestSender.includes(userA.id)){
        socket.emit('accept_request', { senderId: userB.id, receiverId: userA.username });
       
        console.log('Ya esta en las solicitudes');
       
       return;
      }


      // se envia la notificacion al dispositivo del usuario
      await requestNotification(senderId,userA.token, message);
      console.log('Notification sent');
      // ==============================================

      let requestsA = JSON.parse(userA.requests);

      if (typeof requestsA === 'string') {
        requestsA = JSON.parse(requestsA);
      }
      const newrequest = userB.id;
      if (!requestsA.includes(newrequest)) {
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_request', { userIdSender: userB.id, senderId, message }); // se envia la señal para que se actualicen las solicitudes en tiempo real
          console.log(`Solicitud enviada de ${senderId} a ${receiverId}`);
        }
        // se verifica si la solicitud ya esta en la lista
        requestsA.push(newrequest);
        userA.setrequests(requestsA);
        userA.save().then(() => {
          console.log('La solicitud ha sido guardada exitosamente.');
          io.to(receiverSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen las solicitudes en tiempo real
        });
      } else {
        console.log('Ya esta en las solicitudes');
      }

    }
  });
  // ======================*END Socket send request*===================

  // =================================================================
  // *Socket Accept Request*
  // =================================================================


  //VOY AQUI 
  socket.on('accept_request', async (data: { senderId: number; receiverId: string }) => {
    const { senderId, receiverId } = data;
    console.log('Entra a ACCEPT REQUEST');

    const userSender = await Users.findOne({
      where: {
        id: senderId,
      },
    });

    const userReceiver = await Users.findOne({
      where: {
        username: data.receiverId,
      },
    });
    const currentRoom = `${userSender?.username}-${receiverId}`;


    savecontacts(userSender,userReceiver?.id, data.receiverId, currentRoom);
    savecontacts(userReceiver,userSender?.id, userSender?.username, currentRoom);

    if (userSender && userReceiver) {
      const senderSocketId = connectedUsers[userSender.id];
      const senderSocket = io.sockets.sockets.get(senderSocketId);
      Contacts.create({
        userId: userSender.id,
        contactId: userReceiver.id,
        room: currentRoom,
      });
      Contacts.create({
        userId: userReceiver.id,
        contactId: userSender.id,
        room: currentRoom,
      });
      io.to(senderSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen los contactos en tiempo real

      if (senderSocket) {
        senderSocket.join(currentRoom);
      }
    }

    if (userReceiver !== null) {
      const receiverSocketId = connectedUsers[userReceiver.id];
      const receiverSocket = io.sockets.sockets.get(receiverSocketId);
      if (receiverSocket) {
        receiverSocket.join(currentRoom);

        let requestsReceiver = JSON.parse(userReceiver.requests);

        if (typeof requestsReceiver === 'string') {
          requestsReceiver = JSON.parse(requestsReceiver);
        }

        const updatedRequests = requestsReceiver.filter((r: any) => r !== senderId);
        userReceiver.setrequests(updatedRequests);
        userReceiver.save().then(() => {
          console.log('La solicitud ha sido Aceptado exitosamente.');
          io.to(receiverSocketId).emit('refreshcontacts'); // se envia la señal para que se actualicen las solicitudes en tiempo real
        });
      }
    }
    console.log(`Solicitud aceptada de ${receiverId} a ${senderId}`);
  });
  // ======================*END Socket accept request*===================

  // =================================================================
  // *Socket send audio*
  // =================================================================

  socket.on('send-audio', async(audioData, room) => {
    // Emitir el audio recibido a todos los demás clientes conectados
    socket.to(room).emit('receive-audio', audioData, room);
    console.log('Audio data sent to all clients in room:', room);
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (roomSockets) {
      const roomSocketsArray = Array.from(roomSockets);
        console.log('roomSocketsArray:', roomSocketsArray);

        //si es array de sockets se recorre y se envia la notificacion a cada uno

        for(const socketId of roomSockets){
          console.log('socketId:', socketId );
          const userId = Object.keys(connectedUsers).find(key => connectedUsers[key] === socketId);
          const user = await Users.findOne({
            where: {
              id: userId,
            },
          });
          if(user&& user.token){
            console.log('user:', user.username);
            await AudioNotification(user.username, user.token, audioData);
            }
          } 
    } else {
      
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected del socket: ${socket.id} for ${reason}`);
    for (const id in connectedUsers) {
      if (connectedUsers[id] === socket.id) {
        delete connectedUsers[id];
        console.log(`Usuario desconectado: ${id}`);
        break;
      }
    }
  });
});

// ======================*END Socket send audio*===================

// socket.on('leaveAllRooms', (username) => {
//   const rooms = socket.rooms; // O cualquier otra lógica para identificar al usuario

//   // Iterar sobre todas las salas a las que el usuario está unido
//   for (let room of rooms) {
//     // Asegurarse de no sacar al usuario de su propia sala de socket
//     if (room !== socket.id) {
//       socket.leave(room);
//       console.log(`${username} left room ${room}`);
//     }
//   }

//   // Aquí puedes emitir un evento de confirmación si es necesario
//   // Por ejemplo, para confirmar que el usuario ha salido de todas las salas
//   socket.emit('leftAllRooms', { success: true });
// });

// =================================================================
// *Solicitudes de amistad*
// =================================================================

//==== fin solicitudes de amistad ===================================

// =================================================================
// *Profile picture upload*
// =================================================================





// // Crear la carpeta 'uploads' si no existe
// const uploadDir = path.join(__dirname, 'uploads');
// console.log('Upload directory:', uploadDir); // Log para verificar la ruta de la carpeta
// if (!fs.existsSync(uploadDir)) {
//   console.log('Creating upload directory...');
//   fs.mkdirSync(uploadDir);
// } else {
//   console.log('Upload directory already exists');
// }

// // Configuración de multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); // Usar la ruta absoluta de la carpeta 'uploads'
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function checkS3Connection() {
  try {
    const result = await s3.send(new ListBucketsCommand({}));
    console.log('Successfully connected to S3. Buckets:', result.Buckets);
  } catch (error) {
    console.error('Failed to connect to S3:', error);
  }
}

const upload = multer().single('file');
// Endpoint para manejar la carga de archivos
app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log('Error uploading file:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Subir el archivo a S3
    const bucketName = process.env.S3_BUCKET_NAME;
    const fileName = `${Date.now().toString()}-${req.file.originalname}`; // Nombre único para el archivo

    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName, // Nombre del archivo en S3
        Body: req.file.buffer, // El archivo en formato buffer
        ContentType: req.file.mimetype, // Tipo de archivo
      });

      // Ejecutar la subida del archivo
      await s3.send(uploadCommand);

      // Construir la URL del archivo
      const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      console.log('File uploaded to:', fileUrl);
      res.status(200).json({ fileUrl });
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      res.status(500).json({ error: 'Error uploading file to S3' });
    }
  });
});

checkS3Connection();

// Endpoint para guardar la URL de la imagen en la base de datos
app.post('/save-image-url', async (req, res) => {
  console.log('Entrando a save-image-url');
  const { profilePicture, userId } = req.body;
  try {
    console.log(`Updating user ${userId} with profile picture URL: ${profilePicture}`);

    const user = await Users.findOne({ where: { id: userId } });

    if (user) {
      user.profilePicture = profilePicture;
      await user
        .save()
        .then(() => {
          console.log('User profile picture updated successfully.');
        })
        .catch((error) => {
          console.error('Error updating user profile picture:', error);
        });
    }

    const updatedUser = await Users.findByPk(userId);
    console.log('Updated user profile picture:', updatedUser?.profilePicture);

    res.status(200).json({ message: 'Image URL saved successfully' });
  } catch (error) {
    console.log('Failed to save image URL:', error);
    res.status(500).json({ error: 'Failed to save image URL' });
  }
});

app.get('/get-image-url/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await Users.findByPk(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('user:', user);
    res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error: any) {
    console.log('Error getting image URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Servir archivos estáticos desde la carpeta 'uploads'
// app.use('/uploads', express.static(uploadDir));

// ================= * END Profile picture upload* ===================================

const initialRooms = [
  // se crean las salas iniciales
  { name: 'ChatterBox Central', info: 'A lively place for all your chat needs.' },
  { name: 'Tribu de Vibraciones', info: 'Únete a la tribu y comparte las vibraciones.' },
  { name: 'Tech Talk', info: 'Discuss the latest in technology.' },
  { name: 'Café Literario', info: 'Comparte tus libros y autores favoritos.' },
  { name: 'Gaming Hub', info: 'Connect with fellow gamers.' },
  { name: 'Cocina Creativa', info: 'Intercambia recetas y trucos de cocina.' },
  { name: 'Fitness Freaks', info: 'Share your fitness journey.' },
  { name: 'Arte y Cultura', info: 'Explora el mundo del arte y la cultura.' },
  { name: 'Music Mania', info: 'Discuss your favorite music and artists.' },
  { name: 'Cine Club', info: 'Habla sobre tus películas favoritas.' },
  { name: 'Travel Tales', info: 'Share your travel experiences.' },
  { name: 'Jardinería Urbana', info: 'Consejos y trucos para jardineros urbanos.' },
  { name: 'Science Geeks', info: 'Discuss the latest in science.' },
  { name: 'Fotografía', info: 'Comparte tus mejores fotos y técnicas.' },
  { name: 'Bookworms', info: 'Discuss your favorite books.' },
  { name: 'Deportes', info: 'Habla sobre tus deportes favoritos.' },
  { name: 'Coding Corner', info: 'Discuss programming and coding.' },
  { name: 'Viajeros', info: 'Comparte tus experiencias de viaje.' },
  { name: 'Pet Lovers', info: 'Share stories about your pets.' },
  { name: 'Manualidades', info: 'Intercambia ideas de manualidades.' },
  { name: 'Movie Buffs', info: 'Discuss your favorite movies.' },
  { name: 'Historia', info: 'Explora eventos históricos.' },
  { name: 'Health & Wellness', info: 'Share health and wellness tips.' },
  { name: 'Música', info: 'Habla sobre tus artistas y canciones favoritas.' },
  { name: 'Entrepreneurs', info: 'Discuss business ideas and startups.' },
  { name: 'Ciencia', info: 'Discute los últimos avances científicos.' },
  { name: 'Photography Pros', info: 'Share photography tips and tricks.' },
  { name: 'Tecnología', info: 'Habla sobre las últimas tecnologías.' },
  { name: 'Art Enthusiasts', info: 'Discuss art and culture.' },
  { name: 'Cineastas', info: 'Comparte tus proyectos de cine.' },
  { name: 'Foodies', info: 'Discuss your favorite foods and recipes.' },
  { name: 'Deportes Extremos', info: 'Comparte tus aventuras extremas.' },
  { name: 'Nature Lovers', info: 'Discuss nature and wildlife.' },
  { name: 'Historia y Cultura', info: 'Explora la historia y la cultura.' },
  { name: 'Tech Innovators', info: 'Discuss tech innovations.' },
  { name: 'Cocina Internacional', info: 'Comparte recetas de todo el mundo.' },
  { name: 'Fitness Enthusiasts', info: 'Share fitness tips and routines.' },
  { name: 'Viajes y Aventuras', info: 'Comparte tus aventuras de viaje.' },
  { name: 'Music Lovers', info: 'Discuss your favorite music.' },
  { name: 'Arte Moderno', info: 'Explora el arte moderno.' },
  { name: 'Science Buffs', info: 'Discuss scientific discoveries.' },
  { name: 'Cultura Pop', info: 'Habla sobre la cultura pop.' },
  { name: 'Book Club', info: 'Join our book discussions.' },
  { name: 'Juegos de Mesa', info: 'Comparte tus juegos de mesa favoritos.' },
  { name: 'Travel Enthusiasts', info: 'Share travel tips and stories.' },
  { name: 'Cine Independiente', info: 'Explora el cine independiente.' },
  { name: 'Pet Care', info: 'Discuss pet care tips.' },
  { name: 'Cocina Saludable', info: 'Comparte recetas saludables.' },
  { name: 'Movie Critics', info: 'Discuss and review movies.' },
  { name: 'Deportes Electrónicos', info: 'Habla sobre eSports.' },
  { name: 'Health Gurus', info: 'Share health advice.' },
  { name: 'Fotografía Digital', info: 'Comparte técnicas de fotografía digital.' },
  { name: 'Startup Hub', info: 'Discuss startup ideas.' },
  { name: 'Cultura y Sociedad', info: 'Explora la cultura y la sociedad.' },
  { name: 'Tech Enthusiasts', info: 'Discuss tech trends.' },
  { name: 'Cine Clásico', info: 'Habla sobre el cine clásico.' },
  { name: 'Fitness Tips', info: 'Share fitness tips.' },
  { name: 'Viajes Internacionales', info: 'Comparte tus viajes internacionales.' },
  { name: 'Music Fans', info: 'Discuss music trends.' },
  { name: 'Arte Urbano', info: 'Explora el arte urbano.' },
  { name: 'Science Nerds', info: 'Discuss science topics.' },
  { name: 'Cultura Geek', info: 'Habla sobre la cultura geek.' },
  { name: 'Book Enthusiasts', info: 'Discuss books and authors.' },
  { name: 'Juegos de Rol', info: 'Comparte tus juegos de rol favoritos.' },
  { name: 'Travel Guides', info: 'Share travel guides and tips.' },
  { name: 'Cine de Terror', info: 'Explora el cine de terror.' },
  { name: 'Pet Enthusiasts', info: 'Share pet stories.' },
  { name: 'Cocina Vegana', info: 'Comparte recetas veganas.' },
];

sequelize.sync({ alter: true }).then(() => {
  server.listen(3000, async () => {
    console.log('Server running...');

    // //create groups
    // for (const room of initialRooms) {
    //   await Rooms.upsert(room);
    //   console.log("Room created:", room);
    // }
  });
});
