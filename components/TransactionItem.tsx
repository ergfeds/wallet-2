import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Transaction } from '@/types/wallet';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.id === transaction.currencyId);
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(currency?.decimals || 8);
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getCurrencyColor = () => {
    switch (currency?.id) {
      case 'btc': return '#F7931A';
      case 'eth': return '#627EEA';
      case 'usdt': return '#26A17B';
      case 'sol': return '#9945FF';
      default: return '#6366F1';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: getCurrencyColor() + '20' }]}>
            <Text style={[styles.icon, { color: getCurrencyColor() }]}>{currency?.icon}</Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.direction}>
              {transaction.isIncoming ? 'Received from' : 'Sent to'}
            </Text>
            <Text style={styles.address}>
              {formatAddress(transaction.isIncoming ? transaction.fromAddress : transaction.toAddress)}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: transaction.isIncoming ? '#10B981' : '#111827' }]}>
            {transaction.isIncoming ? '+' : '-'}{formatAmount(transaction.amount)} {currency?.symbol}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>
      
      {transaction.errorMessage && (
        <Text style={styles.error}>{transaction.errorMessage}</Text>
      )}
      
      <Text style={styles.timestamp}>
        {new Date(transaction.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionInfo: {
    flex: 1,
  },
  direction: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});