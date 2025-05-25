import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, SupportTicket } from '@/types/wallet';
import { useWalletStore } from './wallet-store';

interface AdminState {
  pendingTransactions: Transaction[];
  supportTickets: SupportTicket[];
  approveTransaction: (txId: string) => void;
  rejectTransaction: (txId: string, reason: string) => void;
  addSupportTicket: (ticket: SupportTicket) => void;
  replyToTicket: (ticketId: string, message: string) => void;
  closeTicket: (ticketId: string) => void;
  clearAllData: () => void;
  addPendingTransaction: (transaction: Transaction) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      pendingTransactions: [],
      supportTickets: [],

      addPendingTransaction: (transaction: Transaction) => {
        const { pendingTransactions } = get();
        set({ pendingTransactions: [...pendingTransactions, transaction] });
      },

      approveTransaction: (txId: string) => {
        const { pendingTransactions } = get();
        const transaction = pendingTransactions.find(tx => tx.id === txId);
        
        if (transaction) {
          // Update transaction status in wallet store
          useWalletStore.getState().updateTransactionStatus(txId, 'completed');
          
          // Remove from pending list
          set({ 
            pendingTransactions: pendingTransactions.filter(tx => tx.id !== txId) 
          });
        }
      },

      rejectTransaction: (txId: string, reason: string) => {
        const { pendingTransactions } = get();
        const transaction = pendingTransactions.find(tx => tx.id === txId);
        
        if (transaction) {
          // Update transaction status in wallet store with error message
          useWalletStore.getState().updateTransactionStatus(txId, 'rejected', reason);
          
          // Remove from pending list
          set({ 
            pendingTransactions: pendingTransactions.filter(tx => tx.id !== txId) 
          });
        }
      },

      addSupportTicket: (ticket: SupportTicket) => {
        const { supportTickets } = get();
        set({ supportTickets: [...supportTickets, ticket] });
      },

      replyToTicket: (ticketId: string, message: string) => {
        const { supportTickets } = get();
        const updatedTickets = supportTickets.map(ticket => 
          ticket.id === ticketId 
            ? { 
                ...ticket, 
                status: 'replied' as const,
                replies: [...ticket.replies, {
                  id: 'reply_' + Date.now(),
                  message,
                  isAdmin: true,
                  timestamp: Date.now(),
                }]
              }
            : ticket
        );
        set({ supportTickets: updatedTickets });
      },

      closeTicket: (ticketId: string) => {
        const { supportTickets } = get();
        const updatedTickets = supportTickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: 'closed' as const }
            : ticket
        );
        set({ supportTickets: updatedTickets });
      },

      clearAllData: () => {
        set({ 
          pendingTransactions: [],
          supportTickets: [],
        });
      },
    }),
    {
      name: 'admin-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);