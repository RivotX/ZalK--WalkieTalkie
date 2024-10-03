// alertHelper.js
import { Alert, Platform } from 'react-native';

export const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message, [{ text: "OK" }]);
  }
};