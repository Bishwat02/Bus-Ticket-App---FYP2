// app/_layout.tsx
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useNavigation } from 'expo-router';

export default function Layout() {
  const navigation = useNavigation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTintColor: '#1e3a8a',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* No header for index (home) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Example with custom back button */}
      <Stack.Screen
        name="book-ticket"
        options={{
          title: 'Book Ticket',
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={{ paddingHorizontal: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="history"
        options={{
          title: 'History',
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={{ paddingHorizontal: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="loyalty"
        options={{
          title: 'Loyalty Program',
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={{ paddingHorizontal: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={{ paddingHorizontal: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
