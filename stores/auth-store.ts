import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, KYCData } from '@/types/wallet';
import { generateUserId } from '@/utils/address-generator';
import { KYC_LIMITS } from '@/constants/kyc';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  updateKYC: (kycData: Partial<KYCData>) => void;
  resetSpendingLimits: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (email: string, password: string) => {
        try {
          // Check for admin credentials
          if (email === 'admin' && password === 'Legacybt') {
            const adminUser: User = {
              id: 'admin_user',
              email: 'admin@agilewallet.com',
              addresses: [],
              createdAt: Date.now(),
              kyc: {
                level: 'premium',
                firstName: 'Admin',
                lastName: 'User',
              },
              dailyLimit: KYC_LIMITS.premium.daily,
              monthlyLimit: KYC_LIMITS.premium.monthly,
              dailySpent: 0,
              monthlySpent: 0,
              lastResetDate: Date.now(),
            };
            
            set({ 
              user: adminUser, 
              isAuthenticated: true,
              isAdmin: true
            });
            return true;
          }
          
          // Real user authentication
          if (email && password) {
            try {
              const existingUsers = JSON.parse(await AsyncStorage.getItem('all-users') || '[]');
              const existingUser = existingUsers.find((u: User) => u.email === email);
              
              if (existingUser) {
                // In a real app, you would verify the password hash here
                set({ 
                  user: existingUser, 
                  isAuthenticated: true,
                  isAdmin: false
                });
                return true;
              }
            } catch (error) {
              console.log('Error loading users:', error);
            }
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      signup: async (email: string, password: string, firstName: string, lastName: string) => {
        try {
          if (email && password && firstName && lastName) {
            // Check if user already exists
            const existingUsers = JSON.parse(await AsyncStorage.getItem('all-users') || '[]');
            const userExists = existingUsers.find((u: User) => u.email === email);
            
            if (userExists) {
              throw new Error('User already exists');
            }

            const newUser: User = {
              id: generateUserId(),
              email,
              addresses: [],
              createdAt: Date.now(),
              kyc: {
                level: 'none',
                firstName,
                lastName,
              },
              dailyLimit: KYC_LIMITS.none.daily,
              monthlyLimit: KYC_LIMITS.none.monthly,
              dailySpent: 0,
              monthlySpent: 0,
              lastResetDate: Date.now(),
            };
            
            // Store user in AsyncStorage
            try {
              existingUsers.push(newUser);
              await AsyncStorage.setItem('all-users', JSON.stringify(existingUsers));
            } catch (error) {
              console.log('Error saving user:', error);
              throw new Error('Failed to save user');
            }
            
            set({ 
              user: newUser, 
              isAuthenticated: true,
              isAdmin: false
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Signup error:', error);
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isAdmin: false 
        });
      },

      setUser: (user: User) => {
        set({ user });
        
        // Update user in storage
        const updateUserInStorage = async () => {
          try {
            const existingUsers = JSON.parse(await AsyncStorage.getItem('all-users') || '[]');
            const updatedUsers = existingUsers.map((u: User) => 
              u.id === user.id ? user : u
            );
            await AsyncStorage.setItem('all-users', JSON.stringify(updatedUsers));
          } catch (error) {
            console.log('Error updating user in storage:', error);
          }
        };
        updateUserInStorage();
      },

      updateKYC: (kycData: Partial<KYCData>) => {
        const { user, setUser } = get();
        if (user) {
          const updatedUser = {
            ...user,
            kyc: { ...user.kyc, ...kycData },
            dailyLimit: KYC_LIMITS[kycData.level || user.kyc.level].daily,
            monthlyLimit: KYC_LIMITS[kycData.level || user.kyc.level].monthly,
          };
          setUser(updatedUser);
        }
      },

      resetSpendingLimits: () => {
        const { user, setUser } = get();
        if (user) {
          const now = Date.now();
          const daysSinceReset = Math.floor((now - user.lastResetDate) / (24 * 60 * 60 * 1000));
          
          if (daysSinceReset >= 1) {
            const updatedUser = {
              ...user,
              dailySpent: 0,
              monthlySpent: daysSinceReset >= 30 ? 0 : user.monthlySpent,
              lastResetDate: now,
            };
            setUser(updatedUser);
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);