// app/+not-found.tsx
//Normal 404 page for Expo Router
import { Text, View } from 'react-native';

export default function NotFound() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18 }}>Error 404 - Page not found</Text>
    </View>
  );
}
