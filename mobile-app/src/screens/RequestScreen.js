import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, FlatList, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function RequestScreen() {
  const { userToken } = useContext(AuthContext);
  const { theme, themeColors, isDarkMode } = useContext(ThemeContext);
  
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
      case 'approved': return theme.success;
      case 'rejected': return theme.danger;
      default: return theme.warning;
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
      <View style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyType, { color: theme.text }]}>{getTypeLabel(item.request_type)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A', borderColor: statusColor }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={[styles.historyDescription, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        {item.start_date && item.end_date && (
          <Text style={[styles.historyDates, { color: themeColors.primary }]}>
            {item.start_date} s/d {item.end_date}
          </Text>
        )}
        <Text style={[styles.historyDate, { color: theme.textSecondary }]}>Dibuat pada: {date}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Scrollable Layout */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHistoryItem}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Submit New Request</Text>
            
            {/* Type Selector */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Request Type</Text>
            <View style={styles.selectorGrid}>
              <TouchableOpacity 
                style={[
                  styles.selectorCard, 
                  { backgroundColor: theme.card, borderColor: theme.border },
                  requestType === 'permission' ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : null
                ]}
                onPress={() => setRequestType('permission')}
              >
                <Ionicons name="document-text-outline" size={20} color={requestType === 'permission' ? '#FFFFFF' : theme.iconColor} />
                <Text style={[styles.selectorText, { color: theme.textSecondary }, requestType === 'permission' ? { color: '#FFFFFF' } : null]}>Izin</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.selectorCard, 
                  { backgroundColor: theme.card, borderColor: theme.border },
                  requestType === 'sick' ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : null
                ]}
                onPress={() => setRequestType('sick')}
              >
                <Ionicons name="bandage-outline" size={20} color={requestType === 'sick' ? '#FFFFFF' : theme.iconColor} />
                <Text style={[styles.selectorText, { color: theme.textSecondary }, requestType === 'sick' ? { color: '#FFFFFF' } : null]}>Sakit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.selectorCard, 
                  { backgroundColor: theme.card, borderColor: theme.border },
                  requestType === 'leave' ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : null
                ]}
                onPress={() => setRequestType('leave')}
              >
                <Ionicons name="briefcase-outline" size={20} color={requestType === 'leave' ? '#FFFFFF' : theme.iconColor} />
                <Text style={[styles.selectorText, { color: theme.textSecondary }, requestType === 'leave' ? { color: '#FFFFFF' } : null]}>Cuti</Text>
              </TouchableOpacity>
            </View>

            {/* Date Inputs */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Start Date</Text>
                <TouchableOpacity 
                  style={[styles.datePickerBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={[styles.dateText, { color: startDate ? theme.text : theme.textSecondary }]}>
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
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>End Date</Text>
                <TouchableOpacity 
                  style={[styles.datePickerBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={[styles.dateText, { color: endDate ? theme.text : theme.textSecondary }]}>
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
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Reason / Description</Text>
            <TextInput
              style={[styles.textAreaInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              multiline
              numberOfLines={4}
              placeholder="Provide a detailed explanation for your request..."
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
            />

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }]} 
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit Request</Text>
                </>
              )}
            </TouchableOpacity>

            {/* History Section Divider */}
            <Text style={[styles.sectionDividerHeader, { color: theme.textSecondary }]}>Request History</Text>
          </View>
        }
        ListFooterComponent={
          fetchingHistory ? (
            <ActivityIndicator size="small" color={themeColors.primary} style={styles.loader} />
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No permission requests submitted yet.</Text>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputLabel: {
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
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  datePickerBtn: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    height: 52,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
  },
  textAreaInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionDividerHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 30,
    marginBottom: 10,
    paddingLeft: 4,
  },
  historyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyType: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  historyDates: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  historyDate: {
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
    fontSize: 13,
    marginTop: 10,
  },
});
