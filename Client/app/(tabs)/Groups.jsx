//Client/app/(tabs)/Groups.jsx
import React, { useEffect, useState } from 'react';
import { View, Image, Text, Modal, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../../components/context/SocketContext';
import axios from 'axios';
import getEnvVars from '../../config';
import ChatComponent from '../../components/shared/ChatComponent';
import GroupIcon from '../../assets/images/groupicon.png';
import Loading from '../../components/shared/Loading';
import FloatingAddButton from '../../components/shared/FloatingAddButton';

export default function GroupsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const navigation = useNavigation();
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [roomsAmIn, setRoomsAmIn] = useState([]);
  const { SERVER_URL } = getEnvVars();
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (socket != null) {
      console.log(socket, 'socket EN groups');
      axios
        .get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => {
          setUserID(res.data.user.id);
          setRoomsAmIn(JSON.parse(res.data.user.groups));
          console.log('Session', res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  useEffect(() => {
    if (userID != null) {
      socket.on('refreshgroups', () => {
        console.log('REFRESH groups');
        axios.post(`${SERVER_URL}/refreshSession`, { id: userID }, { withCredentials: true })
          .then((res) => {
            console.log('GRUPOS REFRESCADOOOOOOOOS', res.data.user.contacts);
            setRoomsAmIn(JSON.parse(res.data.user.groups));
          })
          .catch((error) => {
            console.log(error);
          }).finally(() => {
          });
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
            Join a group to get started!
          </Text>
        ) : (
          roomsAmIn.map((room, index) => {
            const roomdata = {
              name: room.name,
              profile: GroupIcon,
              room: room.name,
              info: room.info,
            };
            return (
              <ChatComponent
                user={roomdata}
                key={index}
                onGeneralPress={() => navigation.navigate('ChatScreen', { user: roomdata, isContact: false })}
                iscontact={false}
                iconDelete={true}
                showModalOnProfilePicturePress={true}
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
      />
    </View>
  );
}
