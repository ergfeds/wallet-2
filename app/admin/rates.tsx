import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react-native';
import { useExchangeRateStore } from '@/stores/exchange-rate-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';

export default function AdminRatesScreen() {
  const { rates, updateRate, resetToDefaults } = useExchangeRateStore();
  const [editingRates, setEditingRates] = useState<{[key: string]: string}>({});

  const handleUpdateRate = (currencyId: string) => {
    const newRate = parseFloat(editingRates[currencyId]);
    if (!isNaN(newRate) && newRate > 0) {
      updateRate(currencyId, newRate);
      setEditingRates(prev => ({ ...prev, [currencyId]: '' }));
      Alert.alert('Success', `${currencyId.toUpperCase()} rate updated to $${newRate.toLocaleString()}`);
    } else {
      Alert.alert('Error', 'Please enter a valid rate');
    }
  };

  const handleResetRates = () => {
    Alert.alert(
      'Reset Exchange Rates',
      'Reset all exchange rates to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            resetToDefaults();
            setEditingRates({});
            Alert.alert('Success', 'Exchange rates reset to defaults');
          },
        },
      ]
    );
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
      <Stack.Screen options={{ title: 'Exchange Rate Management' }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Exchange Rates</Text>
            <Text style={styles.subtitle}>Manage cryptocurrency exchange rates</Text>
          </View>

          <View style={styles.ratesGrid}>
            {SUPPORTED_CURRENCIES.map(currency => (
              <View key={currency.id} style={styles.rateCard}>
                <View style={styles.rateHeader}>
                  <View style={[styles.currencyIcon, { backgroundColor: getCurrencyColor(currency.id) + '20' }]}>
                    <Text style={[styles.currencyIconText, { color: getCurrencyColor(currency.id) }]}>
                      {currency.icon}
                    </Text>
                  </View>
                  <View style={styles.rateInfo}>
                    <Text style={styles.rateName}>{currency.name}</Text>
                    <Text style={styles.rateSymbol}>{currency.symbol}</Text>
                  </View>
                  <View style={styles.currentRateSection}>
                    <Text style={styles.currentRateLabel}>Current Rate</Text>
                    <Text style={styles.currentRate}>
                      ${rates[currency.id as keyof typeof rates].toLocaleString()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.rateActions}>
                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>New Rate (USD)</Text>
                    <Input
                      value={editingRates[currency.id] || ''}
                      onChangeText={(value) => setEditingRates(prev => ({ ...prev, [currency.id]: value }))}
                      placeholder="Enter new rate"
                      keyboardType="decimal-pad"
                      style={styles.rateInput}
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.updateButton, { backgroundColor: getCurrencyColor(currency.id) }]}
                    onPress={() => handleUpdateRate(currency.id)}
                  >
                    <DollarSign size={16} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.globalActions}>
            <Button
              title="Reset All to Defaults"
              onPress={handleResetRates}
              variant="secondary"
              style={styles.resetButton}
            />
          </View>

          <View style={styles.infoCard}>
            <TrendingUp size={24} color="#10B981" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Live Rate Management</Text>
              <Text style={styles.infoText}>
                Exchange rates are used to calculate USD values for transactions and portfolio balances. 
                Update rates regularly to reflect current market conditions.
              </Text>
            </View>
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
  ratesGrid: {
    gap: 16,
    marginBottom: 24,
  },
  rateCard: {
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
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  currencyIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  rateInfo: {
    flex: 1,
  },
  rateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rateSymbol: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  currentRateSection: {
    alignItems: 'flex-end',
  },
  currentRateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  currentRate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  rateActions: {
    gap: 16,
  },
  inputSection: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  rateInput: {
    marginBottom: 0,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    minHeight: Platform.OS === 'android' ? 44 : 40,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  globalActions: {
    marginBottom: 24,
  },
  resetButton: {
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#374151',
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
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});