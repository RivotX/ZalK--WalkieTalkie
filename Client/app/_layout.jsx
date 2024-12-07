//Client/app/_layout.jsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import tw from 'twrnc';
import { Image, View, Text,AppState , SafeAreaView, TouchableOpacity, Modal, Alert } from 'react-native';
import ProfileIcon from '../assets/images/images.png';
import LoginScreen from './LoginScreen';
import ConfigIcon from '../components/shared/ConfigIcon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeColor } from '../hooks/useThemeColor';
import UserProfileMiniModal from '../components/modals/UserProfileMiniModal';
import UserProfileModal from '../components/modals/UserProfileModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketProvider } from '../context/SocketContext';
import groupicon from '../assets/images/groupicon.png';
import NotificationsIcon from '../components/shared/NotificationsIcon';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import Loading from '../components/shared/Loading';
import getEnvVars from '../config';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av'; // Para reproducir audio
const { SERVER_URL, SOCKET_URL } = getEnvVars();
import * as Font from 'expo-font';
const loadFonts = async () => {
  await Font.loadAsync({
    Zalk: require('../assets/fonts/AppleTea-z8R1a.ttf'), // Asegúrate de que la ruta sea correcta
  });
};
import { LanguageProvider } from '../context/LanguageContext';
import { useLanguage } from '../context/LanguageContext';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { BusyProvider, useBusy } from '../context/BusyContext'; // Importa el BusyProvider y el hook useBusy
import { useNavigation } from '@react-navigation/native';

function RootLayout() {
  const [modalIconVisible, setModalIconVisible] = useState(false);
  const [userProfileModalSC, setUserProfileModalSC] = useState(false);
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const RZ_Gradient_1 = useThemeColor({}, 'RZ_Gradient_1');
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(true);
  const [userID, setUserID] = useState(null);
  const [info, setInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { Texts } = useLanguage();
  const { isBusy, setIsBusy } = useBusy();
  
  const navigation = useNavigation();
  const [appState, setAppState] = useState(AppState.currentState);


  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);


  //=================================================
// Configuración del manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // Si no deseas mostrar un alerta
    shouldPlaySound: true,  // Si deseas reproducir sonido
    shouldSetBadge: false,
  }),
});

// Escucha las notificaciones recibidas
Notifications.addNotificationReceivedListener(async (notification) => {
  const {data} = notification.request.content.data;

  if (data) {
    // Reproduce el audio en segundo plano
    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
    await sound.playAsync(); // Reproduce el audio
  }
});
  //=================================================


  const handleAppStateChange = (nextAppState) => {
    setAppState(nextAppState);
    console.log('AppState:', nextAppState);
  };

  console.log('SERVER_URL:', SERVER_URL);
  console.log('SOCKET_URL:', SOCKET_URL);

  // ===== Changes the background color of the app =====
  setBackgroundColorAsync(backgroundColor);

  // ===== Loads the custom font =====
  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
    // registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  }, []);

  // ===== Creates socket connection for the user =====
  const createSocket = () => {
    if (isLoggedIn && username) {
      axios
        .get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => {
          const newsocket = io(SOCKET_URL, { query: { groups: res.data.user.groups, contacts: res.data.user.contacts, userID: res.data.user.id } });
          setSocket(newsocket);
          console.log('Conectado socket desde createSocket', newsocket);
        })
        .catch((error) => {
          console.log(error);
        });

    }
  };

  // ===== Skips the login if the user is already logged in ========
  useEffect(() => {
    const checkLoginStatus = async () => {
      console.log('Checking login status');
      let loggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (loggedIn === 'true') {
        SetLayoutLogged(true);
      }
    };

    checkLoginStatus();
  }, []);

  // ===== Gets the state from the login screen =======
  const SetLayoutLogged = async (value) => {
    setIsLoggedIn(value);
    console.log('pulso el boton de login');
  };

  const getsession = async () => {
    console.log('Socket en RootLayout', socket);
    console.log('isloggedin en RootLayout', isLoggedIn);
    if (isLoggedIn /*&& !socketCreated */) {
      axios
        .get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => {
          setUsername(res.data.user.username);
          setUserID(res.data.user.id);
          setInfo(res.data.user.info);
          setProfilePicture(res.data.user.profilePicture);
          console.log('SE LOGUEO CORRECTAMENTE EL USUARIO', res.data.user);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    console.log('Recieve audio, isbusy: ', isBusy);
        if (isBusy === false && socket) {
      socket.on('receive-audio', async (base64Audio, room) => {
        
          console.log('Received audio data from room', room);

          // Asegúrate de que el base64Audio no esté corrupto
          if (!base64Audio || base64Audio.length === 0) {
            console.error('Audio data is empty or corrupted');
            return;
          }

          const uri = `data:audio/mp3;base64,${base64Audio}`;
          console.log('audio enviado', uri);

          if (appState === 'active') {
          try {
            const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
            await sound.setVolumeAsync(1.0);
            await sound.playAsync();
            console.log('Playing sound');
            // Alert.alert('playing sound');
            // Schedule a notification
          } catch (error) {
            Alert.alert('Error playing sound', error);
            console.error('Error playing sound:', error);
          }
          }
        
      });
      }else{
        console.log('No se puede recibir audio porque esta ocupado');
        if (socket){
        socket.off('receive-audio');
      }
      }
  }, [isBusy, socket]);

  // ===== Gets the user data when the user is logged in =======
  useEffect(() => {
    getsession();
    console.log('isLoggedIn en RootLayout', isLoggedIn);
  }, [isLoggedIn]);

  // ===== Logout the user =======
  const handleLogout = async () => {
    axios
      .post(`${SERVER_URL}/logout`, {}, { withCredentials: true })
      .then((res) => {
        if (socket) {
          socket.disconnect();
          console.log('Socket desconectado en logout');
          setIsSocketConnected(false);
        }
        AsyncStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // ===== Creates the socket connection when the user is logged in =======
  useEffect(() => {
    console.log('Socket y isloggedIn y usuario', socket, isLoggedIn, username || 'nohay');
    if (username && isLoggedIn /* && !socketCreated*/) {
      createSocket();
      console.log('ENTRA A CREAR EL SOCKET CUANDO USERNAME ES', username, 'y el socket es ', socket);
    }
  }, [username]);

  // ===== Refreshes the user session when the socket is connected =======
  
  const receiveAudio = async () => {
    
      }

  useEffect(() => {
    if (socket != null) {
      console.log('Socket creado en RootLayout', socket);
      socket.on('connect', () => {
        console.log('ESTA CONECTADO');
      });
      setLoading(false);
      setIsSocketConnected(true);
      socket.on('refreshcontacts', () => {
        console.log('refreshing session in RootLayout');
        axios
          .post(`${SERVER_URL}/refreshSession`, { id: userID }, { withCredentials: true })
          .then((res) => {
            setUsername(res.data.user.username);
            setInfo(res.data.user.info);
            setProfilePicture(res.data.user.profilePicture);
            console.log('setProfilePicture en layout ', res.data.user.profilePicture);
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => { 
            setLoading(false);
          });
      });

      
    }
  }, [socket]);

  const fetchIsBusy = async () => {
    if (!userID) return;
    try {
      axios.post(`${SERVER_URL}/getIsBusy`, { userId: userID })
      .then((res) => { 
        console.log('isBusy en fetchIsBusy', res.data);
        setIsBusy(res.data);
      });
    } catch (error) {
      console.error('Error fetching isBusy:', error);
    }
  };
  
  
  
  // ===== Fetches the user profile picture and isBusy =======
  useEffect(() => {
    fetchProfilePicture();
    console.log('fetchProfilePicture layout');
    fetchIsBusy();
  }, [userID]);

  const fetchProfilePicture = async () => {
    if (!userID) return;
    try {
      console.log('userID: ', userID);
      const response = await axios.get(`${SERVER_URL}/get-image-url/${userID}`);
      setProfilePicture(response.data.profilePicture);
      console.log('response.data.profilePicture xx', response.data.profilePicture);
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  };

  useEffect(() => {
    console.log('Profile picture: xx', profilePicture);
  }, [profilePicture]);

  if (!fontsLoaded) {
    return (
      <Modal animationType="fade" transparent={true} onRequestClose={() => { }}>
        <View style={[tw`flex-1 justify-center items-center`]}>
          <Loading />
        </View>
      </Modal>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {loading && (
          <Modal animationType="fade" transparent={true} onRequestClose={() => { }}>
            <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
              <Loading />
            </View>
          </Modal>
        )}
        {/* LoggedIn App*/}
        {isLoggedIn && socket ? (
          <SocketProvider socket={socket}>
            <Stack screenOptions={{ animation: 'slide_from_right' }}>
              {/* Tabs folder screens */}
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerTitle: () => (
                    <View style={tw`flex-row justify-between items-center w-full`}>
                      <TouchableOpacity style={tw`flex-row items-center w-[68%]`} onPress={() => setModalIconVisible(true)}>
                        <TouchableOpacity onPress={() => {
                          const user = { name: username, profile: profilePicture ?? null };
                          navigation.navigate("ProfilePictureScreen", { user: user, isContact: true });
                        }}>
                          <Image source={profilePicture ? { uri: profilePicture } : ProfileIcon} style={tw`size-9 mr-2 rounded-full`} />
                        </TouchableOpacity>
                        <UserProfileModal
                          user={{ name: username, info: info, profile: profilePicture ?? null }}
                          modalIconVisible={modalIconVisible}
                          setModalIconVisible={setModalIconVisible}
                          iconSize={12}
                          isContact={true}
                        />
                        <Text style={tw`text-base font-semibold text-[${textColor}]`}>{username} </Text>
                        {isBusy && <Ionicons name="notifications-off" size={18} color="red" />}
                      </TouchableOpacity>
                      <View style={tw`flex-row w-1/4 mr-[26px]`}>
                        <NotificationsIcon />
                        <ConfigIcon handleLogout={handleLogout} />
                      </View>
                    </View>
                  ),
                  headerTitleAlign: 'center',
                  headerStyle: tw`bg-[${SoftbackgroundColor}]`,
                }}
                initialParams={{ userID: userID }}
              />
              {/* Add contacts */}
              <Stack.Screen
                name="AddContactsScreen"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor,
                  },
                  headerTintColor: textColor,
                  headerTitle: Texts.AddContacts,
                }}
              />
              {/* Add groups */}
              <Stack.Screen
                name="AddGroupsScreen"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor, 
                  },
                  headerTintColor: textColor,
                  headerTitle: Texts.AddGroups,
                }}
              />
              {/* Chat rooms | Private chats or groups */}
              <Stack.Screen
                name="ChatScreen"
                options={({ route }) => {
                  const user = route.params.user;
                  const isContact = route.params.isContact;
                  console.log('user xxx', user);
                  return {
                    headerStyle: {
                      backgroundColor: SoftbackgroundColor,
                    },
                    headerTintColor: textColor,
                    headerTitle: () => (
                      <View style={tw`flex-1 flex-row justify-start items-center w-full`}>
                        <UserProfileModal
                          user={user}
                          modalIconVisible={userProfileModalSC}
                          setModalIconVisible={setUserProfileModalSC}
                          iconSize={12}
                          isContact={isContact}
                        />
                        <TouchableOpacity onPress={() => setUserProfileModalSC(true)} style={tw`ml-10 w-3/5 flex-row justify-start items-center`}>
                          <TouchableOpacity onPress={() => navigation.navigate("ProfilePictureScreen", { user: user, isContact: true })} >
                            <Image source={user.profile ? { uri: user.profile } : isContact ? ProfileIcon : groupicon} style={tw`size-11 rounded-full `} />
                          </TouchableOpacity>
                          <Text style={tw`text-[${textColor}] font-bold text-lg mx-2  `}>{user.name ?? 'Chat Room'}</Text>
                          {user.isBusy == true && <Ionicons name="notifications-off" size={18} color="red" />}

                        </TouchableOpacity>
                      </View>
                    ),
                    headerLeft: () => <View style={{ marginLeft: -50 }} />,
                    headerRight: () => (
                      <ConfigIcon chatroom={true} setModalIconVisible={setUserProfileModalSC} user={user} isContact={isContact} setLoadingLayout={setLoading} />
                    ),
                  };
                }}
              />
              {/* Profile Settings */}
              <Stack.Screen
                name="ProfileSettingsScreen"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor, // Dark background color for the header
                  },
                  headerTintColor: textColor,
                  headerTitle: Texts.Settings,
                }}
              />
              {/* Profile photo */}
              <Stack.Screen
                name="ProfilePictureScreen"
                options={({ route }) => {
                  const user = route.params.user;
                  console.log('user xxx', user);
                  return {
                    headerStyle: {
                      backgroundColor: 'black',
                    },
                    headerTintColor: 'white',
                    headerTitle: user.name,
                    animationEnabled: false,
                  };
                }}
              />
              {/* NotificationsScreen */}
              <Stack.Screen
                name="NotificationsScreen"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor,
                  },
                  headerTintColor: textColor,
                  headerTitle: Texts.Notifications,
                }}
              />
              {/* RandomZalkScreen */}
              <Stack.Screen
                name="RandomZalkScreen"
                options={{
                  headerStyle: {
                    backgroundColor: RZ_Gradient_1,
                  },
                  headerTintColor: 'white',
                  headerTitle: 'Random ZalK',
                }}
              />
            </Stack>
          </SocketProvider>
        ) : (
          // Login screens
          <LoginScreen setLoading={setLoading} SetLayoutLogged={SetLayoutLogged} />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const App = () => (
  <LanguageProvider>
    <BusyProvider>
      <RootLayout />
    </BusyProvider>
  </LanguageProvider>
);

export default App;
