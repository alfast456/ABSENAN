import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function HistoryScreen() {
  const { userToken } = useContext(AuthContext);
  const { theme, themeColors } = useContext(ThemeContext);
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
      <View style={[styles.logCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.logLeft}>
          <View style={[styles.iconBg, isCheckin ? { backgroundColor: theme.successLight } : { backgroundColor: themeColors.primaryLight }]}>
            <Ionicons 
              name={isCheckin ? 'enter-outline' : 'exit-outline'} 
              size={20} 
              color={isCheckin ? theme.success : themeColors.primaryDark} 
            />
          </View>
          <View style={styles.logTextContainer}>
            <Text style={[styles.logTitle, { color: theme.text }]}>{isCheckin ? 'Check In' : 'Check Out'}</Text>
            <Text style={[styles.logDate, { color: theme.textSecondary }]}>{formatDate(item.scan_time)}</Text>
            {item.distance && (
              <Text style={[styles.logMeta, { color: theme.textSecondary }]}>Office distance: {Math.round(item.distance)}m</Text>
            )}
          </View>
        </View>
        <View style={styles.logRight}>
          <Text style={[styles.logTime, { color: theme.text }]}>{formatTime(item.scan_time)}</Text>
          {isCheckin && isLate ? (
            <View style={[styles.badge, { backgroundColor: theme.dangerLight }]}>
              <Text style={[styles.lateBadgeText, { color: theme.danger }]}>LATE</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: theme.successLight }]}>
              <Text style={[styles.validBadgeText, { color: theme.success }]}>{item.status}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading presence logs...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="people-outline" size={24} color={theme.success} />
          <Text style={[styles.statsValue, { color: theme.text }]}>{stats.presentDays}</Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Days Present</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="alert-circle-outline" size={24} color={theme.danger} />
          <Text style={[styles.statsValue, { color: theme.text }, stats.lateDays > 0 ? { color: theme.danger } : null]}>{stats.lateDays}</Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Days Late</Text>
        </View>
      </View>

      {/* Logs List */}
      <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Log List (Last 30 days)</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No attendance logs recorded yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
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
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statsLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sectionHeader: {
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
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logTextContainer: {
    justifyContent: 'center',
  },
  logTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  logDate: {
    fontSize: 12,
    marginTop: 2,
  },
  logMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  logRight: {
    alignItems: 'flex-end',
  },
  logTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  validBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lateBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
