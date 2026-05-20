import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function DashboardScreen() {
  const { user, userToken, logout } = useContext(AuthContext);
  const { theme, themeColors, isDarkMode, toggleTheme } = useContext(ThemeContext);
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
        }
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: themeColors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: themeColors.primaryDark }]}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EM'}
              </Text>
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>Welcome back,</Text>
              <Text style={[styles.nameText, { color: theme.text }]}>{user?.name || 'Employee'}</Text>
              <Text style={[styles.codeText, { color: themeColors.primary }]}>{user?.employee_code || 'EMP000'}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
              <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={22} color={theme.iconColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={24} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Today's Presence</Text>
          <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(new Date())}</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusCol}>
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Check In</Text>
              <Text style={[styles.statusTime, { color: theme.textSecondary }, todayStatus.checkin && { color: theme.text }]}>
                {todayStatus.checkin || '--:--'}
              </Text>
            </View>
            <View style={[styles.statusDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statusCol}>
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Check Out</Text>
              <Text style={[styles.statusTime, { color: theme.textSecondary }, todayStatus.checkout && { color: theme.text }]}>
                {todayStatus.checkout || '--:--'}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionBtn, 
                { backgroundColor: theme.successLight },
                todayStatus.checkin && { backgroundColor: theme.border, opacity: 0.5 }
              ]}
              onPress={() => navigation.navigate('Attendance', { actionType: 'checkin' })}
              disabled={!!todayStatus.checkin}
              activeOpacity={0.8}
            >
              <Ionicons name="enter-outline" size={20} color={todayStatus.checkin ? theme.textSecondary : theme.success} />
              <Text style={[styles.actionBtnText, { color: todayStatus.checkin ? theme.textSecondary : theme.success }]}>Check In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: themeColors.primaryLight },
                (!todayStatus.checkin || todayStatus.checkout) && { backgroundColor: theme.border, opacity: 0.5 }
              ]}
              onPress={() => navigation.navigate('Attendance', { actionType: 'checkout' })}
              disabled={!todayStatus.checkin || !!todayStatus.checkout}
              activeOpacity={0.8}
            >
              <Ionicons name="exit-outline" size={20} color={(!todayStatus.checkin || todayStatus.checkout) ? theme.textSecondary : themeColors.primaryDark} />
              <Text style={[styles.actionBtnText, { color: (!todayStatus.checkin || todayStatus.checkout) ? theme.textSecondary : themeColors.primaryDark }]}>Check Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shift Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="time-outline" size={20} color={themeColors.primary} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>Work Schedule</Text>
          </View>
          <Text style={[styles.infoBody, { color: themeColors.primaryDark }]}>Regular Shift (08:00 - 17:00)</Text>
          <Text style={[styles.infoSubtitle, { color: theme.textSecondary }]}>Wajib melakukan presensi wajah & GPS di sekitar area kantor.</Text>
        </View>

        {/* Quick Menu Grid */}
        <View style={styles.menuContainer}>
          <Text style={[styles.menuTitle, { color: theme.textSecondary }]}>Quick Actions</Text>
          <View style={styles.menuGrid}>
            <TouchableOpacity 
              style={[styles.menuItemCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }]}>
                <Ionicons name="calendar" size={22} color="#3B82F6" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItemCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => navigation.navigate('Request')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }]}>
                <Ionicons name="document-text" size={22} color="#8B5CF6" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Request</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItemCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => navigation.navigate('Payroll')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }]}>
                <Ionicons name="wallet" size={22} color="#10B981" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Payslip</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItemCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => navigation.navigate('RegisterFace')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: themeColors.primaryLight }]}>
                <Ionicons name="scan-circle" size={22} color={themeColors.primaryDark} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent History */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Logs</Text>
          
          {loading ? (
            <ActivityIndicator size="small" color={themeColors.primary} style={styles.loader} />
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No attendance logs found yet.</Text>
            </View>
          ) : (
            history.map((log) => (
              <View key={log.id} style={[styles.logItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.logHeader}>
                  <View style={[
                    styles.logIcon,
                    { backgroundColor: theme.background },
                    log.attendance_type === 'checkin' ? { borderColor: theme.successLight, borderWidth: 1 } : { borderColor: themeColors.primaryLight, borderWidth: 1 }
                  ]}>
                    <Ionicons
                      name={log.attendance_type === 'checkin' ? 'enter-outline' : 'exit-outline'}
                      size={18}
                      color={log.attendance_type === 'checkin' ? theme.success : themeColors.primaryDark}
                    />
                  </View>
                  <View>
                    <Text style={[styles.logType, { color: theme.text }]}>
                      {log.attendance_type === 'checkin' ? 'Check In' : 'Check Out'}
                    </Text>
                    <Text style={[styles.logDate, { color: theme.textSecondary }]}>{formatDate(log.scan_time)}</Text>
                  </View>
                </View>
                <View style={styles.logDetails}>
                  <Text style={[styles.logTimeText, { color: theme.text }]}>{formatTime(log.scan_time)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: log.status === 'Late' ? theme.dangerLight : theme.successLight }]}>
                    <Text style={[styles.badgeText, { color: log.status === 'Late' ? theme.danger : theme.success }]}>{log.status}</Text>
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
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    fontSize: 12,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileTextContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 13,
  },
  nameText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  codeText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  statusCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateText: {
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
    fontSize: 12,
    marginBottom: 6,
  },
  statusTime: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusDivider: {
    width: 1,
    height: 40,
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
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoBody: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  historySection: {
    width: '100%',
  },
  sectionTitle: {
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
    fontSize: 14,
    marginTop: 10,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  logDate: {
    fontSize: 11,
    marginTop: 2,
  },
  logDetails: {
    alignItems: 'flex-end',
  },
  logTimeText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
