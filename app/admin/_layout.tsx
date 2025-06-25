// app/admin/_layout.tsx
import { Stack, usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) =>
    pathname === `/admin/${route}` || (route === 'index' && pathname === '/admin');

  return (
    <View style={{ flex: 1 }}>
      {/* Custom Admin Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Admin Panel</Text>

        <View style={styles.navLinks}>
          <TouchableOpacity
            onPress={() => router.push('../admin')}
            style={[styles.navItem, isActive('admin') && styles.activeLink]}
          >
            <Text style={styles.link}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('../admin/book')}
            style={[styles.navItem, isActive('book') && styles.activeLink]}
          >
            <Text style={styles.link}>Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  link: {
    color: '#dbeafe',
    fontWeight: '600',
  },
  activeLink: {
    backgroundColor: '#3b82f6',
  },
});
