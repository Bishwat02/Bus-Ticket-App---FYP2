// firestoreUtils.ts
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

const db = getFirestore();

export async function ensureUserInFirestore(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString(),
    });
    console.log(`✅ Created user doc for: ${user.email}`);
  } else {
    console.log(`ℹ️ User doc already exists: ${user.email}`);
  }
}
