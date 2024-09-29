import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import AudioComponent from '../components/shared/AudioComponent';
import { useSocket } from '../components/context/SocketContext';
import { useNavigation } from '@react-navigation/native';
import { useThemeColor } from '../hooks/useThemeColor';
import { useRoute } from '@react-navigation/native';
import { showAlert } from '../app/shared/ShowAlert';

export default function RandomZalkScreen() {
  const route = useRoute();
  const navigator = useNavigation();
  const socket = useSocket();
  const [isStarted, setIsStarted] = useState(false);
  const [RandomUser,setRandomUser]= useState(route.params.randomUser);
  const [connectedUsers, setConnectedUsers] = useState(0);
  // const [RandomUser, setRandomUser] = useState({});
  const [isConectionClose, setIsConectionClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutos en segundos
  const RZ_Gradient_1 = useThemeColor({}, 'RZ_Gradient_1');
  const RZ_Gradient_2 = useThemeColor({}, 'RZ_Gradient_2');
  const RZ_Gradient_3 = useThemeColor({}, 'RZ_Gradient_3');

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  useEffect(() => {
    console.log('RandomUser PASADO POR PARAMETRO', RandomUser);
    if (socket != null) {
      socket.on('CloseConection', () => {
        console.log('Cerrando conexion');
        setIsConectionClose(true);
        setTimeLeft(3 * 60);
      });

      // socket.on('room_assigned', (room, username, userID) => {
      //   console.log('Room assigned', room, username, userID);
      //   setRandomUser({ room, username, userID });
      //   setTimeout(() => {
      //     if (!isConectionClose) {
      //       setIsConectionClose(true);
      //       setTimeLeft(3 * 60);
      //       socket.emit('leave_room', RandomUser.room, RandomUser.userID);
      //     }
      //   }, timeLeft * 1000);
      // });
    }
  }, [socket]);

  useEffect(() => {
    if (RandomUser.room && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [RandomUser, timeLeft]);

  useEffect(() => {
    if (isConectionClose) {
      setIsStarted(false);
      setRandomUser({});
      navigator.navigate('RandomZalk');
      showAlert('Connection closed', 'The other person closed the connection', 'OK');
    }
  }, [isConectionClose]);

  const closeConnection = () => {
    setIsConectionClose(true);
    setTimeLeft(3 * 60);
    socket.emit('leave_room', RandomUser.room, RandomUser.userID);
    navigator.navigate("RandomZalk");
  };

  return (
    <LinearGradient
    // Gradiente radial en tonos lila
    colors={[RZ_Gradient_1, RZ_Gradient_2, RZ_Gradient_3]}
    style={tw`flex-1 justify-between items-center`}
    start={{ x: 0.5, y: 0.5 }}  // Radial desde el centro
    end={{ x: 0.9, y: 0.9 }}
    locations={[0, 0.5, 1]}
  >
    <View style={tw`flex-1 justify-center items-center p-6 w-full`}>
      {/* Título principal */}
      <Text style={tw`text-4xl font-bold text-white mb-4 tracking-wide`}>
        You're Connected!
      </Text>

      {/* Bloque de usuario */}
      <View style={tw`bg-white bg-opacity-10 rounded-lg p-6 mb-8 w-full max-w-sm shadow-md`}>
        <Text style={tw`text-xl text-gray-100 mb-1 text-center`}>
          Connected with:
        </Text>
        <Text style={tw`text-3xl text-blue-300 font-semibold text-center`}>
          {RandomUser.username?.substring(0, 2)}********
        </Text>
      </View>

      {/* Temporizador */}
      <Text style={tw`text-5xl text-white font-semibold mb-8 tracking-widest`}>
        {formatTime(timeLeft)}
      </Text>

      {/* Componente de audio */}
      <View style={tw`w-full max-w-md mb-8`}>
        <AudioComponent currentRoom={RandomUser.room} isConectionClose={isConectionClose} />
      </View>

      {/* Botón para cerrar conexión */}
      <TouchableOpacity
        style={tw`bg-red-500 rounded-full py-3 px-10 shadow-lg w-full max-w-xs`}
        onPress={closeConnection}
      >
        <Text style={tw`text-white text-lg text-center`}>
          End Conversation
        </Text>
      </TouchableOpacity>
    </View>
  </LinearGradient>
  );
}
