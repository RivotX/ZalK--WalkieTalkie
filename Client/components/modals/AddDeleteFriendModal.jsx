import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Animated, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';

const AddDeleteFriendModal = ({ setModalVisible, modalVisible, OnAccept, selectedUser, action }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const modal_bg_color = useThemeColor({}, 'modal_bg_color');
  const modal_text_color = useThemeColor({}, 'modal_text_color');
  const modal_title_color = useThemeColor({}, 'modal_title_color');
  const Modal_accept_button = useThemeColor({}, 'Modal_accept_button');
  const Modal_cancel_button = useThemeColor({}, 'Modal_cancel_button');

  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState('');
  const maxLength = 160;

  const slideIn = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const getTitle = () => {
    if (action === 'add') {
      return 'Do you want to add';
    } else if (action === 'delete') {
      return 'Do you want to delete';
    }
    return '';
  };

  const handleSendMessage = () => {
    if (message.length > maxLength) {
      Alert.alert('Error', 'Message cannot exceed 40 characters.');
      return;
    }
    OnAccept(message);
  };

  const handleChangeText = (text) => {
    setMessage(text);
    setCharCount(text.length);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <Pressable
        style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
      >
        <Animated.View style={[tw`w-11/12 max-w-md bg-${modal_bg_color} rounded-lg shadow-lg p-6`, slideIn]}>
          <Text style={tw`text-2xl font-semibold mb-4 text-${modal_title_color} text-center`}>{getTitle()}</Text>
          <Text style={tw`text-lg font-semibold mb-4 text-${modal_text_color} text-center`}>@{selectedUser?.name}?</Text>
          <TextInput
            style={tw`w-full bg-gray-200 p-2 rounded-lg mb-2`}
            placeholder="Escribe tu mensaje..."
            value={message}
            maxLength={maxLength}
            onChangeText={handleChangeText}
          />
          <Text style={tw`text-right text-${modal_text_color} mb-4`}>{charCount}/{maxLength}</Text>
          <View style={tw`flex-row justify-between w-full mt-auto`}>
            <TouchableOpacity
              style={tw`flex-1 bg-${Modal_cancel_button} p-2 rounded-full mx-1`}
              onPress={() => setModalVisible(false)}
            >
              <Text style={tw`text-${modal_text_color} font-bold text-center`}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 bg-${Modal_accept_button} p-2 rounded-full mx-1`}
              onPress={handleSendMessage}
            >
              <Text style={tw`text-white font-bold text-center`}>Yes</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default AddDeleteFriendModal;