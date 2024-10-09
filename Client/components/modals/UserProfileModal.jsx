// UserProfileModal.jsx
import React from "react";
import { TouchableOpacity, Modal, Image, Text, View } from "react-native";
import tw from "twrnc";
import ProfileIcon from "../../assets/images/images.png";
import groupicon from "../../assets/images/emoGirlIcon.png";
import { useThemeColor } from "../../hooks/useThemeColor";

const UserProfileModal = ({ user, modalIconVisible, setModalIconVisible, iconSize, isContact }) => {
  const textColor = useThemeColor({}, "text");
  const UserProfileModal_BG = useThemeColor({}, "UserProfileModal_BG");
  console.log("userprofileModal: ", user);
  return (
    <>
      <Modal animationType="fade" transparent={true} visible={modalIconVisible} onRequestClose={() => setModalIconVisible(false)}>
        <TouchableOpacity
          style={tw`flex-1 pt-[20%] items-center bg-[${UserProfileModal_BG}] bg-opacity-90`}
          activeOpacity={1}
          onPress={() => setModalIconVisible(false)}
        >
            <Text style={tw`text-[${textColor}] text-2xl font-bold text-center mb-4  border-gray-400 w-full`}>{user.name}</Text>

            <View style={tw`h-100 w-full px-8`}>
              <Image
                style={[tw`size-full rounded-md`, { resizeMode: "cover" }]}
                source={user.profile ? { uri: user.profile } : isContact ? ProfileIcon : groupicon}
              />
            </View>
            <Text style={tw`text-[${textColor}] text-center mt-10 w-2/3 italic`}>{user.info}</Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default UserProfileModal;