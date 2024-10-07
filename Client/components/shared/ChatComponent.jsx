import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import UserProfileModal from '../modals/UserProfileModal';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import getEnvVars from '../../config';
const { SERVER_URL } = getEnvVars();
import ProfileIcon from '../../assets/images/images.png';
import groupIcon from '../../assets/images/groupicon.png';
import { useLanguage } from '../../context/LanguageContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ChatComponent = ({ user, iconChat, onAdd, iscontact, isrequest, setLoading, showModalOnPress, showModalOnProfilePicturePress, onGeneralPress, isFriend }) => {
  const textColor = useThemeColor({}, 'text');
  const [username, setusername] = useState();
  const [socket, setSocket] = useState(useSocket());
  const [userInfo, setUserInfo] = useState();
  const [selectedUser, setSelectedUser] = useState(user);
  const [userProfileModalVisible, setuserProfileModalVisible] = useState(false);
  const ChatComponent_BorderColor = useThemeColor({}, 'ChatComponent_BorderColor');
  const { Texts } = useLanguage();

  useEffect(() => {
    if (!onAdd) {
      axios
        .get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => {
          setusername(res.data.user.username);
          setUserInfo(res.data.user.info);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  const handleAccept = () => {
    socket.emit('accept_request', { senderId: user.id, receiverId: username });
    setLoading(true);
  };

  const onDecline = () => {
    socket.emit('decline_request', { senderId: user.id, receiverId: username });
    setLoading(true);
  };

  const handleGeneralPress = () => {
    if (showModalOnPress) {
      setuserProfileModalVisible(true);
      setSelectedUser(user);
    } else if (onGeneralPress) {
      onGeneralPress();
    }
  };

  const handleProfilePicturePress = () => {
    if (showModalOnProfilePicturePress) {
      setuserProfileModalVisible(true);
      setSelectedUser(user);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleGeneralPress}
        style={tw`${isrequest ? 'px-3 py-2' : 'px-2 py-0.5'}  flex flex-row w-full max-w-[700px] justify-center items-center`}
      >
        {/* Profile Picture */}
        <TouchableOpacity onPress={handleProfilePicturePress}>
          <View style={tw`size-[14] rounded-full`}>
            <Image style={[tw`rounded-full w-full h-full`]} source={user.profile ? { uri: user.profile } : iscontact ? ProfileIcon : groupIcon} />
          </View>
        </TouchableOpacity>

        {/* Main content */}
        <View style={tw`flex-1 flex-row items-center`}>
          <View style={tw`flex-1 flex-row items-center justify-between border-b border-${ChatComponent_BorderColor} h-full py-4 ml-3`}>
            <View style={tw`${isrequest && 'w-[60%]'} `}>
              <Text style={[{ fontSize: 16 }, tw`font-bold text-[${textColor}]`]}>
                {isrequest ? user.username : user.name} {user.isBusy && <Ionicons name="notifications-off" size={18} color="red" />}
              </Text>
              {isrequest ? <Text style={tw`text-gray-400`}>{Texts.SentRequest}</Text> : <Text style={tw`text-gray-400`}>{isFriend ? Texts.TapToChat : Texts.TapForDetails}</Text>}
            </View>

            <View style={tw`${isrequest && 'w-[40%]'}`}>
              {/* Chat  */}
              {iconChat && isrequest == undefined && (
                <TouchableOpacity style={tw`px-5`} onPress={handleGeneralPress}>
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color={textColor} />
                </TouchableOpacity>
              )}

              {/* Add Friends */}
              {!iconChat && isrequest == undefined && (
                <TouchableOpacity style={tw`px-5`} onPress={onAdd}>
                  <Ionicons name="person-add" size={22} color={textColor} />
                </TouchableOpacity>
              )}

              {/* Notifications */}
              {isrequest && (
                <View style={tw`flex-row items-center justify-center`}>
                <View style={tw`flex-row items-center p-2 rounded-lg`}>
                  <TouchableOpacity style={tw`px-2`} onPress={onDecline}>
                    <FontAwesome name="times-circle" size={32} color={'red'} />
                  </TouchableOpacity>
                  <View style={tw`w-0.5 h-8 bg-${ChatComponent_BorderColor} mx-2`} />
                  <TouchableOpacity style={tw`px-2`} onPress={handleAccept}>
                    <Ionicons name="person-add" size={32} color={'green'} />
                  </TouchableOpacity>
                </View>
              </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* UserProfileModal */}
      {userProfileModalVisible && (
        <View style={tw`absolute inset-0 flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <UserProfileModal user={selectedUser} isContact={iscontact} modalIconVisible={userProfileModalVisible} setModalIconVisible={setuserProfileModalVisible} iconSize={14} />
        </View>
      )}
    </>
  );
};

export default ChatComponent;
