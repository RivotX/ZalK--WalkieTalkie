import { React, useState, useEffect, useRef } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import tw from "twrnc";
import { useThemeColor } from "../../hooks/useThemeColor";
import axios from "axios";
import getEnvVars from "../../config";
import Loading from "../shared/Loading";
const { SERVER_URL } = getEnvVars();

const ChangeProfileModal = ({ PropToChange, setModalVisibility, ModalIcon, isPassword, refreshSession, userID, currentProp }) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [newProp, setNewProp] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const textInputRef = useRef(null);

  useEffect(() => {
    if (textInputRef.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          textInputRef.current.focus();
        }, 100);
      });
    }
  }, []);


  // inicia el valor de newProp con el valor actual de la propiedad
  useEffect(() => {
    if (!isPassword) {
      setNewProp(currentProp);
    }
  }, [isPassword, currentProp]);

  // Function to show alert based on platform
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message, [{ text: "OK" }]);
    }
  };

  // validate form
  const validateForm = () => {
    if (newProp.trim().length === 0) {
      showAlert("Invalid " + PropToChange, "The new " + PropToChange + " cannot be empty");
      return false;
    }
    if (isPassword && newProp.trim().length < 8) {
      showAlert("Invalid password", "Password must be at least 8 characters.");
      return false;
    }
    if (PropToChange === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newProp)) {
        showAlert("Invalid Email", "Please enter a valid email address.");
        return false;
      }
    }
    if (PropToChange === "info" && newProp.length > 120) {
      showAlert("Invalid info", "Info must be less than 120 characters.");
      return false;
    }
    return true;
  };

  // Update the user
  const updateUser = () => {
    if (!validateForm()) return;
    setLoading(true);
    //if the form is valid, update the user
    axios
      .post(`${SERVER_URL}/update-user`, {
        userID: userID,
        PropToChange: PropToChange,
        newProp: newProp,
      })
      .then(() => {
        refreshSession();
      })
      .then(() => {
        setModalVisibility(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error updating user:", err);
        if (err.response && err.response.data) {
          showAlert("Error", err.response.data.message);
          setLoading(false);
        } else {
          showAlert("Error", "unexpected error occurred.");
          setModalVisibility(false);
          setLoading(false);
        }
      });
  };


  return (
    <>
      {/* Loading */}
      {loading && (
        <Modal transparent={true}>
          <Loading />
        </Modal>
      )}
      <Modal animationType="fade" transparent={true} onRequestClose={() => setModalVisibility(false)}>
        <TouchableOpacity style={tw`flex-1 justify-end bg-black bg-opacity-50`} activeOpacity={1} onPressOut={() => setModalVisibility(false)}>
          <View style={tw`bg-[${backgroundColor}] rounded-t-lg p-4`} onStartShouldSetResponder={() => true}>
            {/* Title */}
            <Text style={tw`text-lg font-bold mb-4 text-[${textColor}]`}>Change your {PropToChange}</Text>
            <View style={tw`flex-row items-center border border-gray-300 rounded p-2`}>
              <Ionicons name={ModalIcon} size={20} color="gray" style={tw`mr-2`} />
              {/* Input */}
              <TextInput
                ref={textInputRef}
                placeholder={`Enter new ${PropToChange}`}
                placeholderTextColor={textColor}
                value={newProp}
                secureTextEntry={isPassword ? hidePassword : false}
                style={tw`flex-1 text-[${textColor}]`}
                onChangeText={(text) => {
                  setNewProp(text);
                }}
              />
              {isPassword && (
                <Ionicons name={hidePassword ? "eye-off" : "eye"} size={20} color="gray" style={tw`mr-2`}
                  onPress={() => {
                    setHidePassword(!hidePassword);
                  }}
                />
              )}
            </View>
            {/* POST button */}
            <TouchableOpacity
              style={tw`mt-4 bg-blue-500 rounded p-2 items-center`}
              onPress={() => {
                updateUser();
              }}>
              <Text style={tw`text-white`}>Change {PropToChange}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default ChangeProfileModal;
