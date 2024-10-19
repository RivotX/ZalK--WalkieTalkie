import { React, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useLanguage } from '../../context/LanguageContext';
import getEnvVars from '../../config';
const { SERVER_URL } = getEnvVars();
import axios from 'axios';
import { useBusy } from '../../context/BusyContext';
import Loading from '../shared/Loading';
import { useSocket } from '../../context/SocketContext';

const IsBusyRequiredModal = ({ setModalVisible, modalVisible, userID }) => {
  const modal_bg_color = useThemeColor({}, 'modal_bg_color');
  const modal_text_color = useThemeColor({}, 'modal_text_color');
  const modal_title_color = useThemeColor({}, 'modal_title_color');
  const accept_button_color = useThemeColor({}, 'Modal_accept_button');
  const decline_button_color = useThemeColor({}, 'Modal_cancel_button');
  const textcolor = useThemeColor({}, 'text');
  const { Texts } = useLanguage();
  const { isBusy, setIsBusy } = useBusy();
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(useSocket());

  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (modalVisible) {
      Vibration.vibrate(200);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        duration: 400,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [modalVisible]);

  // Busy mode
  useEffect(() => {
    console.log('isBusy en configIcon', isBusy);

    if (socket === null) return;

    isBusy ? socket.close() : socket.open();
  }, [isBusy]);

  // Toggle busy mode
  const toggleBusyMode = () => {
    setModalVisible(false);
    setLoading(true);
    // Implement toggleBusy
    axios.post(`${SERVER_URL}/toggleBusy`, { userId: userID }, { withCredentials: true }).then((res) => {
      console.log('Busy mode toggled', res.data.isBusy);
      setIsBusy(res.data.isBusy);
      console.log('res isbusy en configicon', res.data.isBusy);

      setLoading(false);
    }).catch((error) => {
      console.error('Error toggling busy mode:', error);
      setLoading(false);
    });
  };

  return (
    <>
      {loading && (
        <Modal animationType="fade" transparent={true} onRequestClose={() => { }}>
          <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <Loading />
          </View>
        </Modal>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <Pressable
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            style={[tw`w-4/5 bg-${modal_bg_color} rounded-lg p-5 items-center shadow-lg`, { transform: [{ translateY: slideAnim }] }]}
            onStartShouldSetResponder={() => true}
          >
            <TouchableOpacity style={tw`absolute top-[-2] right-[-2] p-4`} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={textcolor} />
            </TouchableOpacity>
            <Text style={[tw`text-xl font-bold mb-2 text-${modal_title_color}`, styles.text]}>{Texts.Alert}</Text>
            <View style={tw`w-full`}>
              <Text style={[tw`text-base mb-4 text-${modal_text_color} text-center`, styles.text]}>
                {Texts.BusyModeAlert1} <Text style={[tw`text-base mb-4 text-[red] text-center`, styles.text]}>
                  {Texts.BusyModeAlert2}</Text>
              </Text>
              <Text style={[tw`text-base mt-2 text-${modal_text_color} text-center`, styles.text]}>
                {Texts.BusyModeAlert3}
              </Text>
            </View>

            <View style={tw`w-full mt-5`}>
              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity
                  style={[tw`flex-1 bg-${decline_button_color} py-2 px-4 rounded-full mx-1`, styles.button]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[tw`text-white font-bold text-center`, styles.text]}>{Texts.BusyModeAlertButton1}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[tw`flex-1 bg-${accept_button_color} py-2 px-4 rounded-full mx-1`, styles.button]}
                  onPress={toggleBusyMode}
                >
                  <Text style={[tw`text-white font-bold text-center`, styles.text]}>{Texts.BusyModeAlertButton2}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    minHeight: 250, // Adjust the height as needed
  },
  text: {
    fontFamily: 'System', // Use the system font which is San Francisco on iOS
  },
  button: {
    minWidth: 100, // Ensure buttons have a minimum width
  },
});

export default IsBusyRequiredModal;