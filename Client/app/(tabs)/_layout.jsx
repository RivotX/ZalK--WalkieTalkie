import React, { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import RandomZalk from './index';
import ContactsScreen from './Contacts'; // Asegúrate de que la ruta sea correcta
import GroupsScreen from './Groups';
import { Ionicons } from '@expo/vector-icons';
import GroupIcon from '../../assets/GroupIcon';
import { Text, View, Modal } from 'react-native'; // Importa Modal desde react-native
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import Loading from '../../components/shared/Loading';

const Tab = createMaterialTopTabNavigator();

function TabIcon({ name, focused, color }) {
  return <Ionicons name={name} size={24} color={focused ? color : 'gray'} />;
}

function GroupTabIcon({ focused, color }) {
  return <GroupIcon fill={focused ? color : 'gray'} />;
}

export default function TabLayout() {
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  const primarypurpleHEX = useThemeColor({}, 'primarypurpleHEX');
  const [loading, setLoading] = useState(false);

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
                <Text style={{ color: focused ? primarypurpleHEX : textColor }}>Contacts</Text>
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
                <Text style={{ color: focused ? primarypurpleHEX : textColor }}>Groups</Text>
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
                <Text style={{ color: focused ? primarypurpleHEX : textColor }}>Random Zalk</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}