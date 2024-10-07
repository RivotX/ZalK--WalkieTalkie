import { React, useState, useEffect } from "react";
import { SafeAreaView, Image, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import tw from "twrnc";
import { useThemeColor } from "../hooks/useThemeColor";
import ProfileIcon from "../assets/images/images.png";
import { SERVER_URL } from '@env';

import axios from "axios";
import { useRoute } from "@react-navigation/native";
import Loading from "../components/shared/Loading";

const ProfilePictureScreen = () => {
  const route = useRoute();
  const backgroundColor = useThemeColor({}, "background");
  const { userID } = route.params;
  const [userName, setUserName] = useState(null);
  const [info, setInfo] = useState();
  const textColor = useThemeColor({}, "text");
  const [loading, setLoading] = useState(true);
  // Get the info from session
  useEffect(() => {
    axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setInfo(res.data.user.info);
        setUserName(res.data.user.username);
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
      setLoading(false);
      console.log("response.data.profilePicture", response.data.profilePicture);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 bg-[${backgroundColor}] items-center justify-start`}>
        <View style={tw`w-4/5 h-1/2 bg-[${backgroundColor}] mt-[10%]`}>
          {loading
            ? <Loading />
            : (
              <>
                <Text style={tw`text-[${textColor}] text-4xl font-bold text-center my-4 py-2 border-b  border-gray-400 w-full`}>{userName}</Text>

                <Image source={profilePicture ? { uri: profilePicture } : ProfileIcon} style={tw`size-full`} resizeMode="cover" />
                <Text style={tw`text-[${textColor}] text-lg font-bold text-center mt-4 mb-2 border-t border-gray-400 w-full`}>{info}</Text>
              </>
            )
          }
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ProfilePictureScreen;
