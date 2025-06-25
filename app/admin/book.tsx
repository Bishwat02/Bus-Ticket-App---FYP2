// admin/book.tsx
// Admin interface for managing bookings with table layout and search
// CREATE, READ, UPDATE, DELETE operations for bookings

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    createBookingWithCustomId,
    deleteBooking,
    getAllBookings,
    updateBooking,
} from '../../src/utils/seeder';

interface Booking {
  id?: string;
  origin: string;
  destination: string;
  tripType: string;
  passengers: number;
  busType: string;
  travelDate: string;
  returnDate?: string;
  totalFare: number;
  userId?: string;
}

const defaultBooking: Booking = {
  origin: '',
  destination: '',
  tripType: 'One-way',
  passengers: 1,
  busType: 'Economy',
  travelDate: '',
  returnDate: '',
  totalFare: 0,
};

const ITEMS_PER_PAGE = 10;

export default function AdminBookManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking>(defaultBooking);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBookings(bookings);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredBookings(
        bookings.filter(
          b =>
            b.id?.toLowerCase().includes(lower) ||
            b.origin.toLowerCase().includes(lower) ||
            b.destination.toLowerCase().includes(lower) ||
            b.tripType.toLowerCase().includes(lower) ||
            b.busType.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    const data = await getAllBookings();
    setBookings(data as Booking[]);
  };

  const handleSave = async () => {
    if (!currentBooking.origin || !currentBooking.destination || !currentBooking.travelDate) {
      return;
    }

    if (editingId) {
      await updateBooking(editingId, currentBooking);
    } else {
      await createBookingWithCustomId(currentBooking);
    }

    resetForm();
    fetchBookings();
  };

  const handleEdit = (booking: Booking) => {
    setCurrentBooking(booking);
    setEditingId(booking.id ?? null);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await deleteBooking(id);
    fetchBookings();
  };

  const resetForm = () => {
    setModalVisible(false);
    setCurrentBooking(defaultBooking);
    setEditingId(null);
  };

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📟 Admin Booking Table</Text>

      <View style={styles.topBar}>
        <TextInput
          style={styles.search}
          placeholder="Search by booking ID"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.th}>Booking ID</Text>
        <Text style={styles.th}>Origin</Text>
        <Text style={styles.th}>Destination</Text>
        <Text style={styles.th}>Trip</Text>
        <Text style={styles.th}>Bus</Text>
        <Text style={styles.th}>Date</Text>
        <Text style={styles.th}>Fare</Text>
        <Text style={styles.th}>Action</Text>
      </View>

      {paginatedBookings.map(item => (
        <View style={styles.tableRow} key={item.id}>
          <Text style={styles.td}>{item.id}</Text>
          <Text style={styles.td}>{item.origin}</Text>
          <Text style={styles.td}>{item.destination}</Text>
          <Text style={styles.td}>{item.tripType}</Text>
          <Text style={styles.td}>{item.busType}</Text>
          <Text style={styles.td}>{new Date(item.travelDate).toLocaleDateString()}</Text>
          <Text style={styles.td}>RM {item.totalFare.toFixed(2)}</Text>
          <View style={styles.rowActions}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
              <Ionicons name="create" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.deleteBtn}>
              <Ionicons name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={[styles.pageBtn, currentPage === 1 && styles.disabledPage]}
          >
            <Text style={styles.pageText}>Prev</Text>
          </TouchableOpacity>

          <Text style={styles.pageNumber}>
            Page {currentPage} / {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={[styles.pageBtn, currentPage === totalPages && styles.disabledPage]}
          >
            <Text style={styles.pageText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingId ? '✏️ Edit Booking' : '➕ New Booking'}
          </Text>

          {[{ label: 'Origin', key: 'origin' },
            { label: 'Destination', key: 'destination' },
            { label: 'Trip Type', key: 'tripType' },
            { label: 'Bus Type', key: 'busType' },
            { label: 'Travel Date (YYYY-MM-DD)', key: 'travelDate' },
            { label: 'Return Date (optional)', key: 'returnDate' },
          ].map(({ label, key }) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={label}
              value={(currentBooking as any)[key]}
              onChangeText={text =>
                setCurrentBooking(prev => ({ ...prev, [key]: text }))
              }
            />
          ))}

          <TextInput
            style={styles.input}
            placeholder="Passengers"
            keyboardType="number-pad"
            value={String(currentBooking.passengers)}
            onChangeText={text =>
              setCurrentBooking(prev => ({
                ...prev,
                passengers: parseInt(text) || 1,
              }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Total Fare (RM)"
            keyboardType="decimal-pad"
            value={String(currentBooking.totalFare)}
            onChangeText={text =>
              setCurrentBooking(prev => ({
                ...prev,
                totalFare: parseFloat(text) || 0,
              }))
            }
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  search: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, marginRight: 8, borderRadius: 6 },
  addButton: { backgroundColor: '#2563eb', padding: 10, borderRadius: 6 },
  addButtonText: { color: 'white', fontWeight: '600' },
  tableHeader: { flexDirection: 'row', marginTop: 16, borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 6 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#f0f0f0', alignItems: 'center' },
  th: { flex: 1, fontWeight: '700', fontSize: 12, color: '#374151' },
  td: { flex: 1, fontSize: 12, color: '#111827' },
  rowActions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#4ade80', padding: 6, borderRadius: 6 },
  deleteBtn: { backgroundColor: '#f87171', padding: 6, borderRadius: 6 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 },
  pageBtn: { backgroundColor: '#3b82f6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  disabledPage: { backgroundColor: '#93c5fd' },
  pageText: { color: '#fff', fontWeight: '600' },
  pageNumber: { fontWeight: '600' },
  modalContainer: { padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  saveBtn: { backgroundColor: '#10b981', padding: 10, borderRadius: 6 },
  cancelBtn: { backgroundColor: '#ef4444', padding: 10, borderRadius: 6 },
  saveText: { color: 'white', fontWeight: '600' },
  cancelText: { color: 'white', fontWeight: '600' },
});
