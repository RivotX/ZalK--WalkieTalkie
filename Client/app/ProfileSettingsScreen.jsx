import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, Text, View, TouchableOpacity, Pressable, Animated, Easing, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import tw from "twrnc";
import { useThemeColor } from "../hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import ChangeProfileModal from "../components/modals/ChangeProfileModal";
import axios from "axios";
import getEnvVars from "../config";
import { useNavigation } from "@react-navigation/native";
import ProfileIcon from "../assets/images/images.png";
import Loading from "../components/shared/Loading";
import showAlert from "../components/shared/ShowAlert";
import { useLanguage } from '../context/LanguageContext';
// import {SERVER_URL, SOCKET_URL} from '@env';

const ProfileSettingsScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const disabledText = useThemeColor({}, "disabledText");
  const [isAnimated, setIsAnimated] = useState(false);
  const [isMoved, setIsMoved] = useState(false);
  const [activePressable, setActivePressable] = useState(null);
  const [ChangeProfileModalVisible, setChangeProfileModalVisible] = useState(false);
  const [PropToChange, setPropToChange] = useState("");
  const [ModalIcon, setModalIcon] = useState("");
  const [isPassword, setIsPassword] = useState(false);
  const [user, setUser] = useState({});
  const [userInfo, setUserInfo] = useState("");
  const [currentProp, setCurrentProp] = useState("");
  const [entireUserInfo, setEntireUserInfo] = useState("");
  const [maxLength, setMaxLength] = useState(120);
  const navigation = useNavigation();
  const [profilePicture, setProfilePicture] = useState(null);
  const animation = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const { SERVER_URL } = getEnvVars();
  const { Texts } = useLanguage();

  // ===== Maximum length for the user info in the UI =====
  const MAX_LENGTH = 30;
  const truncatedInfo = (info) => {
    return info.length > MAX_LENGTH ? `${info.substring(0, MAX_LENGTH)}...` : info;
  };
  // Get session
  useEffect(() => {
    axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        console.log("res.data", res.data);
        setUser({
          id: res.data.user.id,
          name: res.data.user.username,
          profile: res.data.user.profilePicture ?? null,
          info: res.data.user.info,
          isBusy: res.data.user.isBusy,
          email: res.data.user.email,
        })
        if (res.data.user.info) {
          setEntireUserInfo(res.data.user.info);
          setUserInfo(truncatedInfo(res.data.user.info));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    fetchProfilePicture();
  }, [user.id]);

  // Regresh session
  const refreshSession = () => {
    axios.post(`${SERVER_URL}/refreshSession`, { id: user.id }, { withCredentials: true })
      .then((res) => {
        setEntireUserInfo(res.data.user.info);
        setUserInfo(truncatedInfo(res.data.user.info));
        setUser({
          id: res.data.user.id,
          name: res.data.user.username,
          profile: res.data.user.profilePicture ?? null,
          info: res.data.user.info,
          email: res.data.user.email,
        })
      })
      .catch((error) => {
        console.log(error);
      })
  };

  // ===== Upload profile picture =====
  const uploadImage = async () => {
    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    console.log("ImagePicker result: ", image);

    if (image.assets && image.assets.length > 0) {
      // Upload the image to the server
      if(image.assets[0].fileSize > 10000000) { 
        showAlert("Error", `${Texts.ImageSizeError }`);
        return;
      }
      const formData = new FormData();
      formData.append("file", {
        uri: image.assets[0].uri,
        type: image.assets[0].mimeType,
        name: image.assets[0].fileName,
      });
      try {
        setLoading(true);

        const response = await fetch(SERVER_URL + "/upload", {
          method: "POST",
          body: formData,
        });
        let responseJson = await response.json();
        console.log("responseJson", responseJson);

        if (responseJson.fileUrl) {
          // Save the image URL to your database
          const imageUrl = responseJson.fileUrl;
          const userId = user.id; // Replace with the actual user ID
          await axios.post(SERVER_URL + "/save-image-url", { profilePicture: imageUrl, userId })
            .then((res) => {
              console.log("Image uploaded successfully: ", res.data);
              setUser((prevUser) => ({ ...prevUser, profile: imageUrl }));
            })
            .catch((error) => {
              console.error("Error saving image URL:", error);

            }).finally(() => {
              setLoading(false)
            });
        }
      } catch (error) {
        console.error("Error uploading image: ", error);
        setLoading(false);
        showAlert("Error", "Error uploading image");
      }
    } else {
      console.log("No image selected");
    }
  };

  // ===== Change profile info =====
  const openModal = (id) => {
    console.log("openModal called with id:", id);
    if (id === "password") {
      setPropToChange("password");
      setModalIcon("lock-closed-outline");
      setIsPassword(true);
      setMaxLength(30);
    } else if (id === "info") {
      setPropToChange("info");
      setModalIcon("person-outline");
      setCurrentProp(entireUserInfo);
      setIsPassword(false);
      setMaxLength(120);
    } else if (id === "email") {
      setPropToChange("email");
      setModalIcon("mail-outline");
      setCurrentProp(user.email);
      setIsPassword(false);
      setMaxLength(100);
    } else if (id === "username") {
      setPropToChange("username");
      setModalIcon("information-circle-outline");
      setCurrentProp(user.name);
      setIsPassword(false);
      setMaxLength(30);
    }
    setChangeProfileModalVisible(true);
    console.log("ChangeProfileModalVisible set to true");
  };

  // ===== Get the profile picture from server =====
  const fetchProfilePicture = async () => {
    if (!user.id) return;
    try {
      console.log("userID: ", user.id);
      const response = await axios.get(`${SERVER_URL}/get-image-url/${user.id}`);
      setUser((prevUser) => ({
        ...prevUser,
        profile: response.data.profilePicture,
      }));
      console.log("response.data.profilePicture", response.data.profilePicture);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };
  useEffect(() => {
  console.log("user.profile", user.profile);
  }, [user.profile]);


  // ===== Animation onPress or OnPressOut info =====
  const handlePress = (id) => {
    if (!isAnimated || activePressable !== id) {
      setActivePressable(id);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => setIsAnimated(true));
    }
  };

  // ===== Animation onPressOut info =====
  const handlePressOut = (id) => {
    console.log("handlePressOut called with id:", id);
    if (!isMoved) {
      openModal(id);
    }
    handleOutsidePress();
    setIsMoved(false);
  };

  const handleMove = () => {
    setIsMoved(true);
  };

  const handleOutsidePress = () => {
    if (isAnimated) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => setIsAnimated(false));
    }
  };

  const setModalVisibility = (value) => {
    setChangeProfileModalVisible(value);
    handleOutsidePress();
  };

  // ===== Animation styles for info elements =====
  const animatedStyle = {
    backgroundColor: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(0, 0, 0, 0)", "rgba(211, 211, 211, 0.1)"],
    }),
    width: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    }),
    left: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["50%", "0%"],
    }),
    right: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["50%", "0%"],
    }),
  };

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 bg-[${backgroundColor}]`}>
        <View style={tw`w-full h-1/3 flex items-center justify-center mt-2`}>
          <TouchableOpacity
            style={tw`bg-black h-42 w-42 rounded-full relative`}
            onPress={() => navigation.navigate("ProfilePictureScreen", { user: user, isContact: true })}
          >
            {loading ? (
              <Loading />
            ) : (
              user.profile ? (
                <Image source={{ uri: user.profile }} style={tw`size-full rounded-full`} />
              ) : (
                <Image source={ProfileIcon} style={tw`size-full rounded-full`} />
              )
            )}
            <TouchableOpacity
              onPress={uploadImage}
              style={tw`bg-yellow-600 h-12 w-12 rounded-full absolute bottom-0 right-0 m-1 flex items-center justify-center`}
            >
              <Ionicons name="image-outline" size={24} color={textColor} />
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={tw`text-[${textColor}] text-lg`}>{user.name}</Text>
        </View>
        <View style={tw`w-full flex items-center justify-center gap-2`}>
          {/* User name */}
          <Pressable
            onPressIn={() => handlePress("username")}
            onPressOut={() => handlePressOut("username")}
            onPressMove={handleMove}
            style={tw`w-full flex flex-col items-start px-1`}
          >
            <View style={tw`w-full flex flex-row items-center`}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="information-circle-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2`}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${disabledText}] mb-1`}>{Texts.Username}</Text>
                    <Text style={tw`text-[${textColor}]`}>{user.name}</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
            {activePressable === "username" && <Animated.View style={[tw`absolute left-0 top-0 bottom-0`, animatedStyle]} />}
          </Pressable>
          {/* User info */}
          <Pressable
            onPressIn={() => handlePress("info")}
            onPressOut={() => handlePressOut("info")}
            onPressMove={handleMove}
            style={tw`w-full flex flex-col items-start px-1`}
          >
            <View style={tw`w-full flex flex-row items-center`}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="person-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2`}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${disabledText}] mb-1`}>{Texts.Info}</Text>
                    <Text style={tw`text-[${textColor}]`}>{userInfo}</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
            {activePressable === "info" && <Animated.View style={[tw`absolute left-0 top-0 bottom-0`, animatedStyle]} />}
          </Pressable>
          {/* Email */}
          <Pressable
            onPressIn={() => handlePress("email")}
            onPressOut={() => handlePressOut("email")}
            onPressMove={handleMove}
            style={tw`w-full flex flex-col items-start px-1`}
          >
            <View style={tw`w-full flex flex-row items-center`}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="mail-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2`}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${disabledText}] mb-1`}>{Texts.Email}</Text>
                    <Text style={tw`text-[${textColor}]`}>{user.email}</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
            {activePressable === "email" && <Animated.View style={[tw`absolute left-0 top-0 bottom-0`, animatedStyle]} />}
          </Pressable>
          {/* Password */}
          <Pressable
            onPressIn={() => handlePress("password")}
            onPressOut={() => handlePressOut("password")}
            onPressMove={handleMove}
            style={tw`w-full flex flex-col items-start px-1`}
          >
            <View style={tw`w-full flex flex-row items-center`}>
              <View style={tw`w-[10%] flex items-center`}>
                <Ionicons name="lock-closed-outline" size={20} color={textColor} />
              </View>
              <View style={tw`w-5/6 flex flex-col border-b border-gray-400 py-3 ml-2`}>
                <View style={tw`flex-row w-full justify-between items-center`}>
                  <View>
                    <Text style={tw`text-[${disabledText}] mb-1`}>{Texts.Password}</Text>
                    <Text style={tw`text-[${textColor}]`}>***</Text>
                  </View>
                  <Ionicons name="build-outline" size={20} color={textColor} />
                </View>
              </View>
            </View>
            {activePressable === "password" && <Animated.View style={[tw`absolute left-0 top-0 bottom-0`, animatedStyle]} />}
          </Pressable>
        </View>
        {/* ChangeProfileModal */}
        {ChangeProfileModalVisible && (
          <ChangeProfileModal
            ModalIcon={ModalIcon}
            PropToChange={PropToChange}
            setModalVisibility={setModalVisibility}
            isPassword={isPassword}
            refreshSession={refreshSession}
            userID={user.id}
            currentProp={currentProp}
            maxLength={maxLength}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ProfileSettingsScreen;