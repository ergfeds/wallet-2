import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { ArrowRight, Zap, AlertTriangle } from 'lucide-react-native';
import { useWalletStore } from '@/stores/wallet-store';
import { useAuthStore } from '@/stores/auth-store';
import { useExchangeRateStore } from '@/stores/exchange-rate-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';

export default function SendScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState(SUPPORTED_CURRENCIES[0].id);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { sendTransaction, getBalance, getAddress } = useWalletStore();
  const { user } = useAuthStore();
  const { getRate } = useExchangeRateStore();

  const selectedCurrencyData = SUPPORTED_CURRENCIES.find(c => c.id === selectedCurrency);
  const balance = getBalance(selectedCurrency);
  const usdRate = getRate(selectedCurrency);

  const getCurrencyColor = () => {
    switch (selectedCurrency) {
      case 'btc': return '#F7931A';
      case 'eth': return '#627EEA';
      case 'usdt': return '#26A17B';
      case 'sol': return '#9945FF';
      default: return '#6366F1';
    }
  };

  const handleMaxAmount = () => {
    setAmount(balance.toString());
  };

  const getRemainingLimits = () => {
    if (!user) return { daily: 0, monthly: 0 };
    return {
      daily: user.dailyLimit - user.dailySpent,
      monthly: user.monthlyLimit - user.monthlySpent,
    };
  };

  const handleSend = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!toAddress.trim()) {
      Alert.alert('Invalid Address', 'Please enter a recipient address');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (numAmount > balance) {
      Alert.alert('Insufficient Balance', 'You do not have enough funds for this transaction');
      return;
    }

    const usdValue = numAmount * usdRate;
    const remaining = getRemainingLimits();

    if (usdValue > remaining.daily || usdValue > remaining.monthly) {
      Alert.alert(
        'Limit Exceeded', 
        `This transaction exceeds your ${usdValue > remaining.daily ? 'daily' : 'monthly'} limit. Please complete KYC verification to increase your limits.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify KYC', onPress: () => router.push('/(tabs)/profile') },
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      const txId = await sendTransaction(toAddress.trim(), selectedCurrency, numAmount, user.id);
      
      // Show success immediately
      setIsLoading(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setToAddress('');
        setAmount('');
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Transaction Failed', error instanceof Error ? error.message : 'Please try again');
    }
  };

  if (showSuccess) {
    return (
      <>
        <Stack.Screen options={{ title: 'Send' }} />
        <View style={styles.successContainer}>
          <View style={styles.successContent}>
            <View style={[styles.successIcon, { backgroundColor: getCurrencyColor() + '20' }]}>
              <Zap size={48} color={getCurrencyColor()} />
            </View>
            <Text style={styles.successTitle}>Transaction Sent!</Text>
            <Text style={styles.successMessage}>
              {amount} {selectedCurrencyData?.symbol} sent successfully
            </Text>
            <View style={styles.successDetails}>
              <Text style={styles.successDetailLabel}>To:</Text>
              <Text style={styles.successDetailValue}>
                {toAddress.slice(0, 8)}...{toAddress.slice(-8)}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  }

  const remaining = getRemainingLimits();

  return (
    <>
      <Stack.Screen options={{ title: 'Send' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {user && user.kyc.level === 'none' && (
            <View style={styles.kycWarning}>
              <AlertTriangle size={20} color="#F59E0B" />
              <View style={styles.kycWarningText}>
                <Text style={styles.kycWarningTitle}>Limited Account</Text>
                <Text style={styles.kycWarningSubtext}>
                  Complete KYC verification to increase your limits
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.kycButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={styles.kycButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.limitsCard}>
            <Text style={styles.limitsTitle}>Spending Limits</Text>
            <View style={styles.limitsGrid}>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Daily Remaining</Text>
                <Text style={styles.limitValue}>${remaining.daily.toLocaleString()}</Text>
              </View>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Monthly Remaining</Text>
                <Text style={styles.limitValue}>${remaining.monthly.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.kycLevel}>KYC Level: {user?.kyc.level.toUpperCase()}</Text>
          </View>

          <View style={styles.currencySelector}>
            <Text style={styles.sectionTitle}>Select Currency</Text>
            <View style={styles.selectedCurrency}>
              <View style={[styles.currencyIcon, { backgroundColor: getCurrencyColor() + '20' }]}>
                <Text style={[styles.currencyIconText, { color: getCurrencyColor() }]}>
                  {selectedCurrencyData?.icon}
                </Text>
              </View>
              <View style={styles.currencyDetails}>
                <Text style={styles.currencyName}>{selectedCurrencyData?.name}</Text>
                <Text style={styles.currencyBalance}>
                  {balance.toFixed(selectedCurrencyData?.decimals || 8)} {selectedCurrencyData?.symbol}
                </Text>
              </View>
              <View style={styles.usdValue}>
                <Text style={styles.usdText}>
                  ${(balance * usdRate).toLocaleString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedCurrency}
                onValueChange={setSelectedCurrency}
                style={styles.picker}
              >
                {SUPPORTED_CURRENCIES.map(currency => (
                  <Picker.Item
                    key={currency.id}
                    label={`${currency.name} (${currency.symbol})`}
                    value={currency.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.transactionForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipient Address</Text>
              <Input
                value={toAddress}
                onChangeText={setToAddress}
                placeholder="Enter wallet address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.addressInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.amountHeader}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TouchableOpacity onPress={handleMaxAmount} style={styles.maxButton}>
                  <Text style={styles.maxButtonText}>MAX</Text>
                </TouchableOpacity>
              </View>
              <Input
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={styles.amountInput}
              />
              {amount && (
                <Text style={styles.usdEquivalent}>
                  ≈ ${(parseFloat(amount || '0') * usdRate).toLocaleString()}
                </Text>
              )}
            </View>

            <View style={styles.transactionSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Network Fee</Text>
                <Text style={styles.summaryValue}>Free</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Processing Time</Text>
                <Text style={styles.summaryValue}>Instant</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {amount || '0'} {selectedCurrencyData?.symbol}
                </Text>
              </View>
            </View>

            <Button
              title={isLoading ? 'Processing...' : `Send ${selectedCurrencyData?.symbol}`}
              onPress={handleSend}
              disabled={isLoading || !toAddress.trim() || !amount.trim()}
              style={[styles.sendButton, { backgroundColor: getCurrencyColor() }]}
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
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 20,
  },
  kycWarning: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  kycWarningText: {
    flex: 1,
    marginLeft: 12,
  },
  kycWarningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  kycWarningSubtext: {
    fontSize: 12,
    color: '#92400E',
  },
  kycButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  kycButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  limitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  limitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  limitsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  limitItem: {
    flex: 1,
  },
  limitLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  kycLevel: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  currencySelector: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  selectedCurrency: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  currencyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  currencyIconText: {
    fontSize: 28,
    fontWeight: '700',
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  currencyBalance: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  usdValue: {
    alignItems: 'flex-end',
  },
  usdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  picker: {
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'android' ? 50 : undefined,
  },
  transactionForm: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addressInput: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maxButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
  },
  usdEquivalent: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  transactionSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sendButton: {
    marginTop: 8,
    paddingVertical: 16,
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
    }),
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successDetails: {
    alignItems: 'center',
    gap: 4,
  },
  successDetailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  successDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
});