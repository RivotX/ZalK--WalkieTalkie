import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Modal, Image, Text, View, ScrollView, Dimensions } from 'react-native';
import tw from 'twrnc';
import ProfileIcon from '../../assets/images/images.png';
import groupicon from '../../assets/images/groupicon.png';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import getEnvVars from '../../config';
import { Ionicons } from '@expo/vector-icons';

const UserProfileModal = ({ user, modalIconVisible, setModalIconVisible, iconSize, isContact }) => {
  const textColor = useThemeColor({}, 'text');
  const UserProfileModal_BG = useThemeColor({}, 'UserProfileModal_BG');
  console.log('UserProfileModal: ', user);
  const [qty, setQty] = useState(null);
  const [members, setMembers] = useState([]);
  const { Texts } = useLanguage();

  const { SERVER_URL } = getEnvVars();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSelectedUserModalVisible, setIsSelectedUserModalVisible] = useState(false);

  const windowHeight = Dimensions.get('window').height;
  const pictureHeightPercentage = windowHeight < 700 ? 40 : 45;

  useEffect(() => {
    console.log('UserProfileModal: ', user);

    if (!isContact) {
      axios
        .post(`${SERVER_URL}/getGroupMembers`, { groupId: user.id })
        .then((res) => {
          console.log('Members: ', res.data);
          const modifiedMembers = res.data.map((member) => ({
            ...member,
            profile: member.profilePicture,
            id: member.id,
            info: member.info,
            profile: member.profilePicture,
            name: member.username,
          }));
          setQty(modifiedMembers.length);
          setMembers(modifiedMembers);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [user]);

  useEffect(() => {
    console.log('Members: ', members);
  }, [members]);

  useEffect(() => {
    console.log('user template ' + user);
    console.log('Selected user: ', selectedUser);
  }, [selectedUser]);

  const renderContent = () => (
    <>
      <TouchableOpacity style={tw`absolute top-4 left-4`} onPress={() => setModalIconVisible(false)}>
        <Ionicons name="arrow-back" size={24} color={textColor} />
      </TouchableOpacity>
      <Text style={tw`text-[${textColor}] text-2xl font-bold text-center mb-4 border-gray-400 w-full`}>{user.name}</Text>
      <View style={tw`h-[${pictureHeightPercentage}%] w-full px-8`}>
        <Image
          style={[tw`size-full rounded-md`, { resizeMode: 'cover' }]}
          source={user.profile ? { uri: user.profile } : isContact ? ProfileIcon : groupicon}
        />
      </View>
      <Text style={tw`text-[${textColor}] text-center mt-10 w-2/3 italic`}>{user.info}</Text>
      {members && (
        <View style={tw`w-full mt-4 flex-1`}>
          <Text style={tw`text-[${textColor}] text-center mt-2`}>
            <Text style={tw`text-[${textColor}] text-center font-bold`}>{qty != null && `${Texts.Members} : ${qty}`} </Text>
          </Text>
          <ScrollView contentContainerStyle={tw`flex-grow`} style={tw`flex-1 w-full z-30`}>
            <View style={tw`flex-row flex-wrap justify-center`}>
              {members.map((item, index) => (
                <TouchableOpacity
                  key={index.toString()}
                  style={tw`w-1/2 flex-row items-center justify-start m-2`}
                  onPress={() => {
                    setSelectedUser(item);
                    setIsSelectedUserModalVisible(true);
                  }}
                >
                  <Image style={[tw`w-10 h-10 rounded-full mr-2`, { resizeMode: 'cover' }]} source={{ uri: item.profilePicture }} />
                  <Text style={tw`text-[${textColor}] text-left`}>{item.username}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );

  return (
    <>
      <Modal animationType="fade" transparent={true} visible={modalIconVisible} onRequestClose={() => setModalIconVisible(false)}>
        {isContact ? (
          <TouchableOpacity
            style={tw`flex-1 pt-[20%] items-center bg-[${UserProfileModal_BG}] bg-opacity-100`}
            activeOpacity={1}
            onPress={() => setModalIconVisible(false)}
          >
            {renderContent()}
          </TouchableOpacity>
        ) : (
          <View style={tw`flex-1 pt-[20%] items-center bg-[${UserProfileModal_BG}] bg-opacity-100`}>{renderContent()}</View>
        )}
      </Modal>
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          modalIconVisible={isSelectedUserModalVisible}
          setModalIconVisible={setIsSelectedUserModalVisible}
          isContact={true}
        />
      )}
    </>
  );
};

export default UserProfileModal;
