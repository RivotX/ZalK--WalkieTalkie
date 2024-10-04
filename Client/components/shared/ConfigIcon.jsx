import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Easing, Pressable, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useThemeColor';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import axios from 'axios';
import getEnvVars from '../../config';
import { useSocket } from '../context/SocketContext';
import AddDeleteFriendModal from '../modals/AddDeleteFriendModal';
import Loading from './Loading';
import CountryFlag from "react-native-country-flag";

const ConfigIcon = ({ setIsBusyLayout, handleLogout, chatroom, setModalIconVisible, user, isContact, setLoadingLayout }) => {
  const textColor = useThemeColor({}, 'text');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation(); // Use the useNavigation hook
  const [userID, setUserID] = useState(null);
  const [userName, setUserName] = useState(null);
  const { SERVER_URL } = getEnvVars();
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [isBusy, setIsBusy] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current; // Nueva animación de opacidad
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Navigate to ProfileSettingsScreen
  const onPressSettings = () => {
    setDropdownVisible(false);
    navigation.navigate('ProfileSettingsScreen');
  };

  // Get the user ID
  useEffect(() => {
    axios
      .get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUserID(res.data.user.id);
        setUserName(res.data.user.username);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Busy mode
  useEffect(() => {
    if (socket === null) return;

    isBusy ? socket.close() : socket.open();
  }, [isBusy]);

  // Toggle busy mode
  const toggleBusyMode = () => {
    setDropdownVisible(false);
    setLoading(true);
    // Implement toggleBusy
    axios.post(`${SERVER_URL}/toggleBusy`, { userId: userID }, { withCredentials: true }).then((res) => {
      console.log('Busy mode toggled', isBusy);
      setLoading(false);
    });
    setIsBusy(!isBusy);
    setIsBusyLayout(!isBusy);
  };

  // Animation for the dropdown menu
  useEffect(() => {
    const expandedHeight = chatroom ? 120 : 260; // altura del modal
    if (dropdownVisible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: expandedHeight,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 80,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        })
      ]).start(() => setModalVisible(false));
    }
  }, [dropdownVisible, chatroom]);

  // onPress delete contact button (show modal)
  const handlePressDeleteContact = () => {
    setDeleteModalVisible(true);
    Vibration.vibrate(100);
    setDropdownVisible(false);
  };

  //delete contact
  const deleteContact = async () => {
    if (isContact) {
      await socket.emit("deleteContact", { username: userName, contact: user });
      navigation.navigate('Contacts');
      setLoadingLayout(true);
      console.log("zz");

    } else if (!isContact) {
      await socket.emit("deleteGroup", { username: userName, group: user });
      navigation.navigate('Groups');
      setLoadingLayout(true);
      console.log("xxx");

    }
  }

  return (
    <>
      {loading && (
        <Modal animationType="fade" transparent={true} onRequestClose={() => { }}>
          <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <Loading />
          </View>
        </Modal>
      )}

      <View style={tw`relative`}>
        {/* Settings icon */}
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)} style={tw`px-3`}>
          <Ionicons name="ellipsis-vertical-outline" size={24} color={textColor} />
        </TouchableOpacity>

        {/* Modal */}
        <Modal visible={modalVisible} transparent={true} onRequestClose={() => setDropdownVisible(false)}>
          <Pressable style={tw`flex-1 justify-start items-end pt-14`} onPress={() => setDropdownVisible(false)}>
            <Animated.View style={[tw`w-1/2 bg-[${SoftbackgroundColor}] rounded-lg shadow-md justify-center`, { height: heightAnim }]}>
              <Animated.View style={[tw`px-2 py-2`, { opacity: opacityAnim }]}>
                {!chatroom ? (
                  <>
                    {/* App settings */}
                    <TouchableOpacity onPress={toggleBusyMode} style={tw`h-1/4 flex-row items-center`}>
                      <Text style={tw`text-lg text-[${textColor}]`} >Busy mode</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onPressSettings} style={tw`h-1/4 flex-row items-center`}>
                      <Text style={tw`text-lg text-[${textColor}]`} >Profile settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={tw`h-1/4 flex-row items-center`}>
                      <Text style={tw`text-lg text-[${textColor}] mr-2`}>Language</Text>
                      <CountryFlag isoCode="es" size={20} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={tw`h-1/4 flex-row items-center`}>
                      <Text style={tw`text-lg text-[${textColor}]`}>Log out</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* Chatroom settings */}
                    <TouchableOpacity
                      onPress={() => {
                        setModalIconVisible(true);
                        setDropdownVisible(false);
                      }}
                    >
                      <Text style={tw`text-lg text-[${textColor}]`}>
                        {isContact ? 'View Contact' : 'View Group'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePressDeleteContact}>
                      <Text style={tw`text-lg text-[${textColor}]`}>
                        {isContact ? 'Delete Contact' : 'Delete Group'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </Animated.View>
            </Animated.View>
          </Pressable>
        </Modal>

        {/* Delete contact */}
        {deleteModalVisible && (
          <AddDeleteFriendModal
            setModalVisible={setDeleteModalVisible}
            modalVisible={deleteModalVisible}
            selectedUser={user}
            action="delete"
            title={"You are about to unfriend"}
            acceptButton={"Confirm"}
            cancelButton={"Cancel"}
            OnAccept={deleteContact}
          />
        )}
      </View>
    </>
  );
};

export default ConfigIcon;