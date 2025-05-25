import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletAddress, Transaction } from '@/types/wallet';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';
import { generateWalletAddress, generateTransactionId } from '@/utils/address-generator';
import { useAuthStore } from './auth-store';
import { useExchangeRateStore } from './exchange-rate-store';

interface WalletState {
  addresses: WalletAddress[];
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  initializeWallet: (userId: string) => void;
  sendTransaction: (toAddress: string, currencyId: string, amount: number, fromUserId: string) => Promise<string>;
  getBalance: (currencyId: string) => number;
  getAddress: (currencyId: string) => string;
  addTransaction: (transaction: Transaction) => void;
  updateTransactionStatus: (txId: string, status: 'completed' | 'rejected', errorMessage?: string) => void;
  adjustBalance: (currencyId: string, amount: number) => void;
  reset: () => void;
  processIncomingTransaction: (fromAddress: string, toAddress: string, currencyId: string, amount: number) => void;
  checkSpendingLimit: (amount: number, userId: string) => boolean;
  updateSpentAmount: (amount: number, userId: string) => void;
  setUserBalance: (userId: string, currencyId: string, newBalance: number) => void;
  getUserBalances: (userId: string) => WalletAddress[];
}

const initialState = {
  addresses: [],
  transactions: [],
  pendingTransactions: [],
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeWallet: (userId: string) => {
        const { addresses } = get();
        if (addresses.length > 0) return; // Already initialized

        const newAddresses: WalletAddress[] = SUPPORTED_CURRENCIES.map(currency => ({
          currencyId: currency.id,
          address: generateWalletAddress(currency.id),
          balance: 0, // Start with 0 balance
        }));

        set({ addresses: newAddresses });
      },

      checkSpendingLimit: (amount: number, userId: string) => {
        try {
          const { user, resetSpendingLimits } = useAuthStore.getState();
          
          if (!user || user.id !== userId) return false;
          
          // Reset limits if needed
          resetSpendingLimits();
          
          const updatedUser = useAuthStore.getState().user;
          if (!updatedUser) return false;
          
          // Check daily and monthly limits
          const newDailySpent = updatedUser.dailySpent + amount;
          const newMonthlySpent = updatedUser.monthlySpent + amount;
          
          return newDailySpent <= updatedUser.dailyLimit && newMonthlySpent <= updatedUser.monthlyLimit;
        } catch (error) {
          return false;
        }
      },

      updateSpentAmount: (amount: number, userId: string) => {
        try {
          const { user, setUser } = useAuthStore.getState();
          
          if (user && user.id === userId) {
            const updatedUser = {
              ...user,
              dailySpent: user.dailySpent + amount,
              monthlySpent: user.monthlySpent + amount,
            };
            setUser(updatedUser);
          }
        } catch (error) {
          console.log('Error updating spent amount:', error);
        }
      },

      sendTransaction: async (toAddress: string, currencyId: string, amount: number, fromUserId: string) => {
        const { addresses, pendingTransactions, transactions, checkSpendingLimit, updateSpentAmount } = get();
        const fromAddress = addresses.find(addr => addr.currencyId === currencyId);
        
        if (!fromAddress || fromAddress.balance < amount) {
          throw new Error('Insufficient balance');
        }

        // Get USD value for limit checking
        const { getRate } = useExchangeRateStore.getState();
        const usdValue = amount * getRate(currencyId);

        // Check spending limits
        const canSpend = checkSpendingLimit(usdValue, fromUserId);
        if (!canSpend) {
          throw new Error('Transaction exceeds your daily or monthly limit. Please complete KYC verification to increase limits.');
        }

        // Deduct balance immediately
        const updatedAddresses = addresses.map(addr => 
          addr.currencyId === currencyId 
            ? { ...addr, balance: addr.balance - amount }
            : addr
        );

        const transaction: Transaction = {
          id: generateTransactionId(),
          fromAddress: fromAddress.address,
          toAddress,
          currencyId,
          amount,
          status: 'pending',
          timestamp: Date.now(),
          isIncoming: false,
          fromUserId,
        };

        // Update spent amount
        updateSpentAmount(usdValue, fromUserId);

        set({ 
          addresses: updatedAddresses,
          pendingTransactions: [...pendingTransactions, transaction],
          transactions: [...transactions, transaction],
        });

        // Add to admin queue
        try {
          const { useAdminStore } = require('./admin-store');
          useAdminStore.getState().addPendingTransaction(transaction);
        } catch (error) {
          console.log('Admin store not available');
        }

        return transaction.id;
      },

      processIncomingTransaction: (fromAddress: string, toAddress: string, currencyId: string, amount: number) => {
        const { addresses, transactions } = get();
        const recipientAddress = addresses.find(addr => addr.address === toAddress && addr.currencyId === currencyId);
        
        if (recipientAddress) {
          // Add balance to recipient
          const updatedAddresses = addresses.map(addr => 
            addr.address === toAddress && addr.currencyId === currencyId
              ? { ...addr, balance: addr.balance + amount }
              : addr
          );

          const incomingTransaction: Transaction = {
            id: generateTransactionId(),
            fromAddress,
            toAddress,
            currencyId,
            amount,
            status: 'completed',
            timestamp: Date.now(),
            isIncoming: true,
          };

          set({ 
            addresses: updatedAddresses,
            transactions: [...transactions, incomingTransaction],
          });
        }
      },

      getBalance: (currencyId: string) => {
        const { addresses } = get();
        const address = addresses.find(addr => addr.currencyId === currencyId);
        return address?.balance || 0;
      },

      getAddress: (currencyId: string) => {
        const { addresses } = get();
        const address = addresses.find(addr => addr.currencyId === currencyId);
        return address?.address || '';
      },

      addTransaction: (transaction: Transaction) => {
        const { transactions } = get();
        set({ transactions: [...transactions, transaction] });
      },

      updateTransactionStatus: (txId: string, status: 'completed' | 'rejected', errorMessage?: string) => {
        const { transactions, pendingTransactions, addresses } = get();
        
        const transaction = transactions.find(tx => tx.id === txId);
        if (!transaction) return;

        const updatedTransactions = transactions.map(tx => 
          tx.id === txId 
            ? { ...tx, status, errorMessage }
            : tx
        );

        const updatedPendingTransactions = pendingTransactions.filter(tx => tx.id !== txId);

        let updatedAddresses = addresses;

        if (status === 'completed' && !transaction.isIncoming) {
          // Process the transaction - add balance to recipient if they exist in our system
          const recipientAddress = addresses.find(addr => addr.address === transaction.toAddress && addr.currencyId === transaction.currencyId);
          if (recipientAddress) {
            updatedAddresses = addresses.map(addr => 
              addr.address === transaction.toAddress && addr.currencyId === transaction.currencyId
                ? { ...addr, balance: addr.balance + transaction.amount }
                : addr
            );

            // Create incoming transaction for recipient
            const incomingTransaction: Transaction = {
              id: generateTransactionId(),
              fromAddress: transaction.fromAddress,
              toAddress: transaction.toAddress,
              currencyId: transaction.currencyId,
              amount: transaction.amount,
              status: 'completed',
              timestamp: Date.now(),
              isIncoming: true,
              toUserId: transaction.toUserId,
            };

            updatedTransactions.push(incomingTransaction);
          }
        } else if (status === 'rejected' && !transaction.isIncoming) {
          // Refund the amount to sender
          updatedAddresses = addresses.map(addr => 
            addr.currencyId === transaction.currencyId && addr.address === transaction.fromAddress
              ? { ...addr, balance: addr.balance + transaction.amount }
              : addr
          );

          // Refund spent amount
          if (transaction.fromUserId) {
            const { getRate } = useExchangeRateStore.getState();
            const usdValue = transaction.amount * getRate(transaction.currencyId);
            get().updateSpentAmount(-usdValue, transaction.fromUserId);
          }
        }

        set({ 
          transactions: updatedTransactions,
          pendingTransactions: updatedPendingTransactions,
          addresses: updatedAddresses,
        });
      },

      adjustBalance: (currencyId: string, amount: number) => {
        const { addresses } = get();
        const updatedAddresses = addresses.map(addr => 
          addr.currencyId === currencyId 
            ? { ...addr, balance: Math.max(0, addr.balance + amount) }
            : addr
        );
        set({ addresses: updatedAddresses });
      },

      setUserBalance: (userId: string, currencyId: string, newBalance: number) => {
        // This function is for admin use to set user balances
        // In a real app, this would update the specific user's balance in the database
        const { addresses } = get();
        const updatedAddresses = addresses.map(addr => 
          addr.currencyId === currencyId 
            ? { ...addr, balance: Math.max(0, newBalance) }
            : addr
        );
        set({ addresses: updatedAddresses });
      },

      getUserBalances: (userId: string) => {
        // This function returns balances for a specific user
        // In a real app, this would fetch from database
        const { addresses } = get();
        return addresses;
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);