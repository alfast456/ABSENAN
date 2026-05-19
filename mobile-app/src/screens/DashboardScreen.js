import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export default function DashboardScreen() {
  const { user, userToken, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayStatus, setTodayStatus] = useState({ checkin: null, checkout: null });

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/history`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const logs = response.data.data || [];
      setHistory(logs);

      // Determine today's checkin/checkout status
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLogs = logs.filter(log => log.scan_time.startsWith(todayStr));
      
      const inLog = todayLogs.find(log => log.attendance_type === 'checkin');
      const outLog = todayLogs.find(log => log.attendance_type === 'checkout');

      setTodayStatus({
        checkin: inLog ? formatTime(inLog.scan_time) : null,
        checkout: outLog ? formatTime(outLog.scan_time) : null
      });
    } catch (error) {
      console.log('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAttendanceHistory();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceHistory();
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EM'}
              </Text>
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>{user?.name || 'Employee'}</Text>
              <Text style={styles.codeText}>{user?.employee_code || 'EMP000'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#F87171" />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Today's Presence</Text>
          <Text style={styles.dateText}>{formatDate(new Date())}</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusCol}>
              <Text style={styles.statusLabel}>Check In</Text>
              <Text style={[styles.statusTime, todayStatus.checkin ? styles.activeTime : null]}>
                {todayStatus.checkin || '--:--'}
              </Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusCol}>
              <Text style={styles.statusLabel}>Check Out</Text>
              <Text style={[styles.statusTime, todayStatus.checkout ? styles.activeTime : null]}>
                {todayStatus.checkout || '--:--'}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.checkinBtn, todayStatus.checkin ? styles.btnDisabled : null]}
              onPress={() => navigation.navigate('Attendance', { actionType: 'checkin' })}
              disabled={!!todayStatus.checkin}
              activeOpacity={0.8}
            >
              <Ionicons name="enter-outline" size={20} color="#0F172A" />
              <Text style={styles.actionBtnText}>Check In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.checkoutBtn,
                (!todayStatus.checkin || todayStatus.checkout) ? styles.btnDisabled : null
              ]}
              onPress={() => navigation.navigate('Attendance', { actionType: 'checkout' })}
              disabled={!todayStatus.checkin || !!todayStatus.checkout}
              activeOpacity={0.8}
            >
              <Ionicons name="exit-outline" size={20} color="#0F172A" />
              <Text style={styles.actionBtnText}>Check Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shift Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={styles.infoTitle}>Work Schedule</Text>
          </View>
          <Text style={styles.infoBody}>Regular Shift (08:00 - 17:00)</Text>
          <Text style={styles.infoSubtitle}>Wajib melakukan presensi wajah & GPS di sekitar area kantor.</Text>
        </View>

        {/* Quick Menu Grid */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Quick Actions</Text>
          <View style={styles.menuGrid}>
            <TouchableOpacity 
              style={styles.menuItemCard} 
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="calendar" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.menuItemText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItemCard} 
              onPress={() => navigation.navigate('Request')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="document-text" size={22} color="#8B5CF6" />
              </View>
              <Text style={styles.menuItemText}>Request</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItemCard} 
              onPress={() => navigation.navigate('Payroll')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="wallet" size={22} color="#10B981" />
              </View>
              <Text style={styles.menuItemText}>Payslip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          
          {loading ? (
            <ActivityIndicator size="small" color="#F59E0B" style={styles.loader} />
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={32} color="#475569" />
              <Text style={styles.emptyText}>No attendance logs found yet.</Text>
            </View>
          ) : (
            history.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <View style={[
                    styles.logIcon,
                    log.attendance_type === 'checkin' ? styles.inIcon : styles.outIcon
                  ]}>
                    <Ionicons
                      name={log.attendance_type === 'checkin' ? 'enter-outline' : 'exit-outline'}
                      size={18}
                      color={log.attendance_type === 'checkin' ? '#10B981' : '#F59E0B'}
                    />
                  </View>
                  <View>
                    <Text style={styles.logType}>
                      {log.attendance_type === 'checkin' ? 'Check In' : 'Check Out'}
                    </Text>
                    <Text style={styles.logDate}>{formatDate(log.scan_time)}</Text>
                  </View>
                </View>
                <View style={styles.logDetails}>
                  <Text style={styles.logTimeText}>{formatTime(log.scan_time)}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.badgeText}>{log.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItemCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuItemText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileTextContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    color: '#64748B',
    fontSize: 12,
  },
  nameText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  codeText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  statusCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  statusCol: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 6,
  },
  statusTime: {
    color: '#334155',
    fontSize: 24,
    fontWeight: 'bold',
  },
  activeTime: {
    color: '#F8FAFC',
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  checkinBtn: {
    backgroundColor: '#10B981', // Emerald 500
  },
  checkoutBtn: {
    backgroundColor: '#F59E0B', // Amber 500
  },
  btnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  actionBtnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoBody: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  historySection: {
    width: '100%',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
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
    fontSize: 14,
    marginTop: 10,
  },
  logItem: {
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
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inIcon: {
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
  },
  outIcon: {
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
  },
  logType: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logDate: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  logDetails: {
    alignItems: 'flex-end',
  },
  logTimeText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  badgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
