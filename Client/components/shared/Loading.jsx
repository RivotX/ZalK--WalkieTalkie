//app/components/Loading.jsx
import React from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import { useThemeColor } from "../../hooks/useThemeColor";

const Loading = () => {
  const loadingColor = useThemeColor({}, "loading");
  return (
    <View style={[styles.container, styles.horizontal]}>
      <ActivityIndicator size="large" color={loadingColor} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
});
export default Loading;
