import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useThemeColor';
import tw from 'twrnc';

const FloatingAddButton = ({ OnNavigate, icon, iconColor }) => {
  const primarypurpleHEX = useThemeColor({}, 'primarypurpleHEX');

  return (
    <TouchableOpacity onPress={OnNavigate} style={tw`absolute bottom-8 right-5 px-4 py-[1rem] bg-[${primarypurpleHEX}] rounded-[1.25rem]`}>
      <Ionicons name={icon} size={29} color={iconColor} />
    </TouchableOpacity>
  );
};

export default FloatingAddButton;
