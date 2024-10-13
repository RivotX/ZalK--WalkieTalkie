// UserProfileModal.jsx
import React, { useEffect, useState } from "react";
import { TouchableOpacity, Modal, Image, Text, View } from "react-native";
import tw from "twrnc";
import ProfileIcon from "../../assets/images/images.png";
import groupicon from "../../assets/images/groupicon.png";
import { useThemeColor } from "../../hooks/useThemeColor";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";
import getEnvVars from "../../config";

const UserProfileModal = ({ user, modalIconVisible, setModalIconVisible, iconSize, isContact }) => {
  const textColor = useThemeColor({}, "text");
  const UserProfileModal_BG = useThemeColor({}, "UserProfileModal_BG");
  console.log("UserProfileModal: ", user);
  const [qty, setQty] = useState(null);
  const [members, setMembers] = useState([]);
  const { Texts } = useLanguage();

  const { SERVER_URL } = getEnvVars();

  useEffect(() => {
    console.log("UserProfileModal: ", user);

    if (!isContact) {
      axios.post(`${SERVER_URL}/getGroupMembers`, { groupId: user.id }).then((res) => {
        console.log("Members: ", res.data);
        setQty(res.data.length);
        setMembers(res.data);
      }).catch((error) => {
        console.log(error);
      });
    }
  }, [user]);




  return (
    <>
      <Modal animationType="fade" transparent={true} visible={modalIconVisible} onRequestClose={() => setModalIconVisible(false)}>
        <TouchableOpacity
          style={tw`flex-1 pt-[20%] items-center bg-[${UserProfileModal_BG}] bg-opacity-97`}
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
          {members && (
            <View style={tw`w-full mt-4`}>
              <Text style={tw`text-[${textColor}] text-center mt-4`}><Text style={tw`text-[${textColor}] text-center font-bold`} >{qty != null && `${Texts.Members} : ${qty}`} </Text> </Text>

              {members.map((member, index) => (
                <Text key={index} style={tw`text-[${textColor}] text-center`}>
                  - {member.username}
                </Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default UserProfileModal;