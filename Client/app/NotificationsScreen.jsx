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

const NotificationsScreen = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const [requests, setRequests] = useState([{}]);
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [userID, setUserID] = useState(null);
  const { SERVER_URL } = getEnvVars();
  const [loading, setLoading] = useState(true);

  // ===== Get session =====
  useEffect(() => {
    setLoading(true);
    axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUserID(res.data.user.id);
        setRequests(JSON.parse(res.data.user.requests));
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // ===== Skips the login if the user is already logged in ========
    if (userID != null) {
      socket.on('refreshcontacts', () => {
        axios.post(`${SERVER_URL}/refreshSession`, { id: userID }, { withCredentials: true })
          .then((res) => {
            console.log('SESIONES REFRESCADOOOOOOOOS', res.data.user);
            setRequests(JSON.parse(res.data.user.requests).length > 0 ? JSON.parse(res.data.user.requests) : []);
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            setLoading(false);
          });
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
        ) : requests.length > 0 && requests[0] && Object.keys(requests[0]).length > 0 ? (
          <>
            {/* Show requests */}
            {requests.map((request, index) => (
              <ChatComponent
                user={request}
                key={index}
                isrequest={true}
                iconDelete={true}
                setLoading={setLoading}
                showModalOnPress={true}
                showModalOnProfilePicturePress={true}
              />
            ))}
          </>
        ) : (
          <>
            {/* No requests */}
            <View style={tw`flex w-full items-center mt-10 h-1/3`}>
              <Text style={tw`text-[${textColor}] text-2xl font-medium`}>You don't have any notifications</Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default NotificationsScreen;
