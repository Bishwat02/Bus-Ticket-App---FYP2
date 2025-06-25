// app/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

export default function Layout() {
  const backButton = () => (
    <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 16 }}>
      <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
    </Pressable>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTintColor: '#1e3a8a',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Home (no header) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Book Ticket */}
      <Stack.Screen
        name="booking/book"
        options={{
          title: 'Book Ticket',
          headerLeft: backButton,
        }}
      />

      {/* Booking History */}
      <Stack.Screen
        name="booking/history"
        options={{
          title: 'History',
          headerLeft: backButton,
        }}
      />

      {/* Booking Confirmation */}
      <Stack.Screen
        name="booking/bookingConfirmation"
        options={{
          title: 'Booking Confirmation',
          headerLeft: backButton,
        }}
      />

      {/* Loyalty Program */}
      <Stack.Screen
        name="loyalty"
        options={{
          title: 'Loyalty Program',
          headerLeft: backButton,
        }}
      />

      {/* Profile */}
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerLeft: backButton,
        }}
      />
    </Stack>
  );
}
