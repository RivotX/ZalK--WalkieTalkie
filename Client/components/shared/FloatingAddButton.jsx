import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useThemeColor';
import tw from 'twrnc';

const FloatingAddButton = ({ OnNavigate, icon }) => {
  const primarypurpleHEX = useThemeColor({}, 'primarypurpleHEX');

  return (
    <TouchableOpacity onPress={OnNavigate} style={tw`absolute bottom-12 right-5 px-4 py-[1rem] bg-[${primarypurpleHEX}] rounded-full`}>
      <Ionicons name={icon} size={29} color={'white'} />
    </TouchableOpacity>
  );
};

export default FloatingAddButton;
