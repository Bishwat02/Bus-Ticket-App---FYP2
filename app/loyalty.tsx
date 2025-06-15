// app/loyalty.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { auth } from '../src/services/firebaseConfig';
import { ProgressBar, Button } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  redeemed?: boolean;
}

interface Redemption {
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  redeemedAt: Date;
}

const rewardList: Reward[] = [
  {
    id: 'r1',
    name: '5% Off Ticket',
    pointsRequired: 100,
    description: 'Enjoy 5% off on your next booking!',
  },
  {
    id: 'r2',
    name: 'Free Seat Upgrade',
    pointsRequired: 200,
    description: 'Upgrade to a premium seat for free.',
  },
  {
    id: 'r3',
    name: 'RM10 Travel Credit',
    pointsRequired: 300,
    description: 'Redeem RM10 worth of travel credit.',
  },
];

export default function LoyaltyScreen() {
  const [totalFare, setTotalFare] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  const calculatePoints = (fare: number) => Math.floor(fare);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();
        const user = auth.currentUser;
        if (!user) return;

        const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', user.uid));
        const bookingSnap = await getDocs(bookingsQuery);

        let total = 0;
        bookingSnap.forEach(doc => {
          const data = doc.data();
          if (data.totalFare) total += parseFloat(data.totalFare);
        });
        setTotalFare(total);

        const redemptionsQuery = query(collection(db, 'redemptions'), where('userId', '==', user.uid));
        const redemptionSnap = await getDocs(redemptionsQuery);

        const redeemed: string[] = [];
        const redemptionData: Redemption[] = [];

        redemptionSnap.forEach(doc => {
          const data = doc.data();
          if (data.rewardId) {
            redeemed.push(data.rewardId);
            redemptionData.push({
              rewardId: data.rewardId,
              rewardName: data.rewardName,
              pointsSpent: data.pointsSpent,
              redeemedAt: data.redeemedAt?.toDate?.() || new Date(),
            });
          }
        });

        setRedeemedRewards(redeemed);
        setRedemptions(redemptionData);
      } catch (err) {
        console.error('Error fetching loyalty data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const points = calculatePoints(totalFare);
  const level = points >= 300 ? 'Gold' : points >= 200 ? 'Silver' : points >= 100 ? 'Bronze' : 'Newbie';
  const nextTierPoints = level === 'Newbie' ? 100 : level === 'Bronze' ? 200 : level === 'Silver' ? 300 : null;
  const progress = nextTierPoints ? Math.min(points / nextTierPoints, 1) : 1;

  const tierIcons: Record<string, string> = {
    Newbie: 'https://img.icons8.com/ios/100/neutral-emoticon.png',
    Bronze: 'https://img.icons8.com/color/96/bronze-medal.png',
    Silver: 'https://img.icons8.com/color/96/silver-medal.png',
    Gold: 'https://img.icons8.com/color/96/gold-medal.png',
  };

  const handleRedeem = async (reward: Reward) => {
    if (points < reward.pointsRequired) {
      Alert.alert('Not Enough Points', 'Earn more loyalty points to redeem this reward.');
      return;
    }

    if (redeemedRewards.includes(reward.id)) {
      Alert.alert('Already Redeemed', 'You have already redeemed this reward.');
      return;
    }

    try {
      const db = getFirestore();
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, 'redemptions'), {
        userId: user.uid,
        rewardId: reward.id,
        rewardName: reward.name,
        pointsSpent: reward.pointsRequired,
        redeemedAt: new Date(),
      });

      setRedeemedRewards([...redeemedRewards, reward.id]);
      setRedemptions([
        ...redemptions,
        {
          rewardId: reward.id,
          rewardName: reward.name,
          pointsSpent: reward.pointsRequired,
          redeemedAt: new Date(),
        },
      ]);

      Alert.alert('Reward Redeemed!', `You successfully redeemed: ${reward.name}`);
    } catch (err) {
      console.error('Redemption failed:', err);
      Alert.alert('Error', 'Failed to redeem the reward. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Fetching your loyalty status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loyalty Summary */}
      <View style={styles.iconContainer}>
        <Image source={{ uri: tierIcons[level] }} style={styles.iconImage} />
      </View>
      <Text style={styles.title}>Loyalty Points</Text>
      <Text style={styles.points}>{points} pts</Text>
      <Text style={styles.fare}>Total Fare Spent: RM {totalFare.toFixed(2)}</Text>

      <ProgressBar progress={progress} color="#10b981" style={styles.progress} />
      <Text style={styles.levelText}>Tier: {level} {nextTierPoints && `(Next: ${nextTierPoints} pts)`}</Text>

      {/* Reward Redemption Options */}
      <Text style={styles.rewardsHeader}>Unlockable Rewards</Text>
      <FlatList
        data={rewardList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.rewardCard}>
            <View style={styles.rewardInfo}>
              <MaterialIcons name="card-giftcard" size={28} color="#ef4444" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.rewardName}>{item.name}</Text>
                <Text style={styles.rewardDesc}>{item.description}</Text>
                <Text style={styles.rewardPoints}>{item.pointsRequired} pts required</Text>
              </View>
            </View>
            <Button
              mode="contained"
              disabled={points < item.pointsRequired || redeemedRewards.includes(item.id)}
              onPress={() => handleRedeem(item)}
              style={styles.redeemBtn}
            >
              {redeemedRewards.includes(item.id) ? 'Redeemed' : 'Redeem'}
            </Button>
          </View>
        )}
      />

      {/* Redemption History */}
      {redemptions.length > 0 && (
        <>
          <Text style={styles.rewardsHeader}>Your Redeemed Rewards</Text>
          <FlatList
            data={redemptions}
            keyExtractor={(item, index) => `${item.rewardId}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.redemptionCard}>
                <Text style={styles.rewardName}>{item.rewardName}</Text>
                <Text style={styles.rewardDesc}>Spent: {item.pointsSpent} pts</Text>
                <Text style={styles.redemptionDate}>
                  {item.redeemedAt.toLocaleString()}
                </Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Existing styles ...
  // (unchanged from your previous code)
  container: {
    flex: 1,
    backgroundColor: '#fefce8',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fefce8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  iconImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
    textAlign: 'center',
  },
  points: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'center',
  },
  fare: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 10,
  },
  progress: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#d1d5db',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4b5563',
  },
  rewardsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 20,
    marginBottom: 10,
  },
  rewardCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  rewardDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  rewardPoints: {
    fontSize: 12,
    color: '#9ca3af',
  },
  redeemBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  redemptionCard: {
    backgroundColor: '#e0f2fe',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  redemptionDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
