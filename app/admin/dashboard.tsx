import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Clock, Users, MessageSquare, DollarSign, LogOut, TrendingUp } from 'lucide-react-native';
import { useAdminStore } from '@/stores/admin-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSupportStore } from '@/stores/support-store';
import { useWalletStore } from '@/stores/wallet-store';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardScreen() {
  const { pendingTransactions, clearAllData } = useAdminStore();
  const { logout } = useAuthStore();
  const { tickets } = useSupportStore();
  const { transactions } = useWalletStore();

  const handleLogout = () => {
    Alert.alert(
      'Admin Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Admin Data',
      'This will clear all pending transactions and admin data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Success', 'All admin data cleared');
          },
        },
      ]
    );
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Admin Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <LogOut size={20} color="#EF4444" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome, Admin</Text>
            <Text style={styles.welcomeSubtext}>Manage your crypto wallet platform</Text>
          </View>

          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/admin/transactions')}
            >
              <Clock size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{pendingTransactions.length}</Text>
              <Text style={styles.statLabel}>Pending Transactions</Text>
            </TouchableOpacity>
            
            <View style={styles.statCard}>
              <DollarSign size={24} color="#10B981" />
              <Text style={styles.statNumber}>{completedTransactions}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/admin/support')}
            >
              <MessageSquare size={24} color="#6366F1" />
              <Text style={styles.statNumber}>{openTickets}</Text>
              <Text style={styles.statLabel}>Open Tickets</Text>
            </TouchableOpacity>
            
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{totalTransactions}</Text>
              <Text style={styles.statLabel}>Total Transactions</Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/transactions')}
            >
              <View style={styles.actionIcon}>
                <DollarSign size={24} color="#F59E0B" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Manage Transactions</Text>
                <Text style={styles.actionSubtext}>Review and approve pending transactions</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/rates')}
            >
              <View style={styles.actionIcon}>
                <TrendingUp size={24} color="#10B981" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Exchange Rates</Text>
                <Text style={styles.actionSubtext}>Update cryptocurrency exchange rates</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/support')}
            >
              <View style={styles.actionIcon}>
                <MessageSquare size={24} color="#6366F1" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Support Tickets</Text>
                <Text style={styles.actionSubtext}>Respond to customer support requests</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.adminActions}>
            <Button
              title="Clear All Data"
              onPress={handleClearData}
              variant="danger"
              style={styles.actionButtonStyle}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 20,
  },
  headerButton: {
    padding: 8,
  },
  welcomeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
    }),
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  adminActions: {
    marginTop: 20,
    gap: 12,
  },
  actionButtonStyle: {
    marginBottom: 8,
  },
});