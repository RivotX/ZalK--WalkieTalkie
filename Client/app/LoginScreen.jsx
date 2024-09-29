//Main Login
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import tw from "twrnc";
import FirstScreen from "../components/Login/FirstScreen";
import LoginRegister from "../components/Login/LoginRegister";
import { useThemeColor } from "../hooks/useThemeColor";

const LoginScreen = ({ SetLayoutLogged, setLoading }) => {
  const backgroundColor = useThemeColor({}, "background");
  const [firstScreen, setFirstScreen] = useState(true);
  const [loginScreen, setLoginScreen] = useState(false);

//   // ===== Skips the login if the user is already logged in ========
//   useEffect(() => {
//   const checkLoginStatus = async () => {
//     console.log("Checking login status");
//     let loggedIn = await AsyncStorage.getItem("isLoggedIn");
//     if (loggedIn === "true") {
//       SetLayoutLogged(true);
//     }
//   };

//   checkLoginStatus();
// }, []);

  const handleSetFirstScreen = (value) => {
    setFirstScreen(value);
  };
  const SetLoginScreenState = (value) => {
    setLoginScreen(value);
    console.log("LoginScreen--> SetLoginScreen", value);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 items-center justify-center bg-[${backgroundColor}]`}>
        {firstScreen ? (
          <FirstScreen SetFirstScreen={handleSetFirstScreen} SetLoginScreenState={SetLoginScreenState} />
        ) : (
          <LoginRegister setLoading={setLoading} LoginScreen={loginScreen} SetLayoutLogged={SetLayoutLogged} setFirstScreen={setFirstScreen}/>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default LoginScreen;
