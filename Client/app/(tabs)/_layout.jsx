import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import RandomZalk from './index';
import ContactsScreen from './Contacts';
import GroupsScreen from './Groups';
import { Ionicons } from '@expo/vector-icons';
import GroupIcon from '../../assets/GroupIcon';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';

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

  return (
    <>
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
          component={ContactsScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={tw`flex-1 items-center justify-center`}>
                <TabIcon name="person" focused={focused} color={primarypurpleHEX} />
                <Text style={{ color: focused ? primarypurpleHEX : textColor }}>Contacts</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Group"
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