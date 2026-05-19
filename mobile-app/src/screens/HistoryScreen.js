import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export default function HistoryScreen() {
  const { userToken } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ presentDays: 0, lateDays: 0 });

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/history`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const data = response.data.data || [];
      setLogs(data);
      calculateStats(data);
    } catch (error) {
      console.log('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (data) => {
    // Unique check-in days
    const checkins = data.filter(log => log.attendance_type === 'checkin' && log.status === 'valid');
    const uniqueDays = new Set(checkins.map(log => log.scan_time.split('T')[0]));
    
    // Approximate late count based on scan time > 08:00 (since regular shift is 08:00)
    let lateCount = 0;
    checkins.forEach(log => {
      const time = new Date(log.scan_time);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      // Late if hours > 8 or (hours == 8 && minutes > 0)
      if (hours > 8 || (hours === 8 && minutes > 0)) {
        lateCount++;
      }
    });

    setStats({
      presentDays: uniqueDays.size,
      lateDays: lateCount,
    });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderLogItem = ({ item }) => {
    const isCheckin = item.attendance_type === 'checkin';
    const scanTime = new Date(item.scan_time);
    const isLate = isCheckin && (scanTime.getHours() > 8 || (scanTime.getHours() === 8 && scanTime.getMinutes() > 0));

    return (
      <View style={styles.logCard}>
        <View style={styles.logLeft}>
          <View style={[styles.iconBg, isCheckin ? styles.checkinIconBg : styles.checkoutIconBg]}>
            <Ionicons 
              name={isCheckin ? 'enter-outline' : 'exit-outline'} 
              size={20} 
              color={isCheckin ? '#10B981' : '#F59E0B'} 
            />
          </View>
          <View style={styles.logTextContainer}>
            <Text style={styles.logTitle}>{isCheckin ? 'Check In' : 'Check Out'}</Text>
            <Text style={styles.logDate}>{formatDate(item.scan_time)}</Text>
            {item.distance && (
              <Text style={styles.logMeta}>Office distance: {Math.round(item.distance)}m</Text>
            )}
          </View>
        </View>
        <View style={styles.logRight}>
          <Text style={styles.logTime}>{formatTime(item.scan_time)}</Text>
          {isCheckin && isLate ? (
            <View style={[styles.badge, styles.lateBadge]}>
              <Text style={styles.lateBadgeText}>LATE</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.validBadge]}>
              <Text style={styles.validBadgeText}>{item.status}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading presence logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statsCard}>
          <Ionicons name="people-outline" size={24} color="#10B981" />
          <Text style={styles.statsValue}>{stats.presentDays}</Text>
          <Text style={styles.statsLabel}>Days Present</Text>
        </View>
        <View style={styles.statsCard}>
          <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
          <Text style={[styles.statsValue, stats.lateDays > 0 ? styles.textRed : null]}>{stats.lateDays}</Text>
          <Text style={styles.statsLabel}>Days Late</Text>
        </View>
      </View>

      {/* Logs List */}
      <Text style={styles.sectionHeader}>Log List (Last 30 days)</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#475569" />
            <Text style={styles.emptyText}>No attendance logs recorded yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsValue: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statsLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  textRed: {
    color: '#EF4444',
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkinIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  checkoutIconBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  logTextContainer: {
    justifyContent: 'center',
  },
  logTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logDate: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  logMeta: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  logRight: {
    alignItems: 'flex-end',
  },
  logTime: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  validBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  validBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lateBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  lateBadgeText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
    marginTop: 12,
  },
});
