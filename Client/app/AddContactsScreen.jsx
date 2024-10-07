import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Vibration } from "react-native";
import tw from "twrnc";
import { useThemeColor } from "../hooks/useThemeColor";
import axios from "axios";
import ChatComponent from "../components/shared/ChatComponent";
import { useSocket } from "../context/SocketContext";
import Loading from "../components/shared/Loading";
import AddDeleteFriendModal from "../components/modals/AddDeleteFriendModal";
// import getEnvVars from "../config";
import { SERVER_URL } from '@env';
import { useLanguage } from '../context/LanguageContext';

export default function AddContactsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const SoftbackgroundColor = useThemeColor({}, "Softbackground");
  const textColor = useThemeColor({}, "text");
  const inputRef = useRef(null);
  const [text, setText] = useState("");
  const [userFound, setUserFound] = useState(undefined);
  const [username, setUsername] = useState();
  const [userID, setUserID] = useState(null);
  const [socket, setSocket] = useState(useSocket());
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado
  const [users, setUsers] = useState([]);
  const { Texts } = useLanguage();

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

  // ==== Search for users to add friends ====
  const onSearchUser = () => {

    if (username === undefined) {
      console.log("No se ha podido obtener el nombre de usuario");
      return;
    }
    setUserFound(undefined);
    setLoading(true);
    axios
      .post(`${SERVER_URL}/searchUser`, { usernamesearch: text, username: username })
      .then((res) => {
        console.log('RES DATA MUYYYYYYYYYYYYYYYY IMPORTANTE', res.data);
        const usersData = res.data.map((user) => ({
          name: user.username,
          profile: user.profilePicture ?? null,
          info: user.info,
        }));
        setUsers(usersData);
        setUserFound(true);
      })
      .catch((err) => {
        console.error(err);
        setUsers([]);
        setUserFound(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    inputRef.current?.focus();
    if (socket != null) {
      console.log(socket, "socket EN AddContactsScreen");
    }
  }, []);

  // ==== Display Add user modal ====
  const onAdd = (user) => {
    setSelectedUser(user);
    Vibration.vibrate(100);
    setModalVisible(true);
  };

  // ==== Add user to friendlist ====
  const addUser = (message) => {
    console.log("mesasge", message);
    if (socket != null && selectedUser) {
      socket.emit("send_request", { senderId: username, receiverId: selectedUser.name, message: message });
      console.log("Solicitud enviada a:", selectedUser.name);
      setUsers(users.filter((useradded) => useradded.name !== selectedUser.name));
      setModalVisible(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-[${backgroundColor}]`}>
      <View style={tw`w-full h-16 bg-[${SoftbackgroundColor}] flex items-center`}>
        {/* Search for contacts */}
        <View style={tw`w-4/5 flex-row items-center`}>
          <TextInput
            style={tw`h-10 w-11/12 my-3 border-b border-gray-400 px-2 text-[${textColor}]`}
            placeholderTextColor="#9ca3af"
            placeholder= {Texts.AddContactsInput}
            autoFocus={true}
            value={text}
            onChangeText={(e) => {
              setText(e);
              setUserFound(undefined);
            }}
            onSubmitEditing={onSearchUser}
          />
          {/* Delete TextInput value */}
          {text.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setText("");
                setUserFound(undefined);
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
        {/* List of contacts */}
        <ScrollView style={tw` w-full`}>
          {userFound &&
            users.map((user, index) => (
              <ChatComponent
                key={user.id || index}
                user={user}
                onAdd={() => onAdd(user)}
                iconChat={false}
                showModalOnPress={true}
                showModalOnProfilePicturePress={true}
                iscontact={true}
              />
            ))}
          {userFound == false && (
            <Text style={tw`text-[${textColor}] text-2xl  mt-10 font-medium text-center`}>
              No users found
            </Text>
          )}
        </ScrollView>
      </View>
      {/* Add contact modal */}
      {modalVisible && (
        <View style={tw`absolute inset-0 flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <AddDeleteFriendModal
            setModalVisible={setModalVisible}
            modalVisible={modalVisible}
            OnAccept={addUser}
            selectedUser={selectedUser}
            action="add"
            title="Send request to"
            cancelButton="Cancel"
            acceptButton="Send"
            textInput={true}
          />
        </View>
      )}
    </View>
  );
}