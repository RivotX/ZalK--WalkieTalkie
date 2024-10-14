import { React, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';
import axios from 'axios';
import ChatComponent from '../components/shared/ChatComponent';
import { useSocket } from '../context/SocketContext';
import getEnvVars from '../config';
import Loading from '../components/shared/Loading';
import { useLanguage } from '../context/LanguageContext';
// import {SERVER_URL, SOCKET_URL} from '@env';

const NotificationsScreen = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const [requests, setRequests] = useState([{}]);
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [userID, setUserID] = useState(null);
  const { SERVER_URL } = getEnvVars();
  const [loading, setLoading] = useState(true);
  const { Texts } = useLanguage();

  // ===== Get session =====
  useEffect(() => {
    axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUserID(res.data.user.id);
        console.log('sessiones', res.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
      });
  }, []);

  // ===== Get requests =====
  const getRequests = () => {
    setLoading(true);
    axios.post(`${SERVER_URL}/getRequest`, { userID: userID })
          .then((res) => {
            console.log('request ZZ data', res.data);
            const requests = res.data.map(item => ({
              profile: item.profilePicture,
              name: item.username,
              id: item.id,
              info: item.info
            }));
            setRequests(requests);
            })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            setLoading(false);
          });
  };

  useEffect(() => { 
    if (userID != null) {
      getRequests();
      socket.on("refreshcontacts", () => {
      getRequests();
      });
    }
  }, [userID]);

  useEffect(() => {
    console.log('Requests xx', requests);
  }, [requests]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 bg-[${backgroundColor}]`}>
        {/* Loading */}
        {loading ? (
          <Modal animationType="fade" transparent={true} onRequestClose={() => {}}>
            <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
              <Loading />
            </View>
          </Modal>
        ) : requests.length > 0 ? (
          <>
            {/* Show requests */}
            {requests.map((request, index) => (
              <ChatComponent
                user={request}
                key={index}
                isrequest={true}
                iconChat={true}
                setLoading={setLoading}
                showModalOnPress={true}
                showModalOnProfilePicturePress={true}
                iscontact={true}
              />
            ))}
          </>
        ) : (
          <>
            {/* No requests */}
            <View style={tw`flex w-full items-center mt-10 h-1/3`}>
              <Text style={tw`text-[${textColor}] text-2xl font-medium`}>{Texts.NoNotifications}</Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default NotificationsScreen;
