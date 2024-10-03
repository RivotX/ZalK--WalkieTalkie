import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, BackHandler } from "react-native";
import tw from "twrnc";
import { useThemeColor } from "../../hooks/useThemeColor";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getEnvVars from "../../config";
import { Ionicons } from "@expo/vector-icons";
import PasswordToggle from "../shared/PasswordToggle";

const LoginRegister = ({ LoginScreen, SetLayoutLogged, setFirstScreen, setLoading }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Confpassword, setConfPassword] = useState("");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [badLogin, setBadLogin] = useState(false);
  const [badLoginMsg, setBadLoginMsg] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [hidePassword2, setHidePassword2] = useState(true);

  const [formError, setFormError] = useState("");
  const [LoginScreenState, setLoginScreenState] = useState(LoginScreen);

  // === Animaciones para los placeholders ====
  const usernamePlaceholderAnim = useRef(new Animated.Value(0)).current;
  const emailPlaceholderAnim = useRef(new Animated.Value(0)).current;
  const passwordPlaceholderAnim = useRef(new Animated.Value(0)).current;
  const confPasswordPlaceholderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (anim) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = (anim, value) => {
    if (value === "") {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleChangeText = (setValue, anim, text) => {
    setValue(text);
    if (text !== "") {
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const placeholderStyle = (anim) => ({
    position: "absolute",
    left: 10,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [15, -10],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.8],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    color: textColor,
  });

  // ====== Validar campos de registro ======
  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 0 && !emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password !== Confpassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if ((password.length > 0 && password.length < 8) || (Confpassword.length > 0 && Confpassword.length < 8)) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    setFormError("");
  };

  useEffect(() => {
    if (!LoginScreenState) {
      validateForm();
    }
  }, [email, password, Confpassword, LoginScreenState]);

  //====== Sumbit de login o registro  ======
  const { SERVER_URL } = getEnvVars();
  const handleSumbit = () => {
    console.log("login pulsado");

    if (LoginScreenState) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  // ===== Login =======
  const handleLogin = () => {
    if (username.trim().length === 0 || password.trim().length === 0) {
      setBadLogin(true);
      setBadLoginMsg("Please enter both your username and password.");
      return;
    }
    setLoading(true);
    axios.post(`${SERVER_URL}/login`, { username, password }, { withCredentials: true })
      .then((res) => {
        setLoading(false);

        console.log(res);
        if (res.status === 200) {
          AsyncStorage.setItem("isLoggedIn", "true")
            .then(() => {
              SetLayoutLogged(true);
            })
            .catch((error) => {
              console.error("Failed to save isLoggedIn status", error);
            });
        } else {
          console.log("res " + res);
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response && err.response.status === 401) {
          setBadLogin(true);
          setLoading(false);

          setBadLoginMsg("Incorrect username or password");
        }
      });
  };

  // ===== Sign up ======= 
  const handleRegister = () => {
    if (username.trim().length === 0) {
      setFormError("Username cannot be empty.");
      return;
    }
    if (password.trim().length === 0 || Confpassword.trim().length === 0) {
      setFormError("Password cannot be empty.");
      return;
    }
    if (email.trim().length === 0) {
      setFormError("Email cannot be empty.");
      return;
    }

    if (formError === "") {
      axios
        .post(`${SERVER_URL}/create-user`, { username, password, email })
        .then((res) => {
          setLoginScreenState(true);
        })
        .catch((err) => {
          console.log(err);
          handleRegisterError(err);
        });
    }
  };

  const handleRegisterError = (err) => {
    if (!(err.response && err.response.data)) {
      setFormError("Registration failed. Please try again.");
    } else {
      const errorMessage = err.response.data;
      if (errorMessage.includes("Username already exists") || errorMessage.includes("Email already exists")) {
        setFormError(err.response.data);
      } else {
        setFormError("Registration failed. Please try again.");
      }
    }
  };

  // ===== Animaciones ======= 
  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  // ===== Handle back button press ======= 
  useEffect(() => {
    const backAction = () => {
      setFirstScreen(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, []);

  return (
    <View style={tw`flex-1 w-full items-center justify-center bg-[${backgroundColor}]`}>
      <Text style={[tw`mb-10 font-bold text-[${textColor}]`, styles.text]}>{LoginScreenState ? "Sign in" : "Sign up"}</Text>

      {/* UserName */}
      <View style={tw`w-4/5 my-3`}>
        <Animated.Text style={placeholderStyle(usernamePlaceholderAnim)}>Username</Animated.Text>
        <TextInput
          style={tw`h-10 border-b border-gray-400 px-2 text-[${textColor}]`}
          onChangeText={(text) => handleChangeText(setUsername, usernamePlaceholderAnim, text)}
          value={username}
          onFocus={() => handleFocus(usernamePlaceholderAnim)}
          onBlur={() => handleBlur(usernamePlaceholderAnim, username)}
          placeholder=""
          placeholderTextColor={textColor}
        />
      </View>

      {/* Email */}
      {!LoginScreenState && (
        <View style={tw`w-4/5 my-3`}>
          <Animated.Text style={placeholderStyle(emailPlaceholderAnim)}>Email</Animated.Text>
          <TextInput
            style={tw`h-10 border-b border-gray-400 px-2 text-[${textColor}]`}
            onChangeText={(text) => handleChangeText(setEmail, emailPlaceholderAnim, text)}
            value={email}
            onFocus={() => handleFocus(emailPlaceholderAnim)}
            onBlur={() => handleBlur(emailPlaceholderAnim, email)}
            placeholder=""
            placeholderTextColor={textColor}
            keyboardType="email-address"
          />
        </View>
      )}

      {/* Password */}
      <View style={tw`w-4/5 my-3`}>
        <Animated.Text style={placeholderStyle(passwordPlaceholderAnim)}>Password</Animated.Text>
        <View style={tw`flex-row items-center border-b border-gray-400`}>
          <TextInput
            style={tw`flex-1 h-10 px-2 text-[${textColor}]`}
            onChangeText={(text) => handleChangeText(setPassword, passwordPlaceholderAnim, text)}
            value={password}
            onFocus={() => handleFocus(passwordPlaceholderAnim)}
            onBlur={() => handleBlur(passwordPlaceholderAnim, password)}
            placeholder=""
            placeholderTextColor={textColor}
            secureTextEntry={hidePassword}
            autoCompleteType="off"
            textContentType="none"

          />
          <PasswordToggle hidePassword={hidePassword} setHidePassword={setHidePassword} />

        </View>
      </View>
      {badLogin && <Text style={tw`text-red-500`}>{badLoginMsg}</Text>}

      {/* Confirm Password */}
      {!LoginScreenState && (
        <View style={tw`w-4/5 my-3`}>
          <Animated.Text style={placeholderStyle(confPasswordPlaceholderAnim)}>Confirm Password</Animated.Text>
          <View style={tw`flex-row items-center border-b border-gray-400`}>
            <TextInput
              style={tw`flex-1 h-10 px-2 text-[${textColor}]`}
              onChangeText={(text) => handleChangeText(setConfPassword, confPasswordPlaceholderAnim, text)}
              value={Confpassword}
              onFocus={() => handleFocus(confPasswordPlaceholderAnim)}
              onBlur={() => handleBlur(confPasswordPlaceholderAnim, Confpassword)}
              placeholder=""
              placeholderTextColor={textColor}
              secureTextEntry={hidePassword2}
            />

            <PasswordToggle hidePassword={hidePassword2} setHidePassword={setHidePassword2} />

          </View>
          {formError ? <Text style={tw`text-red-500`}>{formError}</Text> : null}
        </View>
      )}

      {/* Sumbit Button */}
      <TouchableOpacity
        style={tw`py-3 mt-4 rounded-lg border-b-[${textColor}] border-b-2 bg-transparent w-2/5`}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleSumbit}
      >
        <Text style={[isPressed ? styles.textPressed : styles.textNotPressed, { color: textColor }]}>
          {LoginScreenState ? "Sign in" : "Sign up"}
        </Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity style={tw`mt-5`}>
        <Text style={tw`text-gray-500`}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign in or Sign up */}
      <TouchableOpacity style={tw`mt-2`}>
        <Text
          style={tw`text-blue-500`}
          onPress={() => {
            setLoginScreenState(!LoginScreenState);
            setBadLogin(false);
            setFormError("");
          }}
        >
          {LoginScreenState ? "Don't have an account? Sign Up" : "Already have an account? Sign in"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 45,
  },
  buttonNotPressed: {
    borderBottomWidth: 2,
    backgroundColor: "transparent",
    width: "40%",
  },
  buttonPressed: {
    backgroundColor: "white",
    borderRadius: 3,
    shadowColor: "#ffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    width: "30%",
    opacity: 0.9,
    elevation: 30,
    borderWidth: 1,
    borderColor: "black",
  },
  textNotPressed: {
    textAlign: "center",
    textShadowColor: "#ffffff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  textPressed: {
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default LoginRegister;