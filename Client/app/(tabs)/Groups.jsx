//Client/app/(tabs)/Groups.jsx
import React, { useEffect, useState } from 'react';
import { View, Image, Text, Modal, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import getEnvVars from '../../config';
import ChatComponent from '../../components/shared/ChatComponent';
import Loading from '../../components/shared/Loading';
import FloatingAddButton from '../../components/shared/FloatingAddButton';
import { useLanguage } from '../../context/LanguageContext';
import { useRoute } from '@react-navigation/native';
// import {SERVER_URL, SOCKET_URL} from '@env';

export default function GroupsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const navigation = useNavigation();
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [roomsAmIn, setRoomsAmIn] = useState([]);
  const { SERVER_URL } = getEnvVars();
  const [loading, setLoading] = useState(false);
  const { Texts } = useLanguage();
  const [userID, setUserID] = useState(null);
  useEffect(() => {
    axios
      .get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUserID(res.data.user.id);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  

  const getGroups = () => {
    setLoading(true);
    console.log('USERID EN GROUP', userID);
    axios.post(`${SERVER_URL}/getGroups`, { userId: userID })
      .then((res) => {
        console.log('Grupos res:', res.data);
        setRoomsAmIn(res.data);

      })
      .catch((error) => {
        console.log(error);
      }).finally(() => {
        setLoading(false);
      });
  }
    
  


  useEffect(() => {
    if (userID != null) {
      getGroups();
      socket.on('refreshcontacts', () => {
        console.log('REFRESH groups');
        getGroups();
      });
    }
  }, [userID]);



  return (
    <View style={tw`flex-1 items-center bg-[${backgroundColor}]`}>
      {/* Loading */}
      {loading && (
        <Modal animationType="fade" transparent={true} onRequestClose={() => { }}>
          <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <Loading />
          </View>
        </Modal>
      )}
      {/* Display groups */}
      <ScrollView style={tw` w-full`}>
        {roomsAmIn && roomsAmIn.length == 0 ? (
          <Text style={tw`text-[${textColor}] text-2xl  mt-10 font-medium text-center`}>
            {Texts.AddGroupStarted}
          </Text>
        ) : (
          roomsAmIn.map((room, index) => {
            console.log('ROOM', room);
            const roomdata = {
              id: room.id,
              name: room.name,
              profile: null,
              room: room.name,
              info: room.info,
            };
            return (
              <ChatComponent
                user={roomdata}
                key={index}
                onGeneralPress={() => navigation.navigate('ChatScreen', { user: roomdata, isContact: false })}
                iscontact={false}
                iconChat={true}
                showModalOnProfilePicturePress={true}
                isFriend={true}
              />
            );
          })
        )}
      </ScrollView>

      {/* Add Groups Button */}
      <FloatingAddButton
        OnNavigate={() => {
          navigation.navigate('AddGroupsScreen');
        }}
        icon={'add-outline'}
        iconColor={textColor}
      />
    </View>
  );
}
