// UserProfileModal.jsx
import React from 'react';
import { TouchableOpacity, Modal, Image, Text } from 'react-native';
import tw from 'twrnc';
import ProfileIcon from "../../assets/images/images.png";
import groupicon from "../../assets/images/emoGirlIcon.png";
import { useThemeColor } from '../../hooks/useThemeColor';

const UserProfileModal = ({ user, modalIconVisible, setModalIconVisible, iconSize, isContact }) => {
  const textColor = useThemeColor({}, "text");
  const UserProfileModal_BG = useThemeColor({}, "UserProfileModal_BG");
  console.log("userprofileModal: " ,user);
  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalIconVisible}
        onRequestClose={() => setModalIconVisible(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 pt-[20%] items-center bg-[${UserProfileModal_BG}] bg-opacity-100`}
          activeOpacity={1}
          onPress={() => setModalIconVisible(false)}
        >
          <Image
            style={{ width: '100%', height: 300, resizeMode: 'cover' }}
            source={user.profile ? { uri: user.profile }  : isContact? ProfileIcon : groupicon}
          />
          <Text style={tw`text-[${textColor}] text-lg font-bold text-center mt-2 border-b border-t border-gray-400 w-full`}>{user.name}</Text>
          <Text style={tw`text-[${textColor}] text-center mt-1 w-2/3`}>{user.info}</Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default UserProfileModal;