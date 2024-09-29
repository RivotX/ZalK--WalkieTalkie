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

const ConfigIcon = ({ setIsBusyLayout, handleLogout, chatroom, setModalIconVisible, user }) => {
  const textColor = useThemeColor({}, 'text');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation(); // Use the useNavigation hook
  const [userID, setUserID] = useState(null);
  const { SERVER_URL } = getEnvVars();
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [isBusy, setIsBusy] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setloading] = useState(false);

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
    setloading(true);
    // Implement toggleBusy
    axios.post(`${SERVER_URL}/toggleBusy`, { userId: userID }, { withCredentials: true }).then((res) => {
      console.log('Busy mode toggled', isBusy);
      setloading(false);
    });
    setIsBusy(!isBusy);
    setIsBusyLayout(!isBusy);
  };

  // Animation for the dropdown menu
  useEffect(() => {
    const expandedHeight = chatroom ? 120 : 170; // Adjust height based on chatroom prop
    if (dropdownVisible) {
      setModalVisible(true);
      Animated.timing(heightAnim, {
        toValue: expandedHeight,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 120,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }).start(() => setModalVisible(false));
    }
  }, [dropdownVisible, chatroom]);

  // onPress delete contact button (show modal)
  const handlePressDeleteContact = () => {
    setDeleteModalVisible(true);
    Vibration.vibrate(100);
    setDropdownVisible(false);
  };

  //delete contact

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
          <Pressable style={tw`flex-1 justify-start items-end pt-14 `} onPress={() => setDropdownVisible(false)}>
            <Animated.View style={[tw`w-2/5 px-2 py-5 bg-[${SoftbackgroundColor}] rounded-lg shadow-md justify-between`, { height: heightAnim }]}>
              {!chatroom ? (
                <>
                  {/* App settings */}
                  <TouchableOpacity onPress={toggleBusyMode}>
                    <Text style={tw`text-lg text-[${textColor}]`}>Busy mode</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onPressSettings}>
                    <Text style={tw`text-lg text-[${textColor}]`}>Profile settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleLogout}>
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
                    <Text style={tw`text-lg text-[${textColor}]`}>View Contact</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePressDeleteContact}>
                    <Text style={tw`text-lg text-[${textColor}]`}>Delete Contact</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </Pressable>
        </Modal>

        {/* Delete contact */}
        {deleteModalVisible && (
          <AddDeleteFriendModal setModalVisible={setDeleteModalVisible}
            modalVisible={deleteModalVisible}
            selectedUser={user}
            action="delete"
            title={"You are about to unfriend"}
            acceptButton={"Confirm"}
            cancelButton={"Cancel"}
          />
        )}
      </View>
    </>
  );
};

export default ConfigIcon;
