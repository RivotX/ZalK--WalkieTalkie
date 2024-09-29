import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import tw from 'twrnc';
import img_cascos from '../../assets/images/auriculares.png';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { useThemeColor } from '../../hooks/useThemeColor';
const { height, width } = Dimensions.get('window');

const FirstScreen = ({ SetFirstScreen, SetLoginScreenState }) => {
  const [fontsLoaded] = useFonts({
    'Zalk': require('../../assets/AppleTea-z8R1a.ttf'),
  });
  const [isPressed, setIsPressed] = useState(false);

  const GoLoginScreen = (Signup) => {
    SetFirstScreen(false);
    SetLoginScreenState(!Signup);
    console.log('FirstScreen --> SetLoginScreenState', !Signup);
  };
  const FirstScreenbg = useThemeColor({}, 'FirstScreenbg');
  const textColor = useThemeColor({}, 'text');
  // ===== Waves animation =======
  const heightAnimations = useRef([...Array(13)].map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const animations = heightAnimations.map((animation, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(animation, {
            toValue: 0.2,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animation, {
            toValue: 1,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      );
    });

    Animated.stagger(100, animations).start();
  }, [heightAnimations]);

  // ===== Particles animation =======
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (particles.length >= 50) return; // Limita el número de partículas

      const newParticle = {
        id: Math.random().toString(36).substr(2, 9), // Generar un ID único
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(height),
        translateX: new Animated.Value(Math.random() * width),
        scale: new Animated.Value(1),
        translateXSide: new Animated.Value(0),
      };

      setParticles((prevParticles) => [...prevParticles, newParticle]);

      // ===== Random delay pulsing animation =======
      Animated.loop(
        Animated.sequence([
          Animated.delay(Math.random() * 2000),
          Animated.timing(newParticle.scale, {
            toValue: 1.5,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(newParticle.scale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // ===== Continuous lateral movement animation =======
      const animateSideways = () => {
        const direction = Math.random() < 0.5 ? 1 : -1;
        const distance = Math.random() * 20 + 5;
        Animated.timing(newParticle.translateXSide, {
          toValue: direction * distance,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(newParticle.translateXSide, {
            toValue: -direction * distance,
            duration: 5000,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start(animateSideways);
        });
      };
      animateSideways();

      // ===== Particles animation =======
      Animated.sequence([
        Animated.parallel([
          Animated.timing(newParticle.opacity, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(newParticle.translateY, {
            toValue: -50,
            duration: 20000 + Math.random() * 5000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(newParticle.opacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(newParticle.translateY, {
            toValue: height,
            duration: 0,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Eliminar partículas fuera de pantalla
        setParticles((prevParticles) => prevParticles.filter(p => p.id !== newParticle.id));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [particles]);

  return (
    <View style={tw`flex-1 size-full bg-${FirstScreenbg} `}>

      {/* Background Image */}
      {/* <Image source={DarkBG} style={tw`absolute top-0 left-0 w-full h-full -z-20`} /> */}
      {/* Particles Animation */}
      {particles.map((particle) => {
        const animatedStyle = {
          opacity: particle.opacity,
          transform: [
            { translateY: particle.translateY },
            { translateX: Animated.add(particle.translateX, particle.translateXSide) },
            { scale: particle.scale },
          ],
        };
        return (
          <Animated.View key={particle.id} style={[tw`absolute w-2.5 h-2.5 -z-10`, animatedStyle]}>
            <LinearGradient
              colors={['#4d6fe7', '#bc5b96', '#aa5ea3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`w-full h-full rounded-full`}
            />
          </Animated.View>
        );
      })}

      {/* Main content */}
      <View style={tw`flex-1 items-center justify-center h-full `} pointerEvents="box-none">
        {/* Title and subtitle */}
        <Text style={[tw`text-[${textColor}] text-5xl mb-1`, { fontFamily: 'Zalk', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 7, textShadowColor: 'pink', }]}>Zal<Text style={tw`text-[#B233A1]`} >k</Text></Text>
        <Text style={[tw`text-[${textColor}] text-lg font-medium mb-1 text-center p-3 mx-6`]}>
          Subtitulo, cambiar BOTONES, cambiar letras, cambiar color (igual en modo claro/oscuro)
        </Text>

        {/* Headphones image */}
        <Image source={img_cascos} style={[tw`w-25 h-25 mb-4`]} />

        {/* Waves animation */}
        <View style={tw`flex-row items-center h-[70px]  mb-4`}>
          {heightAnimations.map((animation, index) => {
            const animatedStyle = {
              transform: [
                {
                  scaleY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 1],
                  }),
                },
              ],
            };
            return (
              <Animated.View key={index} style={[animatedStyle, tw`h-full w-2.5 rounded-full mx-1 mb-5`, { shadowOffset: { width: 1, height: 0 }, shadowRadius: 3, shadowColor: 'gray' }]}>
                <LinearGradient
                  colors={['#4d6fe7', '#bc5b96', '#aa5ea3']}
                  style={tw`h-full w-full rounded-full`}
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Login button */}
        <TouchableOpacity
          style={[
            isPressed ? tw`` : tw`shadow-lg shadow-purple-500`,
            tw`text-white bg-[#B233A1] w-32 py-3 rounded-lg mb-4`
          ]}
          onPress={() => GoLoginScreen(false)}
          onPressIn={() => { setIsPressed(true); }}
          onPressOut={() => { setIsPressed(false); }}
        >
          <Text style={tw`text-white text-center text-lg`}>Login</Text>
        </TouchableOpacity>

        {/* Sign up button */}
        <TouchableOpacity
          style={tw`text-white bg-[#3D3D69] w-32 py-3 rounded-lg`}
          onPress={() => GoLoginScreen(true)}
        >
          <Text style={tw`text-white text-center text-lg`}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FirstScreen;