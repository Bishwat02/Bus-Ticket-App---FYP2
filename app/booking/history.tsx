// app/booking/history.tsx
// This code defines a BookingHistory component that fetches and displays the user's booking history from Firestore.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../../src/services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

interface Booking {
  id: string;
  origin: string;
  destination: string;
  travelDate: string;
  time: string;
  passengers: number;
  busType: string;
  timestamp: string;
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const db = getFirestore();
        const user = auth.currentUser;

        if (!user) return;

        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );

        const snapshot = await getDocs(q);
        const data: Booking[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[];

        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch booking history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Loading booking history...</Text>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="time-outline" size={48} color="#6b7280" />
        <Text style={styles.emptyText}>No bookings found yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.route}>{item.origin} ➝ {item.destination}</Text>
            <Text style={styles.detail}>Date: {item.travelDate} | Time: {item.time}</Text>
            <Text style={styles.detail}>Passengers: {item.passengers} | Bus: {item.busType}</Text>
            <Text style={styles.detail}>Booked on: {new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  route: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#374151',
  },
});
