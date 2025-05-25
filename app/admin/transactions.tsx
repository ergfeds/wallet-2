import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useAdminStore } from '@/stores/admin-store';
import { useExchangeRateStore } from '@/stores/exchange-rate-store';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';

export default function AdminTransactionsScreen() {
  const { pendingTransactions, approveTransaction, rejectTransaction } = useAdminStore();
  const { getRate } = useExchangeRateStore();

  const handleApprove = (txId: string) => {
    Alert.alert(
      'Approve Transaction',
      'Are you sure you want to approve this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            approveTransaction(txId);
            Alert.alert('Success', 'Transaction approved and processed');
          },
        },
      ]
    );
  };

  const handleReject = (txId: string) => {
    Alert.alert(
      'Reject Transaction',
      'Select rejection reason:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Network Error',
          onPress: () => {
            rejectTransaction(txId, 'Network congestion - please try again later');
            Alert.alert('Success', 'Transaction rejected - funds refunded');
          },
        },
        {
          text: 'Invalid Address',
          onPress: () => {
            rejectTransaction(txId, 'Invalid recipient address format');
            Alert.alert('Success', 'Transaction rejected - funds refunded');
          },
        },
        {
          text: 'Insufficient Gas',
          onPress: () => {
            rejectTransaction(txId, 'Insufficient gas fees for transaction');
            Alert.alert('Success', 'Transaction rejected - funds refunded');
          },
        },
      ]
    );
  };

  const getCurrencyData = (currencyId: string) => {
    return SUPPORTED_CURRENCIES.find(c => c.id === currencyId);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
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
      <Stack.Screen options={{ title: 'Transaction Management' }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Pending Transactions</Text>
            <Text style={styles.subtitle}>Review and approve user transactions</Text>
          </View>

          {pendingTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {pendingTransactions.map(transaction => {
                const currency = getCurrencyData(transaction.currencyId);
                const usdValue = transaction.amount * getRate(transaction.currencyId);
                
                return (
                  <View key={transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                      <View style={styles.transactionInfo}>
                        <View style={styles.amountSection}>
                          <Text style={styles.transactionAmount}>
                            {transaction.amount.toFixed(currency?.decimals || 8)} {currency?.symbol}
                          </Text>
                          <Text style={styles.usdAmount}>
                            ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                        <View style={styles.addressSection}>
                          <Text style={styles.addressLabel}>From:</Text>
                          <Text style={styles.transactionDetails}>
                            {formatAddress(transaction.fromAddress)}
                          </Text>
                          <Text style={styles.addressLabel}>To:</Text>
                          <Text style={styles.transactionDetails}>
                            {formatAddress(transaction.toAddress)}
                          </Text>
                        </View>
                        <Text style={styles.transactionTime}>
                          {new Date(transaction.timestamp).toLocaleString()}
                        </Text>
                        {transaction.fromUserId && (
                          <Text style={styles.userId}>User ID: {transaction.fromUserId}</Text>
                        )}
                      </View>
                      <View style={[styles.currencyIcon, { backgroundColor: getCurrencyColor(transaction.currencyId) + '20' }]}>
                        <Text style={[styles.currencyIconText, { color: getCurrencyColor(transaction.currencyId) }]}>
                          {currency?.icon}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.transactionActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(transaction.id)}
                      >
                        <CheckCircle size={16} color="#FFFFFF" />
                        <Text style={styles.approveText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(transaction.id)}
                      >
                        <XCircle size={16} color="#FFFFFF" />
                        <Text style={styles.rejectText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Clock size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No pending transactions</Text>
              <Text style={styles.emptySubtext}>All transactions have been processed</Text>
            </View>
          )}
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
  transactionsList: {
    gap: 16,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  amountSection: {
    marginBottom: 12,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  usdAmount: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  addressSection: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 2,
  },
  transactionDetails: {
    fontSize: 12,
    color: '#E5E7EB',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  userId: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  currencyIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    minHeight: Platform.OS === 'android' ? 44 : 40,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectText: {
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