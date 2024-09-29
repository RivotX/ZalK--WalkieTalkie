import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';

const FriendRequestModal = ({ setModalVisible, modalVisible, request, acceptRequest, declineRequest }) => {
  const modal_bg_color = useThemeColor({}, 'modal_bg_color');
  const modal_text_color = useThemeColor({}, 'modal_text_color');
  const modal_title_color = useThemeColor({}, 'modal_title_color');
  const accept_button_color = useThemeColor({}, 'Modal_accept_button');
  const decline_button_color = useThemeColor({}, 'Modal_cancel_button');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={[tw`w-4/5 bg-${modal_bg_color} rounded-lg p-5 items-center shadow-lg`, styles.modalContainer]}>
          <TouchableOpacity style={tw`absolute top-[-2] right-[-2] p-4`} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} color={modal_text_color} />
          </TouchableOpacity>
          <Text style={[tw`text-xl font-bold mb-2 text-${modal_title_color}`, styles.text]}>Friend Request</Text>
          <Text style={[tw`text-lg font-semibold mb-2 text-${modal_text_color}`, styles.text]}>
            from <Text style={tw`text-purple-500`}>@{request.senderId}</Text>
          </Text>
          <Text style={[tw`text-base italic text-center text-${modal_text_color}`, styles.text]}>{request.message}</Text>

          <View style={tw`w-full mt-5`}>
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                style={[tw`flex-1 bg-${decline_button_color} p-2 rounded-full mx-1`, styles.button]}
                onPress={() => declineRequest(request.senderId)}
              >
                <Text style={[tw`text-white font-bold text-center`, styles.text]}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tw`flex-1 bg-${accept_button_color} p-2 rounded-full mx-1`, styles.button]}
                onPress={() => acceptRequest(request.senderId)}
              >
                <Text style={[tw`text-white font-bold text-center`, styles.text]}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    minHeight: 250, // Adjust the height as needed
  },
  text: {
    fontFamily: 'System', // Use the system font which is San Francisco on iOS
  },
  button: {
    minWidth: 100, // Ensure buttons have a minimum width
  },
});

export default FriendRequestModal;