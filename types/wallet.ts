export interface Currency {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  addressPrefix: string;
  decimals: number;
}

export interface WalletAddress {
  currencyId: string;
  address: string;
  balance: number;
}

export interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  currencyId: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: number;
  errorMessage?: string;
  isIncoming: boolean;
  fromUserId?: string;
  toUserId?: string;
}

export type KYCLevel = 'none' | 'basic' | 'verified' | 'premium';

export interface KYCData {
  level: KYCLevel;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  documentType?: 'passport' | 'drivers_license' | 'national_id';
  documentNumber?: string;
  documentImage?: string;
  selfieImage?: string;
  submittedAt?: number;
  verifiedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
}

export interface User {
  id: string;
  email: string;
  addresses: WalletAddress[];
  createdAt: number;
  kyc: KYCData;
  dailyLimit: number;
  monthlyLimit: number;
  dailySpent: number;
  monthlySpent: number;
  lastResetDate: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'replied' | 'closed';
  replies: TicketReply[];
  createdAt: number;
}

export interface TicketReply {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: number;
}

export interface KYCLimits {
  none: { daily: number; monthly: number };
  basic: { daily: number; monthly: number };
  verified: { daily: number; monthly: number };
  premium: { daily: number; monthly: number };
}