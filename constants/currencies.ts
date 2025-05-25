import { Currency } from '@/types/wallet';

export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    addressPrefix: '1',
    decimals: 8,
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    addressPrefix: '0x',
    decimals: 18,
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    icon: '₮',
    addressPrefix: '0x',
    decimals: 6,
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    addressPrefix: '',
    decimals: 9,
  },
];