import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import tw from "twrnc";
import { Audio } from "expo-av";
import { FontAwesome5 } from "@expo/vector-icons"; // Assuming usage of Expo vector icons for simplicity
import { useSocket } from "../context/SocketContext";

const AudioComponent = ({ currentRoom, isConectionClose }) => {
  const [recording, setRecording] = useState();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket
  // Cuando el componente se monta, pide permisos de audio
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status === "granted"); // Actualiza los permisos (true o false)
    })();
  }, [currentRoom]);

  useEffect(() => {
    console.log(socket, "socket EN AUDIOCOMPONENT");
  }, []);

  useEffect(() => {
    console.log("Cerrando conexion y audio parado ANTES");
    if (isConectionClose && recording != undefined) {
      stopRecording();
      console.log("Cerrando conexion y audio parado");
    }
  }, [isConectionClose]);

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
        playsInSilentModeIOS: true, // permite reproducirlo en modo silencio? XD (pruebalo geyson en iphone)
      });
      const { recording } = await Audio.Recording.createAsync(
        // recording(variable, NO state) = result.recording
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY // Establece la calidad de grabacion (alta calidad)
      );
      setRecording(recording); // Actualiza el estado de grabacion con el objeto recording de antes
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


  //  Funcion para reproducir el audio grabado
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: recordedAudio.uri }, // Carga el audio grabado
      { shouldPlay: true } // Empieza a reproducir el audio
    );
    await sound.playAsync(); // Reproduce el audio
  };

  // Presionar grabar / detener audio
  const onPressHandler = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // renderiza UI del componente
  return (
    <View style={tw`flex items-center justify-center`}>
      <View style={tw`flex-row items-center justify-center`}>
        <TouchableOpacity onPress={onPressHandler} style={tw`p-[7px] mx-2 ${recording ? "bg-red-500 h-20 w-20" : "bg-blue-500"} rounded-full`}>
          <FontAwesome5 name={recording ? "stop-circle" : "microphone"} size={recording ? 64 : 40} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioComponent; // Exporta el componente para usarlos en otras partes de la app
