//app/booking/bookingConfirmation.tsx
//This code defines a booking confirmation screen for a bus ticket booking application.
//Displays booking details such as origin, destination, date, time, number of passengers, bus type, luggage option, meal option, and total fare.
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BookingConfirmation() {
  const {
    origin,
    destination,
    date,
    time,
    passengers,
    busType,
    luggage,
    meal,
    totalFare,
  } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle-outline" size={80} color="#10b981" />
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>Here are your ticket details:</Text>

      <View style={styles.detailBox}>
        <Text style={styles.detail}>From: {origin}</Text>
        <Text style={styles.detail}>To: {destination}</Text>
        <Text style={styles.detail}>Date: {date}</Text>
        <Text style={styles.detail}>Time: {time}</Text>
        <Text style={styles.detail}>Passengers: {passengers}</Text>
        <Text style={styles.detail}>Bus Type: {busType}</Text>
        <Text style={styles.detail}>Luggage: {luggage === 'true' ? 'Yes' : 'No'}</Text>
        <Text style={styles.detail}>Meal: {meal === 'true' ? 'Yes' : 'No'}</Text>
        <Text style={styles.total}>Total Fare: RM {totalFare}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#047857',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 20,
  },
  detailBox: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    elevation: 3,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});