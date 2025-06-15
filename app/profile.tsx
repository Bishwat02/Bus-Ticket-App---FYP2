import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { auth, db } from '../src/services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Wait for auth to confirm user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.replace('/login');
      }
    });

    return unsubscribe;
  }, []);

  // 2. Once user is confirmed, fetch Firestore data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUserData(snap.data());
        } else {
          Alert.alert('Error', 'User data not found in Firestore');
        }
      } catch (error: any) {
        console.error('Failed to fetch user data:', error.message);
        Alert.alert('Error', 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No profile data found.</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userData.name}!</Text>
      <Text style={styles.info}>Email: {userData.email}</Text>
      <Text style={styles.info}>Loyalty Points: {userData.loyaltyPoints}</Text>
      <Button title="Logout" onPress={handleLogout} color="#dc2626" />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: '#334155',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 20,
  },
});
