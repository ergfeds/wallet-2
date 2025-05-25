import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Users, Plus, Minus, DollarSign } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/wallet';
import { useWalletStore } from '@/stores/wallet-store';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('btc');
  const { setUserBalance, getUserBalances } = useWalletStore();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await AsyncStorage.getItem('all-users');
      if (usersData) {
        const parsedUsers = JSON.parse(usersData);
        setUsers(parsedUsers.filter((user: User) => user.id !== 'admin_user'));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddBalance = () => {
    if (!selectedUser || !balanceAmount.trim()) {
      Alert.alert('Error', 'Please select a user and enter an amount');
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    Alert.alert(
      'Add Balance',
      `Add ${amount} ${selectedCurrency.toUpperCase()} to ${selectedUser.kyc.firstName} ${selectedUser.kyc.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            // In a real app, this would update the specific user's balance in the database
            Alert.alert('Success', `Added ${amount} ${selectedCurrency.toUpperCase()} to user's account`);
            setBalanceAmount('');
            setSelectedUser(null);
          },
        },
      ]
    );
  };

  const handleSubtractBalance = () => {
    if (!selectedUser || !balanceAmount.trim()) {
      Alert.alert('Error', 'Please select a user and enter an amount');
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    Alert.alert(
      'Subtract Balance',
      `Subtract ${amount} ${selectedCurrency.toUpperCase()} from ${selectedUser.kyc.firstName} ${selectedUser.kyc.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subtract',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would update the specific user's balance in the database
            Alert.alert('Success', `Subtracted ${amount} ${selectedCurrency.toUpperCase()} from user's account`);
            setBalanceAmount('');
            setSelectedUser(null);
          },
        },
      ]
    );
  };

  const getKYCStatusColor = (level: string) => {
    switch (level) {
      case 'none': return '#EF4444';
      case 'basic': return '#F59E0B';
      case 'verified': return '#10B981';
      case 'premium': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getCurrencyColor = (currencyId: string) => {
    switch (currencyId) {
      case 'btc': return '#F7931A';
      case 'eth': return '#627EEA';
      case 'usdt': return '#26A17B';
      case 'sol': return '#9945FF';
      default: return '#6366F1';
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'User Management' }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>Manage user accounts and balances</Text>
          </View>

          <View style={styles.statsCard}>
            <Users size={24} color="#10B981" />
            <View style={styles.statsContent}>
              <Text style={styles.statsNumber}>{users.length}</Text>
              <Text style={styles.statsLabel}>Total Users</Text>
            </View>
          </View>

          {selectedUser && (
            <View style={styles.balanceManagement}>
              <Text style={styles.balanceTitle}>
                Manage Balance: {selectedUser.kyc.firstName} {selectedUser.kyc.lastName}
              </Text>
              
              <View style={styles.currencySelector}>
                <Text style={styles.inputLabel}>Currency</Text>
                <View style={styles.currencyGrid}>
                  {SUPPORTED_CURRENCIES.map(currency => (
                    <TouchableOpacity
                      key={currency.id}
                      style={[
                        styles.currencyOption,
                        selectedCurrency === currency.id && styles.currencyOptionSelected,
                        { borderColor: getCurrencyColor(currency.id) }
                      ]}
                      onPress={() => setSelectedCurrency(currency.id)}
                    >
                      <Text style={[
                        styles.currencyIcon,
                        { color: getCurrencyColor(currency.id) }
                      ]}>
                        {currency.icon}
                      </Text>
                      <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Amount"
                value={balanceAmount}
                onChangeText={setBalanceAmount}
                placeholder="Enter amount"
                keyboardType="decimal-pad"
              />

              <View style={styles.balanceActions}>
                <Button
                  title="Add Balance"
                  onPress={handleAddBalance}
                  style={[styles.balanceButton, { backgroundColor: '#10B981' }]}
                />
                <Button
                  title="Subtract Balance"
                  onPress={handleSubtractBalance}
                  variant="danger"
                  style={styles.balanceButton}
                />
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedUser(null);
                  setBalanceAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.usersList}>
            <Text style={styles.usersTitle}>All Users</Text>
            {users.length > 0 ? (
              users.map(user => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {user.kyc.firstName} {user.kyc.lastName}
                      </Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      <Text style={styles.userId}>ID: {user.id}</Text>
                    </View>
                    <View style={styles.userStatus}>
                      <View style={[
                        styles.kycBadge,
                        { backgroundColor: getKYCStatusColor(user.kyc.level) + '20' }
                      ]}>
                        <Text style={[
                          styles.kycBadgeText,
                          { color: getKYCStatusColor(user.kyc.level) }
                        ]}>
                          {user.kyc.level.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.userLimits}>
                    <Text style={styles.limitsLabel}>Spending Limits</Text>
                    <View style={styles.limitsRow}>
                      <Text style={styles.limitText}>
                        Daily: ${user.dailySpent.toLocaleString()} / ${user.dailyLimit.toLocaleString()}
                      </Text>
                      <Text style={styles.limitText}>
                        Monthly: ${user.monthlySpent.toLocaleString()} / ${user.monthlyLimit.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.manageButton}
                    onPress={() => setSelectedUser(user)}
                  >
                    <DollarSign size={16} color="#FFFFFF" />
                    <Text style={styles.manageButtonText}>Manage Balance</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Users size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptySubtext}>Users will appear here when they register</Text>
              </View>
            )}
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statsCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  statsContent: {
    marginLeft: 16,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  balanceManagement: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#6366F1',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
    }),
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  currencySelector: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
    marginBottom: 12,
  },
  currencyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyOption: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currencyOptionSelected: {
    backgroundColor: '#1F2937',
  },
  currencyIcon: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  balanceButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 14,
  },
  usersList: {
    gap: 16,
  },
  usersTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  kycBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kycBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userLimits: {
    marginBottom: 16,
  },
  limitsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  limitsRow: {
    gap: 4,
  },
  limitText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  manageButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 40,
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});