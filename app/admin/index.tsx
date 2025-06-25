// app/admin/index.tsx
//Admin dashboard for managing bookings, history, and loyalty programs
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <TouchableOpacity style={styles.btn} onPress={() => router.push('/admin/book')}>
        <Text style={styles.btnText}>Manage Bookings</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.btn} onPress={() => router.push('/admin/history')}>
        <Text style={styles.btnText}>Manage History</Text>
      </TouchableOpacity> */}

      {/* <TouchableOpacity style={styles.btn} onPress={() => router.push('/admin/loyalty')}>
        <Text style={styles.btnText}>Manage Loyalty / Rewards</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f9fafb' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  btn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 10, marginBottom: 16 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});
