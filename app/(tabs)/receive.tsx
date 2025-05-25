import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Copy, Share, QrCode, CheckCircle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useWalletStore } from '@/stores/wallet-store';
import { useExchangeRateStore } from '@/stores/exchange-rate-store';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';

export default function ReceiveScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState(SUPPORTED_CURRENCIES[0].id);
  const [copied, setCopied] = useState(false);
  const { getAddress, getBalance } = useWalletStore();
  const { getRate } = useExchangeRateStore();

  const selectedCurrencyData = SUPPORTED_CURRENCIES.find(c => c.id === selectedCurrency);
  const address = getAddress(selectedCurrency);
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

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const shareAddress = () => {
    Alert.alert('Share Address', `Share your ${selectedCurrencyData?.symbol} address:

${address}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Receive' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
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

          <View style={styles.addressSection}>
            <Text style={styles.addressTitle}>Your {selectedCurrencyData?.symbol} Address</Text>
            
            <View style={styles.qrSection}>
              <View style={[styles.qrPlaceholder, { borderColor: getCurrencyColor() }]}>
                <QrCode size={120} color={getCurrencyColor()} />
                <Text style={styles.qrLabel}>QR Code</Text>
              </View>
            </View>

            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabel}>Address</Text>
                {copied && (
                  <View style={styles.copiedIndicator}>
                    <CheckCircle size={16} color="#10B981" />
                    <Text style={styles.copiedText}>Copied!</Text>
                  </View>
                )}
              </View>
              <Text style={styles.address}>{address}</Text>
              <View style={styles.addressActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.copyButton]} 
                  onPress={copyToClipboard}
                >
                  <Copy size={20} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.shareButton]} 
                  onPress={shareAddress}
                >
                  <Share size={20} color={getCurrencyColor()} />
                  <Text style={[styles.shareButtonText, { color: getCurrencyColor() }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to receive {selectedCurrencyData?.symbol}</Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: getCurrencyColor() }]}>
                  <Text style={styles.stepText}>1</Text>
                </View>
                <Text style={styles.instructionText}>Share your address or QR code with the sender</Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: getCurrencyColor() }]}>
                  <Text style={styles.stepText}>2</Text>
                </View>
                <Text style={styles.instructionText}>Sender initiates the transaction</Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: getCurrencyColor() }]}>
                  <Text style={styles.stepText}>3</Text>
                </View>
                <Text style={styles.instructionText}>Funds appear instantly in your wallet</Text>
              </View>
            </View>
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityTitle}>Security Note</Text>
            <Text style={styles.securityText}>
              Only send {selectedCurrencyData?.symbol} to this address. Sending other currencies may result in permanent loss of funds.
            </Text>
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
  addressSection: {
    marginBottom: 32,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  qrLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  copiedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  address: {
    fontSize: 16,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  copyButton: {
    backgroundColor: '#111827',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
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
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  securityNote: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});