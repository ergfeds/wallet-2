import { SUPPORTED_CURRENCIES } from '@/constants/currencies';

const generateRandomString = (length: number, charset: string): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

export const generateWalletAddress = (currencyId: string): string => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.id === currencyId);
  if (!currency) throw new Error(`Unsupported currency: ${currencyId}`);

  switch (currencyId) {
    case 'btc':
      // Bitcoin-like address (P2PKH format)
      return currency.addressPrefix + generateRandomString(33, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
    
    case 'eth':
    case 'usdt':
      // Ethereum-like address
      return currency.addressPrefix + generateRandomString(40, '0123456789abcdef');
    
    case 'sol':
      // Solana-like address
      return generateRandomString(44, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
    
    default:
      return generateRandomString(34, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
  }
};

export const generateUserId = (): string => {
  return 'user_' + generateRandomString(16, '0123456789abcdef');
};

export const generateTransactionId = (): string => {
  return 'tx_' + generateRandomString(32, '0123456789abcdef');
};

export const generateTicketId = (): string => {
  return 'ticket_' + generateRandomString(12, '0123456789ABCDEF');
};