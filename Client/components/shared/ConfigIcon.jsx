import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Easing, Pressable, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useThemeColor';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import axios from 'axios';
import getEnvVars from '../../config';
import { useSocket } from '../../context/SocketContext';
import AddDeleteFriendModal from '../modals/AddDeleteFriendModal';
import Loading from './Loading';
import { useLanguage } from '../../context/LanguageContext';
import LanguagesButton from './LanguagesButton';
// import {SERVER_URL, SOCKET_URL} from '@env';
import {  useBusy } from '../../context/BusyContext'; // Importa el BusyProvider y el hook useBusy

const ConfigIcon = ({ handleLogout, chatroom, setModalIconVisible, user, isContact, setLoadingLayout }) => {
  const textColor = useThemeColor({}, 'text');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [userID, setUserID] = useState(null);
  const [userName, setUserName] = useState(null);
  const { SERVER_URL } = getEnvVars();
  const [socket, setSocket] = useState(useSocket());
  const { isBusy, setIsBusy } = useBusy();
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { Texts } = useLanguage();
  const [busyButtonPressable , setBusyButtonPressable] = useState(true);


  // Navigate to ProfileSettingsScreen
  const onPressSettings = () => {
    setDropdownVisible(false);
    navigation.navigate('ProfileSettingsScreen');
  };

  // Get the user
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
  // useEffect(() => {
  //   console.log('isBusy en configIcon' , isBusy);

  //   if (socket === null) return;

  //   isBusy ? socket.close() : socket.open();
  // }, [isBusy]);

  // Toggle busy mode
  const toggleBusyMode = () => {
    if (busyButtonPressable === false) return;
    setDropdownVisible(false);
    setBusyButtonPressable(false);
    // Implement toggleBusy
    axios.post(`${SERVER_URL}/toggleBusy`, { userId: userID }, { withCredentials: true }).then((res) => {
      console.log('Busy mode toggled', res.data.isBusy);
      setIsBusy(res.data.isBusy);
      console.log('res isbusy en configicon', res.data.isBusy);
      setBusyButtonPressable(true);
    }).catch((error) => {
      console.error('Error toggling busy mode:', error);
      setBusyButtonPressable(true);
    });
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

  // delete contact
  const deleteContact = async () => {
    if (isContact) {
      await socket.emit("deleteContact", { username: userName, contact: user });
      navigation.navigate('Contacts');
      setLoadingLayout(true);
      console.log("zz");

    } else if (!isContact) {
      await socket.emit("deleteGroup", { userId: userID, group: user });
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

      <View>
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
                      <Text style={tw`text-lg ${isBusy ? 'text-[red]' : `text-[${textColor}]`}`}>
                        {isBusy ? Texts.EndBusyMode : Texts.BusyMode}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onPressSettings} style={tw`h-1/4 flex-row items-center`}>
                      <Text style={tw`text-lg text-[${textColor}]`} >{Texts.ProfileSettings}</Text>
                    </TouchableOpacity>
                    <LanguagesButton twStyles={"h-1/4 flex-row items-center"} unselectedOpacity={0.1} text={Texts.Language} />
                    <TouchableOpacity onPress={handleLogout} style={tw`h-1/4 flex-row items-center`}>
                      <Text style={tw`text-lg text-[${textColor}]`}>{Texts.LogOut}</Text>
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
                      style={tw`flex justify-center h-1/2`}>
                      <Text style={tw`text-lg text-[${textColor}]`}>
                        {isContact ? Texts.ViewContact : Texts.ViewGroup}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handlePressDeleteContact}
                      style={tw`flex justify-center h-1/2`}>
                      <Text style={tw`text-lg text-[${textColor}]`}>
                        {isContact ? Texts.DeleteContact : Texts.DeleteGroup}
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
            title={isContact ? Texts.UnfriendContactConfirm : Texts.LeaveGroupConfirm}
            acceptButton={Texts.Confirm}
            cancelButton={Texts.Cancel}
            OnAccept={deleteContact}
          />
        )}
      </View>
    </>
  );
};

export default ConfigIcon;