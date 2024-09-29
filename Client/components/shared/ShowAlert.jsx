import React from 'react';
import { Alert, Platform } from 'react-native';

const ShowAlert = ({ title, message }) => {
  React.useEffect(() => {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message, [{ text: "OK" }]);
    }
  }, [title, message]);

  return null; // Este componente no necesita renderizar nada
};

export default ShowAlert;