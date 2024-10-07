//Client/app/ChatScreen.jsx
import { React, useState, useEffect } from "react";
import { View } from "react-native";
import tw from "twrnc";
import { useRoute } from "@react-navigation/native";
import { useThemeColor } from "../hooks/useThemeColor";
import AudioComponent from "../components/shared/AudioComponent";
import axios from "axios";
import { SERVER_URL, SOCKET_URL } from '@env';

export default function ChatScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const route = useRoute();
  const { user } = route.params;
  console.log("CS params" , route.params);
  const [currentRoom, setCurrentRoom] = useState(user.room);
  const [userID, setUserID] = useState();

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
      {userID != undefined && <AudioComponent currentRoom={currentRoom} sizeInside={74} sizeOutside={84} iconSize={128} cancelButtonMT={"6"}/>}
    </View>
    );
}
