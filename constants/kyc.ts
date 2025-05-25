import { KYCLimits } from '@/types/wallet';

export const KYC_LIMITS: KYCLimits = {
  none: { daily: 100, monthly: 500 },
  basic: { daily: 1000, monthly: 5000 },
  verified: { daily: 10000, monthly: 50000 },
  premium: { daily: 100000, monthly: 500000 },
};

export const KYC_REQUIREMENTS = {
  none: {
    title: 'No Verification',
    description: 'Basic account with limited functionality',
    requirements: ['Email verification only'],
  },
  basic: {
    title: 'Basic Verification',
    description: 'Increased limits with basic information',
    requirements: ['Full name', 'Phone number', 'Date of birth'],
  },
  verified: {
    title: 'Identity Verified',
    description: 'Full verification with government ID',
    requirements: ['Government issued ID', 'Address verification', 'Selfie verification'],
  },
  premium: {
    title: 'Premium Account',
    description: 'Highest limits for institutional users',
    requirements: ['Enhanced due diligence', 'Source of funds verification', 'Business verification'],
  },
};

export const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID Card' },
];