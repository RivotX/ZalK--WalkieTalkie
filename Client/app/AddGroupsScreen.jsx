//Client/app/(tabs)/AddGroupsScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';
import axios from 'axios';
import ChatComponent from '../components/shared/ChatComponent';
import GroupIcon from '../assets/images/groupicon.png';
import getEnvVars from '../config';
import { useSocket } from '../context/SocketContext';
import Loading from '../components/shared/Loading';

export default function AddGroupsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  const inputRef = useRef(null);
  const [text, setText] = useState('');
  const [roomFound, setroomFound] = useState(undefined);
  const [username, setUsername] = useState();
  const [userID, setUserID] = useState(null);
  const [socket, setSocket] = useState(useSocket());
  const [loading, setLoading] = useState(false);
  const [loadingOnAdd, setLoadingOnAdd] = useState(false);

  const [rooms, setrooms] = useState([
    {
      name: '',
      info: '',
    },
  ]);
  const { SERVER_URL } = getEnvVars();

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUsername(res.data.user.username);
        setUserID(res.data.user.id);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // ===== Search for rooms to join =====
  const onSearchRoom = () => {
    setroomFound(undefined);
    setLoading(true);
    axios
      .post(`${SERVER_URL}/searchRoom`, { roomsearch: text, username: username })
      .then((res) => {
        console.log(res.data);
        const roomsData = res.data.map((room) => ({
          name: room.name,
          info: room.info,
        }));
        setrooms(roomsData);
        setroomFound(true);
      })
      .catch((err) => {
        console.error(err);
        setrooms([]);
        setroomFound(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Automatically focus the TextInput when the screen is loaded
    inputRef.current?.focus();
    if (socket != null) {
      console.log(socket, 'socket EN AddRoomsScreen');
    }
  }, []);

  // ===== Friend request =====
  const joinRoom = (room) => {
    socket.emit('join', { room: room, username: username });
    setrooms(rooms.filter((roomadded) => roomadded.name !== room));
  };

  return (
    <>
      {loadingOnAdd && (
        <Modal animationType="fade" transparent={true} onRequestClose={() => {}}>
          <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <Loading />
          </View>
        </Modal>
      )}
      <View style={tw`flex-1 bg-[${backgroundColor}]`}>
        {/* Top Bar */}
        <View style={tw`w-full h-16 bg-[${SoftbackgroundColor}] flex items-center`}>
          <View style={tw`w-4/5 flex-row items-center`}>
            <TextInput
              style={tw`h-10 w-11/12 my-3 border-b border-gray-400 px-2 text-[${textColor}]`}
              placeholderTextColor="#9ca3af"
              placeholder="Buscar por grupo"
              autoFocus={true}
              value={text}
              onChangeText={(e) => {
                setText(e);
                setroomFound(undefined);
              }}
              onSubmitEditing={onSearchRoom}
            />
            {/* Renderizado condicional para el boton "X" */}
            {text.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setText('');
                  setroomFound(undefined);
                }}
                style={tw`ml-2 p-2 w-1/12`}
              >
                <Text style={tw`text-lg text-[${textColor}]`}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Main Content */}
        <View style={tw`flex-1 items-center`}>
          {loading && (
            <View style={tw`flex w-full items-center h-1/3`}>
              <Loading />
            </View>
          )}
          {/* Display groups */}
          <ScrollView style={tw` w-full`}>
            {roomFound &&
              rooms.map((room, index) => (
                <ChatComponent
                  key={room.id || index}
                  user={room}
                  onAdd={() => {
                    joinRoom(room.name);
                  }}
                  iconDelete={false}
                  showModalOnPress={true}
                  showModalOnProfilePicturePress={true}
                  iscontact={false}
                />
              ))}
            {roomFound == false && <Text style={tw`text-[${textColor}]`}>No groups found</Text>}
          </ScrollView>
        </View>
      </View>
    </>
  );
}
