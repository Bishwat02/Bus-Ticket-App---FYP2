// app/booking/bookingConfirmation.tsx
// Booking Confirmation Screen
import { router, useLocalSearchParams } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { auth, db } from '../../src/services/firebaseConfig';
import { getBankOptions } from '../../src/utils/seeder';

export default function BookingConfirmation() {
  const params = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState<'Visa' | 'MasterCard' | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [maskedCvv, setMaskedCvv] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [saveFavorite, setSaveFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));
  const [isFlipped, setIsFlipped] = useState(false);
  const [bankOptions, setBankOptions] = useState<any[]>([]);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  useEffect(() => {
    const raw = cardNumber.replace(/\s/g, '');
    if (/^4/.test(raw)) setCardType('Visa');
    else if (/^5[1-5]/.test(raw)) setCardType('MasterCard');
    else setCardType(null);
  }, [cardNumber]);

useEffect(() => {
  setBankOptions(getBankOptions());
}, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, 'redemptions'),
        where('userId', '==', user.uid),
        where('used', '==', false)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailableVouchers(data);
    };
    fetchVouchers();
  }, []);

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    setExpiryDate(formatted);
  };

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped));
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const validateInputs = () => {
    if (paymentMethod === 'Card') {
      const raw = cardNumber.replace(/\s/g, '');
      if (!/^\d{12,16}$/.test(raw)) {
        Alert.alert('Card number must be 12-16 digits');
        return false;
      }
      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiryDate)) {
        Alert.alert('Expiry must be in MM/YY');
        return false;
      }
      if (!/^\d{3}$/.test(cvv)) {
        Alert.alert('CVV must be 3 digits');
        return false;
      }
    } else if (paymentMethod === 'Bank') {
      if (!bankName || !bankOptions.find(b => b.value === bankName)) {
      Alert.alert('Please select a valid bank');
      return false;
      }
      if (!/^\d{10,16}$/.test(accountNumber)) {
        Alert.alert('Invalid account number');
        return false;
      }
    }
    return true;
  };

  const completePayment = async () => {
    if (!paymentMethod) return Alert.alert('Select payment method');
    if (!validateInputs()) return;

    const user = auth.currentUser;
    if (!user) return Alert.alert('You must be logged in');

    setIsSubmitting(true);

    let fare = parseFloat(params.totalFare as string) || 0;

    // Apply reward logic
    if (selectedVoucher?.rewardId === 'r1') fare *= 0.95;
    else if (selectedVoucher?.rewardId === 'r3') fare -= 10;

    const booking = {
      userId: user.uid,
      origin: params.origin,
      destination: params.destination,
      travelDate: params.date,
      returnDate: params.returnDate || null,
      time: params.time,
      passengers: parseInt(params.passengers as string) || 1,
      busType: params.busType,
      luggage: params.luggage === 'true',
      meal: params.meal === 'true',
      totalFare: fare,
      loyaltyPoints: parseInt(params.loyaltyPoints as string) || 0,
      tripType: params.tripType || 'One-way',
      paymentMethod,
      bankName: paymentMethod === 'Bank' ? bankName : null,
      accountNumber: paymentMethod === 'Bank' ? accountNumber : null,
      appliedReward: selectedVoucher?.rewardName || null,
      timestamp: new Date().toISOString(),
      isDummy: false,
    };

    try {
      await addDoc(collection(db, 'bookings'), booking);
      if (saveFavorite) {
        await addDoc(collection(db, 'favorites'), {
          userId: user.uid,
          method: paymentMethod,
          cardNumber,
          expiryDate,
          bankName,
          accountNumber,
          savedAt: new Date().toISOString(),
        });
      }

      if (selectedVoucher) {
        const docRef = doc(db, 'redemptions', selectedVoucher.id);
        await updateDoc(docRef, { used: true });
      }

      Alert.alert('Payment Complete', 'Booking Confirmed!');
      router.replace('/');
    } catch (err) {
      console.error(err);
      Alert.alert('Error saving booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Booking Confirmation</Text>

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.paymentOptions}>
          {['Card', 'Bank'].map(method => (
            <TouchableOpacity
              key={method}
              style={[styles.paymentBtn, paymentMethod === method && styles.selected]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={styles.paymentText}>{method}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reward Section */}
        {availableVouchers.length > 0 && (
          <View style={{ width: '100%', marginBottom: 16 }}>
            <Text style={styles.label}>Apply Reward</Text>
            {availableVouchers.map(v => (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVoucher(v)}
                style={{
                  backgroundColor: selectedVoucher?.id === v.id ? '#dbeafe' : '#e2e8f0',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: '600' }}>{v.rewardName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {paymentMethod === 'Card' && (
          <View style={styles.cardContainer}>
            <Animated.View
              style={[styles.cardFace, { transform: [{ rotateY: frontInterpolate }] }]}
            >
              <View style={styles.cardPreview}>
                <Text style={styles.cardNumber}>
                  {cardNumber ? cardNumber.replace(/(.{4})/g, '$1 ').trim() : '**** **** **** ****'}
                </Text>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Expiry: {expiryDate || 'MM/YY'}</Text>
                  {cardType && (
                    <Image
                      source={{
                        uri:
                          cardType === 'Visa'
                            ? 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg'
                            : 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
                      }}
                      style={styles.cardLogo}
                      resizeMode="contain"
                    />
                  )}
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(text.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
              />
              <TextInput
                style={styles.input}
                placeholder="Expiry (MM/YY)"
                keyboardType="numeric"
                maxLength={5}
                value={expiryDate}
                onChangeText={handleExpiryChange}
              />
              <TouchableOpacity onPress={flipCard}>
                <Text style={styles.flipText}>Enter CVV</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[styles.cardFace, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}
            >
              <View style={styles.cardBackVisual}>
                <View style={styles.blackStrip} />
                <Text style={styles.cvvLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  keyboardType="numeric"
                  maxLength={3}
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>
              <TouchableOpacity onPress={flipCard}>
                <Text style={styles.flipText}>Back to Card</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

{paymentMethod === 'Bank' && (
  <View style={styles.bankSection}>
    <DropDownPicker
      open={bankDropdownOpen}
      value={bankName}
      items={bankOptions}
      setOpen={setBankDropdownOpen}
      setValue={(callback) => {
      const value = typeof callback === 'function' ? callback(bankName) : callback;
      setBankName(value);
}}
      setItems={setBankOptions}
      placeholder="Select your bank"
      style={styles.dropdown}
      dropDownContainerStyle={styles.dropdownContainer}
      zIndex={3000}
      zIndexInverse={1000}
      dropDownDirection="AUTO"
      listMode="SCROLLVIEW"
      textStyle={{ fontSize: 16, color: '#0f172a' }}
      placeholderStyle={{ color: '#64748b' }}
    />
    <TextInput
      style={styles.input}
      placeholder="Account Number"
      value={accountNumber}
      keyboardType="numeric"
      onChangeText={setAccountNumber}
      maxLength={16}
    />
  </View>
)}


        <View style={styles.saveRow}>
          <Text style={styles.label}>Save as Favorite?</Text>
          <Switch value={saveFavorite} onValueChange={setSaveFavorite} />
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && { backgroundColor: '#aaa' }]}
          disabled={isSubmitting}
          onPress={completePayment}
        >
          <Text style={styles.buttonText}>Complete Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  paymentBtn: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: '#3b82f6',
  },
  paymentText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  input: {
    width: 300,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    width: 300,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  cardContainer: {
    width: 320,
    height: 260,
    marginBottom: 20,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#1e3a8a',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: '#0f172a',
  },
  cardPreview: {
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 20,
    color: '#f8fafc',
    letterSpacing: 2,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 14,
    color: '#e0f2fe',
  },
  cardLogo: {
    width: 50,
    height: 20,
    marginTop: 4,
  },

  bankSection: {
  width: 300,
  alignItems: 'center',
  zIndex: 3000,
  marginBottom: 12,
},

dropdown: {
  width: 300,
  borderColor: '#cbd5e1',
  borderWidth: 1,
  borderRadius: 10,
  marginBottom: 12,
},

dropdownContainer: {
  width: 300,
  borderColor: '#cbd5e1',
  borderWidth: 1,
  borderRadius: 10,
  zIndex: 3000,
},

  flipText: {
    color: '#93c5fd',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  cardBackVisual: {
    marginTop: 10,
    alignItems: 'center',
  },
  blackStrip: {
    height: 40,
    backgroundColor: '#334155',
    width: '100%',
    marginBottom: 20,
    borderRadius: 6,
  },
  cvvLabel: {
    color: '#f8fafc',
    fontWeight: '700',
    marginBottom: 8,
  },
});
