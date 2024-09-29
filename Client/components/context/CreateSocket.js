// // components/context/CreateSocket.js
// import { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
// import getEnvVars from '../../config';

// const { SOCKET_URL } = getEnvVars();
// const { SERVER_URL } = getEnvVars();

// const createSocket = (isLoggedIn, username) => {
//   const [socket, setSocket] = useState(null);
//   const socketRef = useRef(null); // Usamos useRef para guardar la referencia del socket

//   useEffect(() => {
//     if (isLoggedIn && username && !socketRef.current) { // Solo crear socket si no existe uno
//       // axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
//       axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
//       .then((res) => {
//           const newsocket = io(SOCKET_URL, { query: { groups: res.data.user.groups, contacts: res.data.user.contacts, username: res.data.user.username } });
//           socketRef.current = newsocket; // Guardar la referencia del socket
//           setSocket(newsocket);
//           console.log('Conectado socket desde createSocket', newsocket);
//         })
//         .catch((error) => { console.log(error) });

//       return () => {
//         if (socketRef.current) {
//           console.log('Desconectando socket desde createSocket');
//           socketRef.current.disconnect(); // Desconectar socket si existe
//           socketRef.current = null; // Reiniciar la referencia del socket
//         }
//       };
//     }
//   }, [isLoggedIn, username]);

//   return socket;
// };

// export default createSocket;
