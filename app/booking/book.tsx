// app/booking/book.tsx
// Main screen for booking tickets

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { createBookingWithCustomId } from '../seeder';

// City options
const cityOptions = [
  { label: 'Subang Jaya', value: 'Subang Jaya' },
  { label: 'Kuala Lumpur', value: 'Kuala Lumpur' },
  { label: 'Penang', value: 'Penang' },
  { label: 'Ipoh', value: 'Ipoh' },
  { label: 'Malacca', value: 'Malacca' },
  { label: 'Johor Bahru', value: 'Johor Bahru' },
  { label: 'Kota Kinabalu', value: 'Kota Kinabalu' },
  { label: 'Kuching', value: 'Kuching' },
  { label: 'Langkawi', value: 'Langkawi' },
  { label: 'Cameron Highlands', value: 'Cameron Highlands' }
];

// Bus types
const busTypeOptions = [
  { label: 'Economy', value: 'Economy' },
  { label: 'Business', value: 'Business' },
  { label: 'VIP', value: 'VIP' }
];

// Trip types
const tripTypeOptions = [
  { label: 'One-way', value: 'One-way' },
  { label: 'Round-trip', value: 'Round-trip' }
];

// Fare table mock
const fareTable: Record<string, number> = {
  'Subang Jaya-Kuala Lumpur': 15,
  'Kuala Lumpur-Penang': 45,
  'Penang-Ipoh': 25,
  'Malacca-Johor Bahru': 40,
  'Kuala Lumpur-Johor Bahru': 50,
  'Kota Kinabalu-Kuching': 60,
  'Langkawi-Cameron Highlands': 70,
};

// Fare calculation
const getFare = (origin: string, destination: string, busType: string): number => {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
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

const BookingScreen = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [busType, setBusType] = useState('Economy');
  const [passengers, setPassengers] = useState('1');
  const [tripType, setTripType] = useState('One-way');
  const [travelDate, setTravelDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [showTravelPicker, setShowTravelPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);

  // Dropdown control
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [busTypeOpen, setBusTypeOpen] = useState(false);
  const [passengersOpen, setPassengersOpen] = useState(false);
  const [tripTypeOpen, setTripTypeOpen] = useState(false);

  const handleSubmit = async () => {
    if (!origin || !destination || !busType) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (origin === destination) {
      Alert.alert('Invalid Input', 'Origin and destination cannot be the same.');
      return;
    }

    const baseFare = getFare(origin, destination, busType);
    const passengerCount = parseInt(passengers);
    let totalFare = baseFare * passengerCount;
    if (tripType === 'Round-trip') totalFare *= 2;

    const loyaltyPoints = Math.floor(totalFare / 10); // 1 point per RM10

    const booking = {
      origin,
      destination,
      busType,
      passengers: passengerCount,
      tripType,
      travelDate: travelDate.toISOString(),
      returnDate: tripType === 'Round-trip' ? returnDate.toISOString() : null,
      fare: baseFare,
      totalFare,
      loyaltyPoints,
      timestamp: new Date().toISOString(),
    };

    try {
      const docId = await createBookingWithCustomId(booking);
      Alert.alert(
        'Booking Successful!',
        `Booking ID: ${docId}\nYou've earned ${loyaltyPoints} loyalty points.`
      );
    } catch (error) {
      console.error('Booking failed:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Bus Ticket Booking</Text>

      <Text style={styles.label}>Origin</Text>
      <DropDownPicker
        open={originOpen}
        setOpen={setOriginOpen}
        value={origin}
        setValue={setOrigin}
        items={cityOptions}
        containerStyle={styles.dropdownContainer}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
        placeholder="Select origin"
      />

      <Text style={styles.label}>Destination</Text>
      <DropDownPicker
        open={destinationOpen}
        setOpen={setDestinationOpen}
        value={destination}
        setValue={setDestination}
        items={cityOptions}
        containerStyle={styles.dropdownContainer}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
        placeholder="Select destination"
      />

      <Text style={styles.label}>Bus Type</Text>
      <DropDownPicker
        open={busTypeOpen}
        setOpen={setBusTypeOpen}
        value={busType}
        setValue={setBusType}
        items={busTypeOptions}
        containerStyle={styles.dropdownContainer}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
        placeholder="Select bus type"
      />

      <Text style={styles.label}>Number of Passengers</Text>
      <DropDownPicker
        open={passengersOpen}
        setOpen={setPassengersOpen}
        value={passengers}
        setValue={setPassengers}
        items={Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))}
        containerStyle={styles.dropdownContainer}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
        placeholder="Select passengers"
      />

      <Text style={styles.label}>Trip Type</Text>
      <DropDownPicker
        open={tripTypeOpen}
        setOpen={setTripTypeOpen}
        value={tripType}
        setValue={setTripType}
        items={tripTypeOptions}
        containerStyle={styles.dropdownContainer}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
        placeholder="Select trip type"
      />

      <Text style={styles.label}>Travel Date</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowTravelPicker(true)}>
        <Text>{travelDate.toDateString()}</Text>
      </TouchableOpacity>
      {showTravelPicker && (
        <DateTimePicker
          value={travelDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              setTravelDate(selectedDate);
            }
            setShowTravelPicker(false);
          }}
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
              display="default"
              minimumDate={travelDate}
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate) {
                  setReturnDate(selectedDate);
                }
                setShowReturnPicker(false);
              }}
            />
          )}
        </>
      )}

      <Button title="Submit Booking" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  dropdownContainer: {
    height: 40,
    marginBottom: 15,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  dateInput: {
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
  },
});

export default BookingScreen;
