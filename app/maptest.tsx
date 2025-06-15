////comment out code below to avoid errors in the app

// import React from 'react';
// import { View, StyleSheet, Dimensions } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';

// export default function MapTest() {
//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: 3.139,
//           longitude: 101.6869,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         <Marker
//           coordinate={{ latitude: 3.139, longitude: 101.6869 }}
//           title="Kuala Lumpur"
//           description="This is the capital city of Malaysia."
//         />
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1
//   },
//   map: {
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height,
//   },
// });