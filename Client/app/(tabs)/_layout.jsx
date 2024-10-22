import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import RandomZalk from './index';
import ContactsScreen from './Contacts';
import GroupsScreen from './Groups';
import { Ionicons } from '@expo/vector-icons';
import GroupIcon from '../../assets/GroupIcon';
import { Text, View, Modal, Alert } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import Loading from '../../components/shared/Loading';
import { Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import getEnvVars from '../../config';
import { useLanguage } from '../../context/LanguageContext';
import { Audio } from 'expo-av';
import { AppState } from 'react-native';
import { useSocket } from '../../context/SocketContext';

const { SERVER_URL } = getEnvVars();
const Tab = createMaterialTopTabNavigator();
function TabIcon({ name, focused, color }) {
  return <Ionicons name={name} size={24} color={focused ? color : 'gray'} />;
}
function GroupTabIcon({ focused, color }) {
  return <GroupIcon fill={focused ? color : 'gray'} />;
}

export default function TabLayout({}) {
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  const primarypurpleHEX = useThemeColor({}, 'primarypurpleHEX');
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const { userID } = route.params;
  const { Texts } = useLanguage();
  const [appState, setAppState] = useState(AppState.currentState);
  const [socket, setSocket] = useState(useSocket());

  // ===== AppState =====
  useEffect(() => {
    if (socket != null) {
      const handleAppStateChange = (nextAppState) => {
        // Si la app pasa de segundo plano a primer plano, ejecuta la función
        if (appState === 'background' && nextAppState === 'active') {
          onForeground();
        }
        setAppState(nextAppState);
      };
      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        subscription.remove();
      };
    }
  }, [appState, socket]);

  const onForeground = () => {
    console.log('La app ha vuelto al primer plano.');
    socket.emit('appstate', { userID: userID });
  };

  // ===== Notifications =====
  const registerForPushNotificationsAsync = async () => {
    let token;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        // Alert.alert('Status', `Permission status: ${status}`);
      }
      if (finalStatus !== 'granted') {
        // Alert.alert('Error', 'Failed to get push token for push notification!');
        return;
      }

      // Alert.alert('Project ID', `${Constants.expoConfig.extra.eas.projectId}`);

      try {
        token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
        // Alert.alert('Token', `Token obtained: ${token}`);
      } catch (error) {
        // Alert.alert('Error', `Failed to get Expo push token: ${error.message}`);
        return;
      }
      try {
        await axios.post(`${SERVER_URL}/saveToken`, { token: token, userId: userID });
        // Alert.alert('Success', 'Token saved successfully');
      } catch (error) {
        Alert.alert('Error', `Failed to save token: ${error.message}`);
        return;
      }

      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
          // Alert.alert('Android', 'Notification channel set');
        } catch (error) {
          Alert.alert('Error', `Failed to set notification channel: ${error.message}`);
        }
      }

      if (Platform.OS === 'web') {
        const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with your VAPID public key
        try {
          token = await Notifications.getDevicePushTokenAsync({ vapidPublicKey });
          console.log(token);
        } catch (error) {
          Alert.alert('Error', `Failed to get web push token: ${error.message}`);
        }
      }

      return token;
    } catch (error) {
      Alert.alert('Error', `An error occurred: ${error.message}`);
      console.error(error);
    }
  };

  // ===== Notifications =====
 
  Notifications.setNotificationHandler({
    //CONFIGURACION DE NOTIFICACIONES AL RECIBIR UNA NOTIFICACION CON AUDIO
    // handleNotification: async (notification) => {
    //   const audioData = notification.request.content.data.audioData;
    //   if (audioData) {
    //     const { sound } = await Audio.Sound.createAsync({ uri: audioData });
    //     await sound.playAsync();
    //   }
    //   return {
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    //   };
    // },
  });
  

  // ===== Notifications =====

  useEffect(() => {
    if (userID != null) {
      registerForPushNotificationsAsync().then((token) => console.log(token));
    }
    //COPIADO POR EL COPILOT NO SE COMO FUNCIONA PERO NO LO BORRO POR SI ACASO

    // const subscription = Notifications.addNotificationReceivedListener(async notification => {
    //   const audioData = notification.request.content.data.audioData;
    //   if (audioData) {
    //     const { sound } = await Audio.Sound.createAsync({ uri: audioData });
    //     await sound.playAsync();
    //   }
    // });

    // return () => subscription.remove();
  }, []);

  return (
    <>
      {loading && (
        <Modal animationType="fade" transparent={true} onRequestClose={() => {}}>
          <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <Loading />
          </View>
        </Modal>
      )}

      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={{
          tabBarIndicatorStyle: { backgroundColor: primarypurpleHEX },
          tabBarStyle: { backgroundColor: SoftbackgroundColor },
          animationEnabled: true,
          tabBarActiveTintColor: primarypurpleHEX,
        }}
      >
        <Tab.Screen
          name="Contacts"
          initialParams={{ userID: userID }}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={tw`flex-1 items-center justify-center`}>
                <TabIcon name="person" focused={focused} color={primarypurpleHEX} />
                <Text style={{ color: focused ? primarypurpleHEX : textColor }}>{Texts.Contacts}</Text>
              </View>
            ),
          }}
        >
          {() => <ContactsScreen setLoadingLayout={setLoading} />}
        </Tab.Screen>
        <Tab.Screen
          name="Groups"
          component={GroupsScreen}
          initialParams={{ userID: userID }}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={tw`flex-1 items-center justify-center`}>
                <GroupTabIcon focused={focused} color={primarypurpleHEX} />
                <Text style={{ color: focused ? primarypurpleHEX : textColor }}>{Texts.Groups}</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="RandomZalk"
          component={RandomZalk}
          initialParams={{ userID: userID }}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={tw`flex-1 items-center justify-center`}>
                <TabIcon name="telescope-outline" focused={focused} color={primarypurpleHEX} />
                <Text style={{ color: focused ? primarypurpleHEX : textColor }}>{Texts.RandomZalk}</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}
