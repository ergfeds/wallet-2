import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Currency } from '@/types/wallet';
import { useExchangeRateStore } from '@/stores/exchange-rate-store';

interface WalletCardProps {
  currency: Currency;
  balance: number;
  address: string;
  onSend: () => void;
  onReceive: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  currency,
  balance,
  address,
  onSend,
  onReceive,
}) => {
  const { getRate } = useExchangeRateStore();

  const formatBalance = (amount: number) => {
    return amount.toFixed(currency.decimals > 6 ? 6 : currency.decimals);
  };

  const getUSDValue = () => {
    const usdRate = getRate(currency.id);
    return (balance * usdRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getCurrencyColor = () => {
    switch (currency.id) {
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
        <View style={styles.currencyInfo}>
          <View style={[styles.iconContainer, { backgroundColor: getCurrencyColor() + '20' }]}>
            <Text style={[styles.icon, { color: getCurrencyColor() }]}>{currency.icon}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{currency.name}</Text>
            <Text style={styles.symbol}>{currency.symbol}</Text>
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
            {formatBalance(balance)}
          </Text>
          <Text style={styles.usdValue} numberOfLines={1} adjustsFontSizeToFit>
            ${getUSDValue()}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={onSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.receiveButton]} onPress={onReceive}>
          <Text style={styles.receiveText}>Receive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 20,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    fontWeight: '600',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  symbol: {
    fontSize: 14,
    color: '#6B7280',
  },
  balanceContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
    maxWidth: 120,
    flexShrink: 0,
  },
  balance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'right',
  },
  usdValue: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: Platform.OS === 'android' ? 44 : 40,
    justifyContent: 'center',
  },
  sendButton: {
    backgroundColor: '#6366F1',
  },
  receiveButton: {
    backgroundColor: '#F3F4F6',
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  receiveText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
});