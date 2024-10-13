import React from "react";
import { Image,  View, Dimensions } from "react-native";
import tw from "twrnc";
import ProfileIcon from "../assets/images/images.png";
import groupicon from "../assets/images/groupicon.png";
import ImageZoom from "react-native-image-pan-zoom";
import { useRoute } from "@react-navigation/native";

export default function UserProfileScreen() {
  const route = useRoute();
  const { user, isContact } = route.params;

  return (
    <View style={tw`flex-1 items-center bg-black`}>
      <View style={[tw`w-full flex-1 justify-center items-center`]}>
        <ImageZoom
          cropWidth={Dimensions.get('window').width}
          cropHeight={Dimensions.get('window').height}
          imageWidth={Dimensions.get('window').width}
          imageHeight={Dimensions.get('window').width}
          minScale={1}
          maxScale={10}
        >
          <Image
            style={[tw`size-full rounded-md`, { resizeMode: "cover" }]}
            source={user.profile ? { uri: user.profile } : isContact ? ProfileIcon : groupicon}
          />
        </ImageZoom>
      </View>
    </View>
  );
}