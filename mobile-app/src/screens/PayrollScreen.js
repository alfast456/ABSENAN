import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export default function PayrollScreen() {
  const { userToken } = useContext(AuthContext);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchPayrolls = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setPayrolls(response.data.data || []);
    } catch (error) {
      console.log('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayrolls();
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const formatCurrency = (amount) => {
    return 'Rp ' + parseFloat(amount).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatMonth = (monthStr) => {
    // monthStr: YYYY-MM
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const renderPayrollItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const isPaid = item.payment_status === 'paid';

    return (
      <View style={styles.payrollCard}>
        {/* Card Header (Tap to expand) */}
        <TouchableOpacity 
          style={styles.cardHeader} 
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.statusIconBg, isPaid ? styles.paidIconBg : styles.pendingIconBg]}>
              <Ionicons 
                name={isPaid ? 'checkmark-circle' : 'time'} 
                size={22} 
                color={isPaid ? '#10B981' : '#F59E0B'} 
              />
            </View>
            <View>
              <Text style={styles.monthText}>{formatMonth(item.month)}</Text>
              <Text style={styles.netSalaryText}>{formatCurrency(item.net_salary)}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.pendingBadge]}>
              <Text style={[styles.statusBadgeText, isPaid ? styles.paidText : styles.pendingText]}>
                {item.payment_status.toUpperCase()}
              </Text>
            </View>
            <Ionicons 
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} 
              size={18} 
              color="#94A3B8" 
              style={styles.chevron}
            />
          </View>
        </TouchableOpacity>

        {/* Card Body (Breakdown) */}
        {isExpanded && (
          <View style={styles.cardBody}>
            <View style={styles.divider} />
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Gaji Pokok (Base Salary)</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(item.base_salary)}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, styles.greenText]}>Lembur (Overtime Pay) (+)</Text>
              <Text style={[styles.breakdownValue, styles.greenText]}>{formatCurrency(item.overtime_pay)}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, styles.redText]}>Potongan Terlambat (Late Deduction) (-)</Text>
              <Text style={[styles.breakdownValue, styles.redText]}>{formatCurrency(item.late_deduction)}</Text>
            </View>

            <View style={styles.boldDivider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.boldLabel}>Total Gaji Bersih (Net Salary)</Text>
              <Text style={styles.boldValue}>{formatCurrency(item.net_salary)}</Text>
            </View>
            
            <Text style={styles.calculationDate}>Calculated on: {new Date(item.calculated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading payslips...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={payrolls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPayrollItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color="#475569" />
            <Text style={styles.emptyText}>No payslips calculated yet for this account.</Text>
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
  listContent: {
    paddingBottom: 20,
  },
  payrollCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paidIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pendingIconBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  monthText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  netSalaryText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  paidText: {
    color: '#10B981',
  },
  pendingText: {
    color: '#F59E0B',
  },
  chevron: {
    marginLeft: 4,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 12,
  },
  boldDivider: {
    height: 1,
    backgroundColor: '#475569',
    marginVertical: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  breakdownLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  breakdownValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  greenText: {
    color: '#10B981',
  },
  redText: {
    color: '#EF4444',
  },
  boldLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
  },
  boldValue: {
    color: '#F59E0B', // Golden Yellow
    fontSize: 15,
    fontWeight: 'bold',
  },
  calculationDate: {
    color: '#475569',
    fontSize: 10,
    marginTop: 12,
    textAlign: 'right',
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
