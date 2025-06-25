// app/index.tsx
// Home Screen for Bus Ticket Booking App
// Main screen after login: Book tickets, view booking history, loyalty, profile, logout

import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../src/services/firebaseConfig';

// export default function IndexScreen() {
export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const blurAndNavigate = (path: string) => {
    if (typeof document !== 'undefined') {
      (document.activeElement as HTMLElement | null)?.blur();
    }
    router.push(path as any);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logoMaraliner.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.welcome}>Welcome to</Text>
      <Text style={styles.title}>Bus FYP</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => blurAndNavigate('/booking/book')}
        >
          <Ionicons name="bus" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Book Ticket</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => blurAndNavigate('/booking/history')}
        >
          <MaterialIcons name="history" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Booking History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => blurAndNavigate('/loyalty')}
        >
          <MaterialIcons
            name="card-giftcard"
            size={22}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Loyalty Program</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => blurAndNavigate('/profile')}
        >
          <FontAwesome5
            name="user-circle"
            size={22}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 18,
    color: '#555',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
