// app/booking/book.tsx
// Booking Screen with live fare, total fare, loyalty points, and redirect to payment screen

import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  getBusTypeOptions,
  getCityOptions,
  getTripTypeOptions,
} from '../../src/utils/seeder';

const getFare = (origin: string, destination: string, busType: string): number => {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  const fareTable: Record<string, number> = {
    'Subang Jaya-Kuala Lumpur': 15,
    'Kuala Lumpur-Penang': 45,
    'Penang-Ipoh': 25,
    'Malacca-Johor Bahru': 40,
    'Kuala Lumpur-Johor Bahru': 50,
    'Kota Kinabalu-Kuching': 60,
    'Langkawi-Cameron Highlands': 70,
  };
  let baseFare = fareTable[key] || fareTable[reverseKey] || 30;

  switch (busType) {
    case 'Business':
      return baseFare * 1.5;
    case 'VIP':
      return baseFare * 2;
    default:
      return baseFare;
  }
};

// const BookingScreen = () => {
export default function Book() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [busType, setBusType] = useState('Economy');
  const [passengers, setPassengers] = useState('1');
  const [tripType, setTripType] = useState('One-way');
  const [travelDate, setTravelDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [showTravelPicker, setShowTravelPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);

  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [busTypeOpen, setBusTypeOpen] = useState(false);
  const [passengersOpen, setPassengersOpen] = useState(false);
  const [tripTypeOpen, setTripTypeOpen] = useState(false);

  const [calculatedFare, setCalculatedFare] = useState(0);
  const [totalFare, setTotalFare] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    if (origin && destination && busType && origin !== destination) {
      const fare = getFare(origin, destination, busType);
      const count = parseInt(passengers || '1');
      const isRoundTrip = tripType === 'Round-trip';
      const total = fare * count * (isRoundTrip ? 2 : 1);
      const points = Math.floor(total / 5);//1 point for every RM5 spent

      setCalculatedFare(fare);
      setTotalFare(total);
      setLoyaltyPoints(points);
    } else {
      setCalculatedFare(0);
      setTotalFare(0);
      setLoyaltyPoints(0);
    }
  }, [origin, destination, busType, passengers, tripType]);

  const handleSubmit = async () => {
    if (!origin || !destination || !busType) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (origin === destination) {
      Alert.alert('Invalid Input', 'Origin and destination cannot be the same.');
      return;
    }

    const passengerCount = parseInt(passengers || '1');

    // Pass booking details to payment screen instead of saving here
    router.push({
      pathname: '/booking/bookingConfirmation',
      params: {
        origin,
        destination,
        date: travelDate.toDateString(),
        time: '10:00 AM',
        passengers: String(passengerCount),
        busType,
        luggage: 'false',
        meal: 'false',
        totalFare: String(totalFare),
        tripType,
        returnDate: tripType === 'Round-trip' ? returnDate.toDateString() : '',
        loyaltyPoints: String(loyaltyPoints),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Bus Ticket Booking</Text>

      <Text style={styles.label}>Origin</Text>
      <DropDownPicker
        open={originOpen}
        setOpen={setOriginOpen}
        value={origin}
        setValue={setOrigin}
        items={getCityOptions()}
        placeholder="Select origin"
        zIndex={5000}
        zIndexInverse={1000}
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
      />

      <Text style={styles.label}>Destination</Text>
      <DropDownPicker
        open={destinationOpen}
        setOpen={setDestinationOpen}
        value={destination}
        setValue={setDestination}
        items={getCityOptions()}
        placeholder="Select destination"
        zIndex={4000}
        zIndexInverse={2000}
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
      />

      <Text style={styles.label}>Bus Type</Text>
      <DropDownPicker
        open={busTypeOpen}
        setOpen={setBusTypeOpen}
        value={busType}
        setValue={setBusType}
        items={getBusTypeOptions()}
        placeholder="Select bus type"
        zIndex={3000}
        zIndexInverse={3000}
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
      />

      <Text style={styles.label}>Passengers</Text>
      <DropDownPicker
        open={passengersOpen}
        setOpen={setPassengersOpen}
        value={passengers}
        setValue={setPassengers}
        items={Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))}
        placeholder="Select passengers"
        zIndex={2000}
        zIndexInverse={4000}
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
      />

      <Text style={styles.label}>Trip Type</Text>
      <DropDownPicker
        open={tripTypeOpen}
        setOpen={setTripTypeOpen}
        value={tripType}
        setValue={setTripType}
        items={getTripTypeOptions()}
        placeholder="Select trip type"
        zIndex={1000}
        zIndexInverse={5000}
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
      />

      <Text style={styles.label}>Travel Date</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowTravelPicker(true)}>
        <Text>{travelDate.toDateString()}</Text>
      </TouchableOpacity>
      {showTravelPicker && (
        <DateTimePicker
          value={travelDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selectedDate) => {
            if (event.type === 'set' && selectedDate) setTravelDate(selectedDate);
            setShowTravelPicker(false);
          }}
          minimumDate={new Date()}
        />
      )}

      {tripType === 'Round-trip' && (
        <>
          <Text style={styles.label}>Return Date</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowReturnPicker(true)}>
            <Text>{returnDate.toDateString()}</Text>
          </TouchableOpacity>
          {showReturnPicker && (
            <DateTimePicker
              value={returnDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate) setReturnDate(selectedDate);
                setShowReturnPicker(false);
              }}
              minimumDate={travelDate}
            />
          )}
        </>
      )}

      {calculatedFare > 0 && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Fare per Person: RM {calculatedFare.toFixed(2)}</Text>
          <Text style={styles.summaryText}>Total Fare: RM {totalFare.toFixed(2)}</Text>
          <Text style={styles.summaryText}>Loyalty Points: {loyaltyPoints}</Text>
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Proceed to Payment" onPress={handleSubmit} color="#2563eb" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  dateInput: {
    padding: 12,
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 15,
  },
  summaryBox: {
    marginTop: 15,
    backgroundColor: '#e0f2fe',
    padding: 12,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
});


// export default BookingScreen;
