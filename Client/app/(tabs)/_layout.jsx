import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import RandomZalk from './index';
import ContactsScreen from './Contacts'; // Asegúrate de que la ruta sea correcta
import GroupsScreen from './Groups';
import { Ionicons } from '@expo/vector-icons';
import GroupIcon from '../../assets/GroupIcon';
import { Text, View, Modal, Alert } from 'react-native'; // Importa Modal desde react-native
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

const { SERVER_URL } = getEnvVars();
const Tab = createMaterialTopTabNavigator();
function TabIcon({ name, focused, color }) {
  return <Ionicons name={name} size={24} color={focused ? color : 'gray'} />;
}
function GroupTabIcon({ focused, color }) {
  return <GroupIcon fill={focused ? color : 'gray'} />;
}

export default function TabLayout({ }) {
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  const primarypurpleHEX = useThemeColor({}, 'primarypurpleHEX');
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const { username } = route.params;

  const { Texts } = useLanguage();

  // ===== Notifications =====
  const registerForPushNotificationsAsync = async () => {
    let token;
    if (true === true) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId, })).data;
      axios.post(`${SERVER_URL}/saveToken`, { token: token, username: username }).then((res) => {
        console.log(res.data);
      });
    Alert.alert("TOKEN",`${token}Este es el token`);

      console.log(token, 'token and projectId', Constants.expoConfig.extra.eas.projectId);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Platform.OS === 'web') {
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with your VAPID public key
      token = await Notifications.getDevicePushTokenAsync({ vapidPublicKey });
      console.log(token);
    }

    return token;
  }

  Notifications.setNotificationHandler({

    //CONFIGURACION DE NOTIFICACIONES AL RECIBIR UNA NOTIFICACION CON AUDIO
    handleNotification: async (notification) => {
      const audioData = notification.request.content.data.audioData;
      if (audioData) {
        const { sound } = await Audio.Sound.createAsync({ uri: audioData });
        await sound.playAsync();
      }
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      };
    },
  });

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => console.log(token));

    //COPIADO POR EL COPILOT NO SE COMO FUNCIONA PERO NO LO BORRO POR SI ACASO

    // const subscription = Notifications.addNotificationReceivedListener(async notification => {
    //   const audioData = notification.request.content.data.audioData;
    //   if (audioData) {
    //     const { sound } = await Audio.Sound.createAsync({ uri: audioData });
    //     await sound.playAsync();
    //   }
    // });

    // return () => subscription.remove();
  }, [username]);

  return (
    <>
      {loading && (
        <Modal animationType="fade" transparent={true} onRequestClose={() => { }}>
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