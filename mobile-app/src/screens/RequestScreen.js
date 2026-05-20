import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, FlatList, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export default function RequestScreen() {
  const { userToken } = useContext(AuthContext);
  
  const [requestType, setRequestType] = useState('permission');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  const fetchRequestHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/requests`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setHistory(response.data.data || []);
    } catch (error) {
      console.log('Error fetching requests history:', error);
    } finally {
      setFetchingHistory(false);
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setStartDate(formatted);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setEndDate(formatted);
    }
  };

  useEffect(() => {
    fetchRequestHistory();
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a detailed description / reason.');
      return;
    }

    Keyboard.dismiss();
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/attendance/request`, {
        request_type: requestType,
        description: description,
        start_date: startDate || null,
        end_date: endDate || null,
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      Alert.alert('Success', 'Your permission request has been submitted successfully.');
      setDescription('');
      setStartDate('');
      setEndDate('');
      fetchRequestHistory(); // reload history
    } catch (error) {
      console.log('Error submitting request:', error);
      Alert.alert('Submission Failed', error.response?.data?.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'sick': return 'Sakit (Sick)';
      case 'leave': return 'Cuti (Leave)';
      default: return 'Izin (Permission)';
    }
  };

  const renderHistoryItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const date = new Date(item.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyType}>{getTypeLabel(item.request_type)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A', borderColor: statusColor }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.historyDescription} numberOfLines={2}>{item.description}</Text>
        {item.start_date && item.end_date && (
          <Text style={styles.historyDates}>
            {item.start_date} s/d {item.end_date}
          </Text>
        )}
        <Text style={styles.historyDate}>Dibuat pada: {date}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Layout */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHistoryItem}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Submit New Request</Text>
            
            {/* Type Selector */}
            <Text style={styles.inputLabel}>Request Type</Text>
            <View style={styles.selectorGrid}>
              <TouchableOpacity 
                style={[styles.selectorCard, requestType === 'permission' ? styles.selectorActive : null]}
                onPress={() => setRequestType('permission')}
              >
                <Ionicons name="document-text-outline" size={20} color={requestType === 'permission' ? '#0F172A' : '#94A3B8'} />
                <Text style={[styles.selectorText, requestType === 'permission' ? styles.selectorTextActive : null]}>Izin</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.selectorCard, requestType === 'sick' ? styles.selectorActive : null]}
                onPress={() => setRequestType('sick')}
              >
                <Ionicons name="bandage-outline" size={20} color={requestType === 'sick' ? '#0F172A' : '#94A3B8'} />
                <Text style={[styles.selectorText, requestType === 'sick' ? styles.selectorTextActive : null]}>Sakit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.selectorCard, requestType === 'leave' ? styles.selectorActive : null]}
                onPress={() => setRequestType('leave')}
              >
                <Ionicons name="briefcase-outline" size={20} color={requestType === 'leave' ? '#0F172A' : '#94A3B8'} />
                <Text style={[styles.selectorText, requestType === 'leave' ? styles.selectorTextActive : null]}>Cuti</Text>
              </TouchableOpacity>
            </View>

            {/* Date Inputs */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.datePickerBtn}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={[styles.dateText, !startDate && { color: '#475569' }]}>
                    {startDate || 'Select Date'}
                  </Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate ? new Date(startDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={onStartDateChange}
                  />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TouchableOpacity 
                  style={styles.datePickerBtn}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={[styles.dateText, !endDate && { color: '#475569' }]}>
                    {endDate || 'Select Date'}
                  </Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate ? new Date(endDate) : new Date()}
                    mode="date"
                    display="default"
                    minimumDate={startDate ? new Date(startDate) : undefined}
                    onChange={onEndDateChange}
                  />
                )}
              </View>
            </View>

            {/* Description Text Input */}
            <Text style={styles.inputLabel}>Reason / Description</Text>
            <TextInput
              style={styles.textAreaInput}
              multiline
              numberOfLines={4}
              placeholder="Provide a detailed explanation for your request..."
              placeholderTextColor="#475569"
              value={description}
              onChangeText={setDescription}
            />

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#0F172A" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#0F172A" />
                  <Text style={styles.submitBtnText}>Submit Request</Text>
                </>
              )}
            </TouchableOpacity>

            {/* History Section Divider */}
            <Text style={styles.sectionDividerHeader}>Request History</Text>
          </View>
        }
        ListFooterComponent={
          fetchingHistory ? (
            <ActivityIndicator size="small" color="#F59E0B" style={styles.loader} />
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={32} color="#475569" />
              <Text style={styles.emptyText}>No permission requests submitted yet.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.scrollContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  formTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  selectorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectorCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectorActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  selectorText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  selectorTextActive: {
    color: '#0F172A',
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    padding: 12,
    fontSize: 14,
  },
  datePickerBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    height: 48,
    justifyContent: 'center',
  },
  dateText: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  textAreaInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  submitBtnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  sectionDividerHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 30,
    marginBottom: 10,
    paddingLeft: 4,
  },
  historyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyType: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  historyDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  historyDates: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  historyDate: {
    color: '#64748B',
    fontSize: 11,
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#475569',
    fontSize: 13,
    marginTop: 10,
  },
});
