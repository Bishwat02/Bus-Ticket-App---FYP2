//app/profile.tsx
//Profile Screen

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, updateEmail } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../src/services/firebaseConfig';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
    loyaltyPoints: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await Promise.all([
          fetchUserProfile(firebaseUser.uid),
          fetchLoyaltyPoints(firebaseUser.uid),
        ]);
        setLoading(false);
      } else {
        router.replace('/login');
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid: string) => {
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfileData((prev) => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL || '',
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const fetchLoyaltyPoints = async (uid: string) => {
    try {
      const q = query(collection(db, 'loyaltyPoints'), where('userId', '==', uid));
      const snapshot = await getDocs(q);

      let total = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        total += data.points || 0;
      });

      setProfileData((prev) => ({ ...prev, loyaltyPoints: total }));
    } catch (err) {
      console.error('Failed to fetch loyalty points:', err);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileData((prev) => ({ ...prev, photoURL: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    try {
      if (user && profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
      }

      if (user) {
        const { loyaltyPoints, ...userDataToSave } = profileData; // strip out loyaltyPoints
        await setDoc(doc(db, 'users', user.uid), userDataToSave);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated.');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Could not update profile.');
    }
  };

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        disabled={!isEditing}
        onPress={handlePickImage}
        style={styles.imageWrapper}
      >
        <Image
          source={
            profileData.photoURL
              ? { uri: profileData.photoURL }
              : require('../assets/images/default-avatar.png')
          }
          style={styles.avatar}
        />
        {isEditing && <Text style={styles.editPhotoText}>Change Photo</Text>}
      </TouchableOpacity>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          editable={isEditing}
          style={styles.input}
          value={profileData.name}
          onChangeText={(text) => setProfileData({ ...profileData, name: text })}
        />
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          editable={isEditing}
          style={styles.input}
          value={profileData.email}
          onChangeText={(text) => setProfileData({ ...profileData, email: text })}
        />
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          editable={isEditing}
          style={styles.input}
          value={profileData.phone}
          onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
        />
      </View>

      {/* <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Loyalty Points</Text>
        <Text style={styles.readonly}>{profileData.loyaltyPoints} pts</Text>
      </View> */}

      {isEditing ? (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
  },
  editPhotoText: {
    color: '#1d4ed8',
    marginTop: 8,
  },
  fieldWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readonly: {
    fontSize: 16,
    color: '#334155',
    paddingVertical: 8,
  },
  editBtn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    borderColor: '#ef4444',
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
