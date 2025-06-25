// app/booking/history.tsx
// Booking History Screen

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../src/services/firebaseConfig';

let RNHTMLtoPDF: any = null;
let Share: any = null;
if (Platform.OS !== 'web') {
  RNHTMLtoPDF = require('react-native-html-to-pdf').default;
  Share = require('react-native-share').default;
}

interface Booking {
  id: string;
  origin: string;
  destination: string;
  travelDate: string;
  returnDate?: string | null;
  passengers: number;
  busType: string;
  timestamp: string;
  tripType?: string;
  totalFare?: number;
  loyaltyPoints?: number;
  isDummy?: boolean;
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  // const [selectedTripType, setSelectedTripType] = useState<string | null>(null);
  // const [selectedBusType, setSelectedBusType] = useState<string | null>(null);

  const [receiptModal, setReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        where('isDummy', '==', false)
      );

      const snapshot = await getDocs(q);
      const userBookings: Booking[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          origin: data.origin || 'Unknown',
          destination: data.destination || 'Unknown',
          travelDate: data.travelDate,
          returnDate: data.returnDate || null,
          passengers: data.passengers || 1,
          busType: data.busType || 'Economy',
          timestamp: data.timestamp,
          tripType: data.tripType || 'One-way',
          totalFare: data.totalFare || 0,
          loyaltyPoints: data.loyaltyPoints || 0,
          isDummy: data.isDummy || false,
        };
      });

      userBookings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setBookings(userBookings);
      setFilteredBookings(userBookings);
    } catch (error) {
      console.error('Failed to fetch booking history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (booking: Booking) => {
    const today = new Date();
    const travel = new Date(booking.travelDate);
    // if (travel < today) {
    //   Alert.alert('Too Late', 'Cannot cancel past bookings.');
    //   return;
    // }
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'bookings', booking.id));
              const updated = bookings.filter((b) => b.id !== booking.id);
              setBookings(updated);
              setFilteredBookings(updated);
              // Reset to page 1 after cancellation to avoid empty pages
              setCurrentPage(1);
              Alert.alert('Cancelled', 'Booking has been successfully cancelled.');
            } catch (err) {
              console.error('Cancel failed:', err);
              Alert.alert('Error', 'Failed to cancel the booking. Try again later.');
            }
          },
        },
      ]
    );
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleViewReceipt = (booking: Booking) => {
    const htmlContent = `
      <h1>🧾 Bus Ticket Receipt</h1>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Trip:</strong> ${booking.origin} ➝ ${booking.destination}</p>
      <p><strong>Date:</strong> ${booking.travelDate}</p>
      ${booking.returnDate ? `<p><strong>Return:</strong> ${booking.returnDate}</p>` : ''}
      <p><strong>Passengers:</strong> ${booking.passengers}</p>
      <p><strong>Bus Type:</strong> ${booking.busType}</p>
      <p><strong>Total Fare:</strong> RM ${booking.totalFare?.toFixed(2)}</p>
      <p><strong>Loyalty Points:</strong> ${booking.loyaltyPoints}</p>
      <p><strong>Booked On:</strong> ${new Date(booking.timestamp).toLocaleString()}</p>
    `;
    setCurrentReceipt(htmlContent);
    setReceiptModal(true);
  };

  const handleDownloadPDF = async () => {
    if (Platform.OS === 'web') {
      const blob = new Blob([currentReceipt.replace(/<[^>]+>/g, '')], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Booking_Receipt.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      try {
        const file = await RNHTMLtoPDF.convert({
          html: currentReceipt,
          fileName: 'Booking_Receipt',
          directory: 'Documents',
        });
        await Share.open({
          url: Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath,
        });
      } catch (error) {
        Alert.alert('Failed to generate PDF receipt.');
      }
    }
    setReceiptModal(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Loading booking history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 

      <Text style={{ fontWeight: '600', fontSize: 16 }}>Filter by:</Text>
      <ScrollView horizontal style={{ marginVertical: 8 }}>
        {[...Array(12)].map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.monthBtn, selectedMonth === i && styles.monthBtnActive]}
            onPress={() => handleFilterByMonth(i)}
          >
            <Text style={styles.monthText}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.clearBtn} onPress={() => handleFilterByMonth(null)}>
          <Text>Clear Month</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        {['One-way', 'Round-trip'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.monthBtn, selectedTripType === type && styles.monthBtnActive]}
            onPress={() => handleFilterByTripType(type)}
          >
            <Text style={styles.monthText}>{type}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.clearBtn} onPress={() => handleFilterByTripType(null)}>
          <Text>Clear Type</Text>
        </TouchableOpacity>

        {['Economy', 'Luxury'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.monthBtn, selectedBusType === type && styles.monthBtnActive]}
            onPress={() => handleFilterByBusType(type)}
          >
            <Text style={styles.monthText}>{type}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.clearBtn} onPress={() => handleFilterByBusType(null)}>
          <Text>Clear Bus</Text>
        </TouchableOpacity>
      </View>
      */}

      <FlatList
        data={paginatedBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <View
              style={[
                styles.card,
                { borderLeftColor: item.busType === 'Luxury' ? '#3b82f6' : '#10b981' },
              ]}
            >
              <Text style={styles.route}>
                {item.origin} ➝ {item.destination}
              </Text>
              <Text style={styles.detail}>Booking ID: {item.id}</Text>
              <Text style={styles.detail}>Date: {item.travelDate}</Text>
              {item.returnDate && <Text style={styles.detail}>Return: {item.returnDate}</Text>}
              <Text style={styles.detail}>Passengers: {item.passengers}</Text>
              <Text style={styles.detail}>Bus: {item.busType}</Text>
              <Text style={styles.detail}>Fare: RM {item.totalFare?.toFixed(2)}</Text>
              <Text style={styles.detail}>Points: {item.loyaltyPoints}</Text>
              <Text style={styles.bookedOn}>
                Booked on {new Date(item.timestamp).toLocaleString()}
              </Text>

              <View style={{ flexDirection: 'row', marginTop: 10, gap: 12 }}>
                {/* <TouchableOpacity onPress={() => handleCancel(item)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity> */}
                <TouchableOpacity onPress={() => handleViewReceipt(item)}>
                  <Text style={styles.downloadText}>View Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Pagination controls */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={goToPrevPage}
          disabled={currentPage === 1}
          style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}
        >
          <Text style={styles.pageBtnText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageIndicator}>
          Page {currentPage} of {totalPages || 1}
        </Text>
        <TouchableOpacity
          onPress={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          style={[styles.pageBtn, (currentPage === totalPages || totalPages === 0) && styles.disabledBtn]}
        >
          <Text style={styles.pageBtnText}>Next</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={receiptModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000000aa' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20 }}>
            <ScrollView>
              <Text>{currentReceipt.replace(/<[^>]+>/g, '')}</Text>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
              <TouchableOpacity onPress={() => setReceiptModal(false)}>
                <Text style={{ color: '#dc2626', fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDownloadPDF}>
                <Text style={{ color: '#0f766e', fontWeight: '600' }}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  cardWrapper: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 6,
  },
  route: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  bookedOn: {
    marginTop: 10,
    fontSize: 12,
    color: '#9ca3af',
  },
  cancelText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  downloadText: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '600',
  },
  monthBtn: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  monthBtnActive: {
    backgroundColor: '#3b82f6',
  },
  monthText: {
    fontWeight: '600',
    color: '#1e293b',
  },
  clearBtn: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 20,
  },
  pageBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  disabledBtn: {
    backgroundColor: '#a5b4fc',
  },
  pageBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  pageIndicator: {
    fontWeight: '600',
    fontSize: 16,
  },
});
