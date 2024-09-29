import { React, useState, useEffect } from "react";
import { SafeAreaView, Image, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import tw from "twrnc";
import { useThemeColor } from "../hooks/useThemeColor";
import ProfileIcon from "../assets/images/images.png";
import getEnvVars from "../config";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

const ProfilePictureScreen = () => {
  const route = useRoute();
  const backgroundColor = useThemeColor({}, "background");
  const { userID } = route.params;
  const { SERVER_URL } = getEnvVars();
  const [info, setInfo] = useState();
  const textColor = useThemeColor({}, "text");
  // Get the info from session
  useEffect(() => {
    axios
      .get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setInfo(res.data.user.info);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // ===== Fetches the user profile picture =======

  const [profilePicture, setProfilePicture] = useState(null);
  useEffect(() => {
    fetchProfilePicture();
  }, [userID]);

  const fetchProfilePicture = async () => {
    if (!userID) return;
    try {
      console.log("userID: ", userID);
      const response = await axios.get(`${SERVER_URL}/get-image-url/${userID}`);
      setProfilePicture(response.data.profilePicture);
      console.log("response.data.profilePicture", response.data.profilePicture);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 bg-[${backgroundColor}]  items-center`}>
        <View style={tw`w-4/5 h-1/2 `}>
          <Image source={profilePicture ? { uri: profilePicture } : ProfileIcon} style={tw`size-full  `} resizeMode="cover" />
        </View>
        <Text style={tw`text-[${textColor}]`}>{info}</Text>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ProfilePictureScreen;
