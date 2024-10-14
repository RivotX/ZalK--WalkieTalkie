import React, { useEffect, useState, useRef } from "react";
import { TouchableOpacity, Modal, Image, Text, View, Animated, Easing, Dimensions } from "react-native";
import tw from "twrnc";
import ProfileIcon from "../../assets/images/images.png";
import groupicon from "../../assets/images/groupicon.png";
import { useThemeColor } from "../../hooks/useThemeColor";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";
import getEnvVars from "../../config";
const { SERVER_URL } = getEnvVars();
import { useNavigation } from '@react-navigation/native';

const UserProfileMiniModal = ({ user, modalIconVisible, setModalIconVisible, iconSize, isContact, initialPosition }) => {
  const textColor = useThemeColor({}, "text");
  const [qty, setQty] = useState(null);
  const [members, setMembers] = useState([]);
  const { Texts } = useLanguage();
  const [hideText, setHideText] = useState(false);
  const [hideInfo, setHideInfo] = useState(true);
  const [modalOpacity, setModalOpacity] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const position = useRef(new Animated.ValueXY({ x: initialPosition?.x || 0, y: (initialPosition?.y || 0) - 28 })).current;
  const size = useRef(new Animated.Value(56)).current;
  const borderRadius = useRef(new Animated.Value(0)).current;
  console.log("UserProfileMiniModal: ", user);
  const navigation = useNavigation();
  const UserProfileMiniModal_BG = useThemeColor({}, "UserProfileMiniModal_BG");

  // Fetch group members
  useEffect(() => {
    if (!isContact) {
      axios.post(`${SERVER_URL}/getGroupMembers`, { groupId: user.id }).then((res) => {
        console.log("Members: ", res.data);
        setQty(res.data.length);
        setMembers(res.data);
      }).catch((error) => {
        console.log(error);
      });
    }
  }, [user]);

  // ==== Open Modal animation ====
  useEffect(() => {
    if (modalIconVisible && initialPosition) {

      setModalOpacity(50);
      const screenWidth = Dimensions.get('window').width;
      const screenHeight = Dimensions.get('window').height;

      const centerX = ((screenWidth - 56) / 2) / 2;
      const centerY = ((screenHeight - 56) / 2) / 4;

      Animated.parallel([
        Animated.timing(position, {
          toValue: {
            x: centerX,
            y: centerY
          },
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(size, {
          toValue: 268,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(borderRadius, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start(() => setHideInfo(false));
    }
  }, [modalIconVisible, initialPosition]);

  // ==== Close Modal animation ====
  const handleCloseModal = () => {
    if (isClosing) return; // Prevent closing if already in progress

    setIsClosing(true);
    setModalOpacity(0);
    console.log("Closing modal");
    setHideText(true);
    setHideInfo(true);

    Animated.parallel([
      Animated.timing(position, {
        toValue: {
          x: initialPosition.x,
          y: initialPosition.y - 29
        },
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(size, {
        toValue: 56,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(borderRadius, {
        toValue: 28, // Half of the final size (56 / 2)
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      console.log("Reverse animation completed");
      setModalIconVisible(false);
      setHideText(false);
      setHideInfo(false);
      setIsClosing(false);
    });
  };
  // ==== Handle profile image press ====
  const handleProfileImagePress = () => {
    navigation.navigate("ProfilePictureScreen", { user, isContact });
    setModalIconVisible(false);
    setHideText(false);
    setHideInfo(false);
  };

  return (
    <Modal animationType="fade" transparent={true} visible={modalIconVisible} onRequestClose={handleCloseModal}>
      <TouchableOpacity
        style={tw`flex-1 justify-start items-center bg-black bg-opacity-${modalOpacity}`}
        activeOpacity={1}
        onPress={handleCloseModal}
      >
        <Animated.View style={[tw`absolute`, { top: position.y, left: position.x, width: size, height: size }]}>
          {/* Profile image */}
          <TouchableOpacity onPress={handleProfileImagePress}>
            <Animated.Image
              style={[{ width: size, height: size, resizeMode: "cover", borderRadius }]}
              source={user.profile ? { uri: user.profile } : isContact ? ProfileIcon : groupicon}
            />
          </TouchableOpacity>
          {/* User name */}
          {!hideInfo && (
            <Animated.View style={[tw`absolute top-0 left-0 justify-start items-start bg-black bg-opacity-50 px-2 py-1`, { width: size }]}>
              <Text style={tw`text-white text-left text-lg`}>{user.name}</Text>
            </Animated.View>
          )}
          {/* User info */}
          {!hideInfo && user.info && (
            <Animated.View style={[tw`bg-${UserProfileMiniModal_BG} bg-opacity-10 p-3`, { width: size }]}>
              <Text style={tw`text-[#ECEDEE] text-center italic w-full`}>{user.info}</Text>
            </Animated.View>
          )}
          {/* Group members */}
          {!hideText && members.length != 0 && (
            <Animated.View style={[tw`bg-black bg-opacity-10 p-3 mt-2`, { width: size }]}>
              <Text style={tw`text-[${textColor}] text-center mt-4`}>
                <Text style={tw`text-[${textColor}] text-center font-bold`}>
                  {qty != null && `${Texts.Members} : ${qty}`}
                </Text>
              </Text>
              {members.map((member, index) => (
                <Text key={index} style={tw`text-[${textColor}] text-center`}>
                  - {member.username}
                </Text>
              ))}
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default UserProfileMiniModal;