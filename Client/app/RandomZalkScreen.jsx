import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import AudioComponent from '../components/shared/AudioComponent';
import { useSocket } from '../context/SocketContext';
import { useNavigation } from '@react-navigation/native';
import { useThemeColor } from '../hooks/useThemeColor';
import { useRoute } from '@react-navigation/native';
import { showAlert } from '../components/shared/ShowAlert';
import { useLanguage } from '../context/LanguageContext';
import { AppState, AppStateStatus } from 'react-native';

export default function RandomZalkScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const socket = useSocket();
  const [isStarted, setIsStarted] = useState(false);
  const [RandomUser, setRandomUser] = useState(route.params.randomUser);
  const [connectedUsers, setConnectedUsers] = useState(0);
  // const [RandomUser, setRandomUser] = useState({});
  const [isConectionClose, setIsConectionClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutos en segundos
  const RZ_Gradient_1 = useThemeColor({}, 'RZ_Gradient_1');
  const RZ_Gradient_2 = useThemeColor({}, 'RZ_Gradient_2');
  const RZ_Gradient_3 = useThemeColor({}, 'RZ_Gradient_3');
  const ActiveButtonColor = useThemeColor({}, "AudioComponent_ActiveButtonColor");
  const { Texts } = useLanguage();
  const { height, width } = useWindowDimensions();
  // Define responsive sizes
  const sizeInside = height < 800 ? 32 : 52;
  const sizeOutside = height < 800 ? 44 : 64;
  const iconSize = height < 800 ? 72 : 128;
  const TitleSize = width < 400 ? "2xl" : "3xl";
  const ConnPaddingSize = height < 800 ? 3 : 6;
  const mb = height < 800 ? 3 : 6;
  const AudioCancelButtonMT = height < 800 ? "3" : "6";
  const EndConButtonBottom = height < 800 ? "5" : "10";
  const [appState, setAppState] = useState(AppState.currentState);

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
      navigation.navigate('RandomZalk');
      showAlert('Connection closed', 'The other person closed the connection', 'OK');
    }
  }, [isConectionClose]);

  const closeConnection = () => {
    setIsConectionClose(true);
    setTimeLeft(3 * 60);
    socket.emit('leave_room', RandomUser.room, RandomUser.userID);
    navigation.navigate("RandomZalk");
  };

  // ===== AppState =====
  useEffect(() => {
    if (socket != null) {
      const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'background') {
          onBackground();
        }
      };
      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        subscription.remove();
      };
    }
  }, [appState, socket]);

  const onBackground = () => {
    console.log('La app ha vuelto al primer plano.');
    closeConnection();

  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      closeConnection();
    });

    return unsubscribe;
  }, [navigation]);



  return (
    <LinearGradient
      // Gradiente radial en tonos lila
      colors={[RZ_Gradient_1, RZ_Gradient_2, RZ_Gradient_3]}
      style={tw`flex-1 justify-between items-center`}
      start={{ x: 0.5, y: 0.5 }}  // Radial desde el centro
      end={{ x: 0.9, y: 0.9 }}
      locations={[0, 0.5, 1]}
    >
      <View style={tw`flex-1 items-center p-6 w-full`}>
        {/* Título principal */}
        <Text style={tw`text-${TitleSize} font-bold text-white mb-4 tracking-wide`}>
          {Texts.RZConnected}
        </Text>

        {/* Bloque de usuario */}
        <View style={tw`bg-white bg-opacity-10 rounded-lg p-${ConnPaddingSize} mb-${mb} w-full max-w-sm shadow-md`}>
          <Text style={tw`text-xl text-gray-100 mb-1 text-center`}>
            {Texts.RZConnectedWith}
          </Text>
          <Text style={tw`text-2xl text-blue-300 font-semibold text-center`}>
            {RandomUser.username?.substring(0, 1)}*******
          </Text>
        </View>

        {/* Temporizador */}
        <Text style={tw`text-4xl text-white font-semibold mb-${mb} tracking-widest`}>
          {formatTime(timeLeft)}
        </Text>

        {/* Componente de audio */}
        <View style={tw`w-full max-w-md`}>
          <AudioComponent currentRoom={RandomUser.room} isConectionClose={isConectionClose} sizeInside={sizeInside} sizeOutside={sizeOutside} iconSize={iconSize} cancelButtonMT={AudioCancelButtonMT} />
        </View>

        {/* Botón para cerrar conexión */}
        <TouchableOpacity
          style={tw`bg-[${ActiveButtonColor}] rounded-full py-3 px-10 shadow-lg w-full max-w-xs absolute bottom-${EndConButtonBottom}`}
          onPress={closeConnection}
        >
          <Text style={tw`text-white text-lg text-center`}>
            {Texts.RZEndButton}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
