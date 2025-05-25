import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Plus, Shield } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { useWalletStore } from '@/stores/wallet-store';
import { useExchangeRateStore } from '@/stores/exchange-rate-store';
import { WalletCard } from '@/components/WalletCard';
import { TransactionItem } from '@/components/TransactionItem';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { 
    addresses, 
    transactions, 
    initializeWallet, 
    getBalance, 
    getAddress 
  } = useWalletStore();
  const { getRate } = useExchangeRateStore();

  useEffect(() => {
    if (user?.id) {
      initializeWallet(user.id);
    }
  }, [user?.id]);

  // Add null check for user
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const recentTransactions = transactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  const totalPortfolioValue = addresses.reduce((total, addr) => {
    const usdRate = getRate(addr.currencyId);
    return total + (addr.balance * usdRate);
  }, 0);

  const portfolioChange = 2.4; // Mock percentage change

  const handleSend = () => {
    router.push('/(tabs)/send');
  };

  const handleReceive = () => {
    router.push('/(tabs)/receive');
  };

  const handleBuy = () => {
    // Mock buy functionality
    console.log('Buy crypto');
  };

  const getKYCStatusColor = () => {
    if (!user?.kyc?.level) return '#6B7280';
    switch (user.kyc.level) {
      case 'none': return '#EF4444';
      case 'basic': return '#F59E0B';
      case 'verified': return '#10B981';
      case 'premium': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getUserDisplayName = () => {
    if (user?.kyc?.firstName) {
      return user.kyc.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Portfolio' }} />
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Good morning</Text>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
          </View>

          {user && user.kyc?.level === 'none' && (
            <TouchableOpacity 
              style={styles.kycBanner}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Shield size={20} color="#F59E0B" />
              <View style={styles.kycBannerText}>
                <Text style={styles.kycBannerTitle}>Complete KYC Verification</Text>
                <Text style={styles.kycBannerSubtext}>Increase your transaction limits</Text>
              </View>
              <ArrowUpRight size={16} color="#F59E0B" />
            </TouchableOpacity>
          )}
          
          <View style={styles.portfolioCard}>
            <View style={styles.portfolioHeader}>
              <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
              <TrendingUp size={20} color="#10B981" />
            </View>
            <Text style={styles.portfolioValue}>
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.portfolioChange}>
              <ArrowUpRight size={16} color="#10B981" />
              <Text style={styles.portfolioChangeText}>+{portfolioChange}% today</Text>
            </View>
            
            {user && user.kyc && (
              <View style={styles.kycStatus}>
                <View style={[styles.kycDot, { backgroundColor: getKYCStatusColor() }]} />
                <Text style={styles.kycText}>KYC: {(user.kyc.level || 'none').toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleSend}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#6366F1' }]}>
              <ArrowUpRight size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleReceive}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
              <ArrowDownLeft size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionText}>Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleBuy}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' }]}>
              <Plus size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionText}>Buy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Assets</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.assetsGrid}>
            {SUPPORTED_CURRENCIES.map(currency => (
              <WalletCard
                key={currency.id}
                currency={currency}
                balance={getBalance(currency.id)}
                address={getAddress(currency.id)}
                onSend={handleSend}
                onReceive={handleReceive}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <ArrowUpRight size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Start by sending or receiving crypto
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    paddingBottom: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 20,
  },
  greeting: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'capitalize',
  },
  kycBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  kycBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  kycBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  kycBannerSubtext: {
    fontSize: 12,
    color: '#92400E',
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
    }),
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  portfolioChangeText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  kycStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kycDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  kycText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  assetsGrid: {
    gap: 16,
  },
  transactionsList: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
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
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});