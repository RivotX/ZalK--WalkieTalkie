//Client/app/(tabs)/AddContactsScreen.jsx
import { React, useState, useEffect } from "react";
import { View } from "react-native";
import tw from "twrnc";
import { useRoute } from "@react-navigation/native";
import { useThemeColor } from "../hooks/useThemeColor";
import AudioComponent from "../components/shared/AudioComponent";
import axios from "axios";
import getEnvVars from "../config";

export default function ChatScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const route = useRoute();
  const { user } = route.params;
  console.log(route.params);
  const [currentRoom, setCurrentRoom] = useState(user.room);
  const [userID, setUserID] = useState();
  const { SERVER_URL } = getEnvVars();

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUserID(res.data.user.id);
        console.log("SESSIONES EN CHATROOM", res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <View style={tw`flex-1 bg-[${backgroundColor}] items-center justify-center`}>
      {userID != undefined && <AudioComponent currentRoom={currentRoom} />}
    </View>
    );
}
