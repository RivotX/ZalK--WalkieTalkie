// import React from 'react';
// import { Dimensions } from 'react-native';
// import * as Animatable from 'react-native-animatable'; DESINSTALAR
// import tw from "twrnc";
// import arrow from "../../assets/images/images (1).png";

// const { width } = Dimensions.get('window');

// const PulsingArrow = () => {
//   return (
//     <Animatable.Image
//       animation={{
//         0: { transform: [{ scale: 1 }] },
//         0.5: { transform: [{ scale: 1.2 }] }, // Aumenta el tamaño al 120%
//         1: { transform: [{ scale: 1 }] }
//       }}
//       iterationCount="infinite"
//       duration={4000} // Ajusta la duración en milisegundos (4000ms = 4 segundos)
//       source={arrow}
//       style={[
//         tw`absolute`,
//         {
//           height: width * 0.2,
//           width: width * 0.2,
//           bottom: 250, // Ajusta la posición inferior para que esté en la parte inferior de la pantalla
//           right: 100, // Ajusta la posición derecha
//         }
//       ]}
//     />
//   );
// };

// export default PulsingArrow;