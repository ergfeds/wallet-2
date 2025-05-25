import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportTicket, TicketReply } from '@/types/wallet';
import { generateTicketId } from '@/utils/address-generator';

interface SupportState {
  tickets: SupportTicket[];
  createTicket: (userId: string, subject: string, message: string) => string;
  replyToTicket: (ticketId: string, message: string, isAdmin: boolean) => void;
  closeTicket: (ticketId: string) => void;
  getTicketsByUser: (userId: string) => SupportTicket[];
  clearAllTickets: () => void;
}

export const useSupportStore = create<SupportState>()(
  persist(
    (set, get) => ({
      tickets: [],

      createTicket: (userId: string, subject: string, message: string) => {
        const ticketId = generateTicketId();
        const newTicket: SupportTicket = {
          id: ticketId,
          userId,
          subject,
          message,
          status: 'open',
          replies: [],
          createdAt: Date.now(),
        };

        set(state => ({
          tickets: [...state.tickets, newTicket],
        }));

        return ticketId;
      },

      replyToTicket: (ticketId: string, message: string, isAdmin: boolean) => {
        const { tickets } = get();
        const updatedTickets = tickets.map(ticket => {
          if (ticket.id === ticketId) {
            const newReply: TicketReply = {
              id: 'reply_' + Date.now(),
              message,
              isAdmin,
              timestamp: Date.now(),
            };

            return {
              ...ticket,
              status: isAdmin ? 'replied' as const : 'open' as const,
              replies: [...ticket.replies, newReply],
            };
          }
          return ticket;
        });

        set({ tickets: updatedTickets });
      },

      closeTicket: (ticketId: string) => {
        const { tickets } = get();
        const updatedTickets = tickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, status: 'closed' as const }
            : ticket
        );

        set({ tickets: updatedTickets });
      },

      getTicketsByUser: (userId: string) => {
        const { tickets } = get();
        return tickets.filter(ticket => ticket.userId === userId);
      },

      clearAllTickets: () => {
        set({ tickets: [] });
      },
    }),
    {
      name: 'support-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);