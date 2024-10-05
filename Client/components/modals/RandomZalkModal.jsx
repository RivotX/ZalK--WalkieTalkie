import { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Vibration, Pressable } from 'react-native';
import tw from 'twrnc';
import { useSocket } from '../../context/SocketContext';
import Loading from '../shared/Loading';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';

const RandomZalkModal = ({ userID, onClose }) => {
  const socket = useSocket();
  const [isStarted, setIsStarted] = useState(false);
  const modal_bg_color = useThemeColor({}, 'modal_bg_color');
  const modal_text_color = useThemeColor({}, 'modal_text_color');
  const modal_title_color = useThemeColor({}, 'modal_title_color');
  const Modal_accept_button = useThemeColor({}, 'Modal_accept_button');
  const Modal_cancel_button = useThemeColor({}, 'Modal_cancel_button');
  const RZ_connection_text_color = useThemeColor({}, 'RZ_connection_text_color');
  const navigation = useNavigation();
  const [shouldClose, setShouldClose] = useState(false);
  const [randomUser, setRandomUser] = useState({});
  const { Texts } = useLanguage();

  const startSearch = () => {
    setIsStarted(true);
    console.log('Buscando conexion aleatoria');
    socket.emit('random_zalk', userID);
  };

  const stopSearch = () => {
    setIsStarted(false);
    socket.emit('leave_waiting', userID);
  };

  // ==== Close modal and navigates to RandomZalkScreen when connection is established ====
  useEffect(() => {
    socket.on('room_assigned', (room, username, userID) => {
      setRandomUser({ room, username, userID });
      console.log('Room assigned', room, username, userID);
      setShouldClose(true);
    });
  }, [socket]);

  useEffect(() => {
    if (shouldClose) {
      onClose();
      Vibration.vibrate(500);
      navigation.navigate('RandomZalkScreen', {randomUser:randomUser});
    }
  }, [shouldClose, onClose]);

  return (
    <Modal animationType="fade" transparent={true} onRequestClose={onClose}>
      <Pressable style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`} onPress={onClose}>
        <View style={tw`bg-${modal_bg_color} rounded-lg shadow-lg p-6 w-11/12 max-w-md`}>
          {!isStarted ? (
            <>
              <Text style={tw`text-2xl font-semibold mb-4 text-${modal_title_color}`}>{Texts.RandomZalk}</Text>
              <View style={tw`mb-6 flex gap-5`}>
                <View style={tw`flex-row items-start`}>
                  <Text style={tw`text-${modal_text_color}`}>• </Text>
                  <Text style={tw`flex-1 text-${modal_text_color} text-[15px]`}>
                    <Text style={tw`text-green-500 font-semibold text-[15px]`}>{Texts.Anonymous}</Text> {Texts.and}{' '}
                    <Text style={tw`text-green-500 font-semibold text-[15px]`}>{Texts.temporary}</Text> {Texts.RZmodalFirstPar}
                  </Text>
                </View>
                <View style={tw`flex-row items-start`}>
                  <Text style={tw`text-${modal_text_color}`}>• </Text>
                  <Text style={tw`flex-1 text-${modal_text_color} text-[15px]`}>
                    <Text style={tw`text-blue-500 font-semibold text-[15px]`}>{Texts.TapStart}</Text> {Texts.RZToSearch}
                  </Text>
                </View>
                <View style={tw`flex-row items-start`}>
                  <Text style={tw`text-${modal_text_color}`}>• </Text>
                  <Text style={tw`flex-1 text-${modal_text_color} text-[15px]`}>
                    <Text style={tw`text-red-500 font-semibold text-[15px]`}>{Texts.ThreeMin}</Text> {Texts.RZConnect}
                  </Text>
                </View>
              </View>
              <Text style={tw`font-bold text-${RZ_connection_text_color} mb-6 text-sm`}>{Texts.RZReady}</Text>
              <TouchableOpacity style={tw`bg-${Modal_accept_button} rounded-full py-2 px-4 mb-4`} onPress={startSearch}>
                <Text style={tw`text-white text-center`}>{Texts.RZStartButton}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`bg-${Modal_cancel_button} rounded-full py-2 px-4`} onPress={onClose}>
                <Text style={tw`text-${modal_text_color} text-center`}>{Texts.RZCancelButton}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={tw`font-bold text-${RZ_connection_text_color} mb-4 text-center text-base `}>{Texts.RZSearchingCon}</Text>
              <View style={tw`mb-4`}>
                <Loading />
              </View>
              <TouchableOpacity style={tw`bg-${Modal_cancel_button} rounded-full py-2 px-4`} onPress={stopSearch}>
                <Text style={tw`text-${modal_text_color} text-center`}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

export default RandomZalkModal;