// Client/components/PasswordToggle.jsx

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const PasswordToggle = ({ hidePassword, setHidePassword }) => {
  return (
    <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
      <Ionicons name={hidePassword ? "eye-off" : "eye"} size={20} color="gray" style={tw`px-4 py-2`} />
    </TouchableOpacity>
  );
};

export default PasswordToggle;