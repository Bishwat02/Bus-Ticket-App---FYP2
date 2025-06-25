// app/loyalty.tsx
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../src/services/firebaseConfig';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  image: any;
}

interface Booking {
  id: string;
  totalFare: number;
  pointsEarned: number;
  travelDate: string;
}

export default function Loyalty() {
  const [points, setPoints] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  const rewards: Reward[] = [
    {
      id: '1',
      name: 'Buy 1 Free 1',
      description: 'Buy 1 Get 1 Free ticket.',
      pointsRequired: 150,
      image: require('../assets/images/B1F1.png'),
    },
    {
      id: '2',
      name: 'RM10 off',
      description: 'Get a RM10 discount for your next ride.',
      pointsRequired: 100,
      image: require('../assets/images/voucher.jpeg'),
    },
    {
      id: '3',
      name: 'Free Ticket',
      description: 'Get a free one-way/round-trip ticket.',
      pointsRequired: 200,
      image: require('../assets/images/free-ticket.png'),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const bookingQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );
      const bookingSnap = await getDocs(bookingQuery);

      let total = 0;
      const bookingList: Booking[] = [];

      bookingSnap.forEach((doc) => {
        const data = doc.data();
        const fare = parseFloat(data.totalFare) || 0;
        const earned = Math.floor(fare / 5);
        total += earned;

        bookingList.push({
          id: doc.id,
          totalFare: fare,
          pointsEarned: earned,
          travelDate: new Date(data.travelDate).toLocaleDateString(),
        });
      });

      const redemptionQuery = query(
        collection(db, 'redemptions'),
        where('userId', '==', user.uid)
      );
      const redemptionSnap = await getDocs(redemptionQuery);

      let spent = 0;
      redemptionSnap.forEach((doc) => {
        const data = doc.data();
        spent += data.pointsSpent || 0;
      });

      setPoints(total - spent);
      setBookings(bookingList);
    };

    fetchData();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    const user = auth.currentUser;
    if (!user) return;

    if (points < reward.pointsRequired) {
      Alert.alert('Not enough points', 'Earn more points to redeem this reward.');
      return;
    }

    try {
      await addDoc(collection(db, 'redemptions'), {
        userId: user.uid,
        rewardId: reward.id,
        rewardName: reward.name,
        pointsSpent: reward.pointsRequired,
        redeemedAt: serverTimestamp(),
        used: false,
      });

      setPoints((prev) => prev - reward.pointsRequired);

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert('Reward Redeemed', `You redeemed: ${reward.name}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to redeem reward.');
    }
  };

  const getTier = () => {
    if (points >= 300) return 'Platinum';
    if (points >= 200) return 'Gold';
    if (points >= 100) return 'Silver';
    return 'Bronze';
  };

  const nextTierPoints = () => {
    if (points < 100) return 100 - points;
    if (points < 200) return 200 - points;
    if (points < 300) return 300 - points;
    return 0;
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.popup, { opacity: fadeAnim }]}> 
        <Text style={styles.popupText}>🎉 Redeemed!</Text>
      </Animated.View>

      <Text style={styles.header}>Your Point Card</Text>
      <View style={styles.cardBox}>
        <Text style={styles.points}>{points} pts</Text>
        <Text style={styles.tier}>Tier: {getTier()}</Text>
        {nextTierPoints() > 0 && (
          <Text style={styles.nextTier}>Earn {nextTierPoints()} more points to upgrade!</Text>
        )}
      </View>

      <Text style={styles.subHeader}>Available Rewards</Text>
      {rewards.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image source={item.image} style={styles.rewardImage} />
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardName}>{item.name}</Text>
            <Text style={styles.rewardDesc}>{item.description}</Text>
            <Text style={styles.rewardPoints}>{item.pointsRequired} pts</Text>
            <TouchableOpacity
              style={[styles.redeemBtn, points < item.pointsRequired ? styles.disabledBtn : {}]}
              disabled={points < item.pointsRequired}
              onPress={() => handleRedeem(item)}
            >
              <Text style={styles.redeemText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* <Text style={styles.subHeader}>Your Bookings & Points Earned</Text>
      {bookings.map((b) => (
        <View key={b.id} style={styles.historyCard}>
          <Text style={styles.historyText}>RM {b.totalFare.toFixed(2)} — {b.pointsEarned} pts</Text>
          <Text style={styles.dateText}>{b.travelDate}</Text>
        </View>
      ))} */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
    padding: 20,
  },
  popup: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  popupText: {
    backgroundColor: '#22c55e',
    color: '#fff',
    fontSize: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#b45309',
    marginBottom: 8,
  },
  cardBox: {
    backgroundColor: '#fcd34d',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  points: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c2d12',
  },
  tier: {
    fontSize: 18,
    color: '#92400e',
    marginTop: 6,
  },
  nextTier: {
    fontSize: 14,
    color: '#78350f',
    marginTop: 4,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
    color: '#1e3a8a',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  rewardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  rewardDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 4,
  },
  rewardPoints: {
    fontSize: 14,
    color: '#9ca3af',
  },
  redeemBtn: {
    marginTop: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#9ca3af',
  },
  redeemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#fef9c3',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
