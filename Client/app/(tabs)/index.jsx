//Client/app/(tabs)/index.jsx
import { View, Text, TouchableOpacity, Vibration } from 'react-native';
import React, { useState, useEffect } from 'react';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import axios from 'axios';
import getEnvVars from '../../config';
import { useSocket } from '../../context/SocketContext';
import FriendRequestModal from '../../components/modals/FriendRequestModal';
import RandomZalkModal from '../../components/modals/RandomZalkModal';
import { useLanguage } from '../../context/LanguageContext';
import IsBusyRequiredModal from '../../components/modals/IsBusyRequiredModal';
import { useBusy } from '../../context/BusyContext';

const RandomZalkScreen = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const PrimaryPurple = useThemeColor({}, 'PrimaryPurple');

  const [username, setUsername] = useState();
  const { SERVER_URL } = getEnvVars();
  const [socket, setSocket] = useState(useSocket());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleRandomZalk, setModalVisibleRandomZalk] = useState(false);
  const { Texts } = useLanguage();
  const [userID, setUserID] = useState(null);
  const [request, setRequest] = useState([{ senderId: null, receiverId: null, message: null }]);
  const { isBusy } = useBusy();
  const [isBusyModalVisible, setIsBusyModalVisible] = useState(false);

  useEffect(() => {
    if (socket != null) {
      axios
        .get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => {
          setUserID(res.data.user.id);
          setUsername(res.data.user.username);
        })
        .catch((error) => {
          console.log(error);
        });

      socket.on('receive_request', (data) => {
        console.log('Solicitud recibida de:', data.senderId);

        setRequest(data);
        // pushNotification(data.senderId,data.message);
        Vibration.vibrate(200);
        setModalVisible(true);
      });
    }
  }, []);

  // ==== Accept friend request =======
  const acceptRequest = (senderId) => {
    console.log('Solicitud aceptada de:', senderId);
    socket.emit('accept_request', { senderId: senderId, receiverId: username });
    setModalVisible(!modalVisible);
  };

  // ==== Decline friend request =======
  const declineRequest = (senderId) => {
    console.log('Solicitud rechazada de:', senderId);
    socket.emit('decline_request', { senderId: senderId, receiverId: username });
    setModalVisible(!modalVisible);
  };

  // ==== Random Zalk =======
  const RandomZalk = () => {
    if (isBusy == true) {
      setIsBusyModalVisible(true);
      return;
    }
    console.log('Random Zalk');
    setModalVisibleRandomZalk(true);
  };

  return (
    <View style={tw`flex-1 items-center justify-center bg-[${backgroundColor}]`}>
      {/* Random Zalk Button */}
      <TouchableOpacity style={tw`size-84 bg-${PrimaryPurple} rounded-full flex items-center justify-center shadow-xl`} onPress={RandomZalk}>
        <View style={tw`size-78 bg-${PrimaryPurple} rounded-full border-4 border-white flex items-center justify-center`}>
          <Text style={tw`text-3xl text-white font-medium`}>{Texts.TapRandomZalk}</Text>
        </View>
      </TouchableOpacity>
      {/* Friend Request Modal */}
      {modalVisible && (
        <FriendRequestModal
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
          request={request}
          acceptRequest={acceptRequest}
          declineRequest={declineRequest}
        />
      )}
      {/* Random Zalk Modal */}
      {modalVisibleRandomZalk && (
        <RandomZalkModal
          userID={userID}
          onClose={() => {
            setModalVisibleRandomZalk(false);
          }}
        />
      )}
      {/* Busy Modal */}
      {isBusyModalVisible && <IsBusyRequiredModal modalVisible={isBusyModalVisible} setModalVisible={setIsBusyModalVisible} userID={userID} />}
    </View>
  );
};

export default RandomZalkScreen;
