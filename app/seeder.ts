// seeder.ts
import {
  getFirestore,
  collection,
  setDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth } from '../src/services/firebaseConfig';
import { getFareForTrip } from '../src/utils/fareUtils';
import { ensureUserInFirestore } from '../src/utils/firestoreUtils';

const db = getFirestore();

//
// ─── BOOKINGS SEEDER ─────────────────────────────────────────────────────────────
//

export async function createBookingWithCustomId(booking: any) {
  const randomId = Math.random().toString(36).substring(2, 10);
  const docId = `BT${randomId}`;
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  if (user) {
    await ensureUserInFirestore(user); // ✅ Ensure user exists in Firestore
  }

  const bookingWithUser = user ? { ...booking, userId } : booking;

  await setDoc(doc(db, 'bookings', docId), bookingWithUser);

  const fare = booking.totalFare || booking.fare || 0;
  const pointsEarned = Math.floor(fare / 10);

  const loyaltyData = {
    bookingId: docId,
    points: pointsEarned,
    rewardsRedeemed: [],
    createdAt: new Date().toISOString(),
    userId: userId || null,
  };

  await createLoyaltyWithCustomId(loyaltyData);
  return docId;
}

export async function getAllBookings() {
  const snapshot = await getDocs(collection(db, 'bookings'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getBookingById(id: string) {
  const docSnap = await getDoc(doc(db, 'bookings', id));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function updateBooking(id: string, data: any) {
  await updateDoc(doc(db, 'bookings', id), data);
}

export async function deleteBooking(id: string) {
  await deleteDoc(doc(db, 'bookings', id));
}

export async function seedDummyBookings() {
  const cities = ['Subang Jaya', 'Kuala Lumpur', 'Penang', 'Ipoh', 'Malacca', 'Johor Bahru', 'Kota Kinabalu', 'Kuching', 'Langkawi', 'Cameron Highlands'];
  const busTypes = ['Economy', 'Business', 'VIP'];
  const tripTypes = ['One-way', 'Round-trip'];

  for (let i = 0; i < 10; i++) {
    const origin = cities[Math.floor(Math.random() * cities.length)];
    let destination = cities[Math.floor(Math.random() * cities.length)];
    while (destination === origin) {
      destination = cities[Math.floor(Math.random() * cities.length)];
    }

    const busType = busTypes[Math.floor(Math.random() * busTypes.length)];
    const passengers = Math.floor(Math.random() * 10) + 1;
    const tripType = tripTypes[Math.floor(Math.random() * tripTypes.length)];
    const travelDate = new Date(Date.now() + Math.floor(Math.random() * 10) * 86400000);
    const returnDate = tripType === 'Round-trip' ? new Date(travelDate.getTime() + Math.floor(Math.random() * 5 + 1) * 86400000) : null;

    const fare = getFareForTrip(origin, destination, busType);
    const totalFare = fare * passengers * (tripType === 'Round-trip' ? 2 : 1);

    await createBookingWithCustomId({
      origin,
      destination,
      busType,
      passengers,
      tripType,
      travelDate: travelDate.toISOString(),
      returnDate: returnDate ? returnDate.toISOString() : null,
      fare,
      totalFare,
    });
  }
}

//
// ─── LOYALTY POINTS SEEDER ───────────────────────────────────────────────────────
//

export async function createLoyaltyWithCustomId(loyaltyData: any) {
  const randomId = Math.random().toString(36).substring(2, 10);
  const docId = `LP${randomId}`;
  const user = auth.currentUser;
  const dataWithUser = user ? { ...loyaltyData, userId: user.uid } : loyaltyData;

  await setDoc(doc(db, 'loyaltyPoints', docId), dataWithUser);
  return docId;
}

export async function getAllLoyaltyPoints() {
  const snapshot = await getDocs(collection(db, 'loyaltyPoints'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getLoyaltyById(id: string) {
  const docSnap = await getDoc(doc(db, 'loyaltyPoints', id));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function updateLoyalty(id: string, data: any) {
  await updateDoc(doc(db, 'loyaltyPoints', id), data);
}

export async function deleteLoyalty(id: string) {
  await deleteDoc(doc(db, 'loyaltyPoints', id));
}

export async function seedDummyLoyalty() {
  for (let i = 0; i < 5; i++) {
    const points = Math.floor(Math.random() * 600); // 0–599
    await createLoyaltyWithCustomId({
      points,
      rewardsRedeemed: [],
      createdAt: new Date().toISOString(),
    });
  }
}

//
// ─── REWARDS SEEDER ──────────────────────────────────────────────────────
//

export async function seedRewards() {
  const rewards = [
    {
      name: 'Free Ticket',
      pointsRequired: 500,
      expiryDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      quantity: 10,
    },
    {
      name: 'Free Popcorn',
      pointsRequired: 150,
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      quantity: 50,
    },
    {
      name: 'Surprise Gift',
      pointsRequired: 300,
      expiryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      quantity: 20,
    },
  ];

  for (const reward of rewards) {
    const docId = `RW${Math.random().toString(36).substring(2, 10)}`;
    await setDoc(doc(db, 'rewards', docId), reward);
  }
}

//
// ─── TIER LEVEL SEEDER ───────────────────────────────────────────────────
//

export async function seedTiers() {
  const tiers = [
    {
      name: 'Bronze',
      minPoints: 0,
      icon: 'https://example.com/bronze-icon.png',
    },
    {
      name: 'Silver',
      minPoints: 300,
      icon: 'https://example.com/silver-icon.png',
    },
    {
      name: 'Gold',
      minPoints: 600,
      icon: 'https://example.com/gold-icon.png',
    },
  ];

  for (const tier of tiers) {
    const docId = `TR${Math.random().toString(36).substring(2, 10)}`;
    await setDoc(doc(db, 'tiers', docId), tier);
  }
}

//
// ─── MASTER SEED FUNCTION ────────────────────────────────────────────────
//

export async function seedAllLoyaltyData() {
  await seedDummyLoyalty();
  await seedRewards();
  await seedTiers();
  console.log('🎉 All loyalty-related data seeded successfully!');
}
