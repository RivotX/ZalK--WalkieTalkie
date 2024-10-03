import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Vibration } from 'react-native';
import tw from "twrnc";
import { Audio } from "expo-av";
import { FontAwesome5 } from "@expo/vector-icons"; // Assuming usage of Expo vector icons for simplicity
import { useSocket } from "../context/SocketContext";
import { useThemeColor } from "../../hooks/useThemeColor";

const AudioComponent = ({ currentRoom, isConectionClose }) => {
  const [recording, setRecording] = useState();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  const [recordingTime, setRecordingTime] = useState(0); // Estado para manejar el tiempo de grabación
  const Softbackground = useThemeColor({}, "Softbackground");
  const primaryColor = useThemeColor({}, "PrimaryPurple");
  const [buttonColorState, setButtonColorState] = useState(useThemeColor({}, "AudioComponent_ButtonColor"));
  const [borderColorState, setBorderColorState] = useState(useThemeColor({}, "AudioComponent_BorderColor"));
  const buttonColor = useThemeColor({}, "AudioComponent_ButtonColor");
  const borderColor = useThemeColor({}, "AudioComponent_BorderColor");
  const ActiveButtonColor = useThemeColor({}, "AudioComponent_ActiveButtonColor");
  const ActiveBorderColor = useThemeColor({}, "AudioComponent_ActiveBorderColor");
  const textcolor = useThemeColor({}, "text");

  // Cuando el componente se monta, pide permisos de audio
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status === "granted"); // Actualiza los permisos (true o false)
    })();
  }, [currentRoom]);


  useEffect(() => {
    console.log("Cerrando conexion y audio parado ANTES");
    if (isConectionClose && recording != undefined) {
      stopRecording();
      console.log("Cerrando conexion y audio parado");
    }
  }, [isConectionClose]);

  // Actualiza el tiempo de grabación cada segundo
  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // Actualiza los colores cuando el tema cambia
  useEffect(() => {
    setButtonColorState(buttonColor);
    setBorderColorState(borderColor);
  }, [buttonColor, borderColor]);

  // Funcion para iniciar la grabacion de audio
  const startRecording = async () => {
    if (!permissionStatus) {
      // Checkea si los permisos fueron otorgados
      console.log("Permissions not granted");
      return;
    }
    try {
      await Audio.setAudioModeAsync({
        // Set audio mode for recording
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true, 
      });
      const { recording } = await Audio.Recording.createAsync(
        // recording(variable, NO state) = result.recording
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY // Establece la calidad de grabacion (alta calidad)
      );
      setRecording(recording); // Actualiza el estado de grabacion con el objeto recording de antes
      setRecordingTime(0); // Reinicia el tiempo de grabación
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Funcion para detener la grabacion de audio
  const stopRecording = async () => {
    try {
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const audioData = await fetch(uri);
      const audioBlob = await audioData.blob();

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = () => {
        const base64Audio = reader.result.split(",")[1];
        // Envía el audio base64 al socket
        socket.emit("send-audio", base64Audio, currentRoom);
        setRecordedAudio({ uri });
        console.log("Audio sent successfully");
      };

      reader.onerror = (error) => {
        console.error("Error reading audio blob:", error);
      };

      console.log("Stopped recording");
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  // Funcion para cancelar la grabacion de audio
  const cancelRecording = async () => {
    try {
      setRecording(undefined);
      setButtonColorState(buttonColor);
      setBorderColorState(borderColor);
      Vibration.vibrate(200);
      await recording.stopAndUnloadAsync();
      console.log("Recording cancelled");
    } catch (error) {
      console.error("Failed to cancel recording", error);
    }
  };

  //  Funcion para reproducir el audio grabado
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: recordedAudio.uri }, // Carga el audio grabado
      { shouldPlay: true }
    );
    await sound.playAsync();
  };

  // Presionar grabar / detener audio
  const onPressHandler = () => {
    if (recording) {
      stopRecording();
      setButtonColorState(buttonColor);
      setBorderColorState(borderColor);
      Vibration.vibrate(200);
    } else {
      startRecording();
      setButtonColorState(ActiveButtonColor);
      setBorderColorState(ActiveBorderColor);
      Vibration.vibrate(400);
    }
  };

  return (
    <View style={tw`flex items-center justify-center h-full`}>
      <View style={tw`flex items-center justify-center h-100`}>
        {/* Record button */}
        <TouchableOpacity
          style={tw`size-84 bg-[${buttonColorState}] rounded-full flex items-center justify-center`}
          onPress={onPressHandler}
        >
          <View style={tw`size-74 bg-[${buttonColorState}] rounded-full border-4 border-${borderColorState} flex items-center justify-center`}>
            <FontAwesome5
              name="microphone"
              size={128}
              color='#ECEDEE'
            />
          </View>
        </TouchableOpacity>

        {/* Audio duration */}
        <View style={tw`h-10 mt-2`}>
          {recording && (
            <Text style={tw`text-[${textcolor}] text-2xl`}>
              {Math.floor(recordingTime / 60)}:{("0" + (recordingTime % 60)).slice(-2)}
            </Text>
          )}
        </View>

        {/* Cancel button */}
        <View style={tw`h-16 mt-2`}>

          {recording && (
            <TouchableOpacity
              style={tw`mt-4 px-4 py-2 bg-red-600 rounded-full`}
              onPress={cancelRecording}
            >
              <Text style={tw`text-[#ECEDEE] text-lg`}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default AudioComponent; // Exporta el componente para usarlos en otras partes de la app