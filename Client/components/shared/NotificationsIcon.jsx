import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import getEnvVars from "../../config";
// import {SERVER_URL, SOCKET_URL} from '@env';

const NotificationsIcon = () => {
  const textColor = useThemeColor({}, "text");
  const navigation = useNavigation();
  const [requestCount, setRequestCount] = useState(0);
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [userID, setUserID] = useState(null);
  const { SERVER_URL } = getEnvVars();

  // Get number of requests from sessions
  useEffect(() => {
    axios
      .get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setRequestCount(JSON.parse(res.data.user.requests).length);
        setUserID(res.data.user.id);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  //Escucha el evento de refrescar contactos enviado desde el servidor
  useEffect(() => {
    if (userID != null) {
      if (socket === null) return;
      socket.on("refreshcontacts", () => {
        axios
          .post(`${SERVER_URL}/refreshSession`, { id: userID }, { withCredentials: true })
          .then((res) => {
            setRequestCount(JSON.parse(res.data.user.requests).length);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  }, [userID]);

  return (
    <TouchableOpacity onPress={() => navigation.navigate("NotificationsScreen")}>
      <View>
        <Ionicons name="mail-outline" size={24} color={textColor} style={tw`px-3`} />
        {requestCount > 0 && (
          <View style={tw`absolute right-2 top-[-1.3] bg-red-600 rounded-full  w-[15px] h-[15px] justify-center items-center `}>
            <Text style={tw`text-white text-xs`}>{requestCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default NotificationsIcon;