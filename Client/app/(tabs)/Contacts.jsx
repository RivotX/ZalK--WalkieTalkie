import { React, useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { useThemeColor } from "../../hooks/useThemeColor";
import { useNavigation } from "@react-navigation/native";
import ChatComponent from "../../components/shared/ChatComponent";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";
import getEnvVars from "../../config";
import Loading from "../../components/shared/Loading";
import ProfileIcon from "../../assets/images/ProfileIcon.png";
import FloatingAddButton from "../../components/shared/FloatingAddButton";

const ContactsScreen = ({ setLoadingLayout }) => {
  const backgroundColor = useThemeColor({}, "background");
  const navigation = useNavigation();
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [contacts, setContacts] = useState([]);
  const [username, setUsername] = useState(null);
  const textColor = useThemeColor({}, "text");
  const [userID, setUserID] = useState(null);
  const { SERVER_URL } = getEnvVars();
  const [loading, setLoading] = useState(false);

  // ===== Get the user ID and username =====
  useEffect(() => {
    if (socket != null) {
      console.log(socket, "socket EN CONTACTS");
      axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => {
          setUsername(res.data.user.username);
          setUserID(res.data.user.id);
          console.log("usuario definidon en contacts", res.data.user.username);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  // ==== Get contacts ====
  const getContacts = () => {
    console.log("asd");
    setLoadingLayout(true);
    axios.post(`${SERVER_URL}/getContacts`, { userId: userID }, { withCredentials: true })
      .then((res) => {
        console.log("CONTACTS DEL ENDPOINT GETCONTACTS TABLE", res.data);
        const lastcontacts = res.data.map((contact) => ({
          // Parsea los contactos y los guarda en el estado SE DEBE HACER UN ENDPOINT PARA OBTENER LA FOTO DEL CONTACTO
          name: contact.User.username,
          room: contact.room,
          profile: contact.User.profilePicture ?? null,
          info: contact.User.info,
          isBusy: contact.User.isBusy,
        }));
        console.log("LAST CONTACTS", lastcontacts);
        setContacts(lastcontacts);
      }).catch(() => {
        setLoadingLayout(false);
      }).finally(() => {
        setLoadingLayout(false);
      });
  }


  // ===== Refresh contacts =====
  useEffect(() => {
    if (userID != null) {
      getContacts();
      socket.on("refreshcontacts", () => {
        getContacts();
      });
    }
  }, [userID]);

  return (
    <View style={tw`flex-1 items-center bg-[${backgroundColor}]`}>
      {/* Loading */}
      {loading ? (
        <View style={tw`flex w-full items-center h-1/3`}>
          <Loading />
        </View>
      ) : (
        <>
          {/* Display contacts */}
          <ScrollView style={tw`w-full`}>
            {contacts.length === 0 ? (
              <Text style={tw`text-[${textColor}] text-2xl mt-10 font-medium text-center`}>Add a contact to get started</Text>
            ) : (
              contacts.map((contact, index) => (
                <ChatComponent
                  user={contact}
                  key={index}
                  onGeneralPress={() => navigation.navigate("ChatScreen", { user: contact, isContact: true })}
                  iscontact={true}
                  iconDelete={true}
                  setLoading={setLoading}
                  showModalOnProfilePicturePress={true}
                />
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Add Contacts Button */}
      <FloatingAddButton
        OnNavigate={() => {
          navigation.navigate('AddContactsScreen');
        }}
        icon={'add-outline'}
        iconColor={textColor}
      />
    </View>
  );
}

export default ContactsScreen;