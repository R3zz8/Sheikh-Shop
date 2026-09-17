export type MarketCategory = 'IRAN_CURRENCY' | 'GOLD_COIN' | 'GLOBAL_CURRENCY' | 'ENERGY' | 'COMMODITY' | 'CRYPTO';

export type PriceDirection = 'UP' | 'DOWN' | 'NEUTRAL';

export interface MarketAssetDefinition {
  symbol: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  category: MarketCategory;
  market: 'DOMESTIC' | 'GLOBAL' | 'CRYPTO';
  unit: string; // e.g. 'تومان', 'دلار', 'دلار / اونس', 'دلار / بشکه'
  icon?: string;
  isFeatured?: boolean;
  sortOrder: number;
  basePriceFallback: number; // Toman for domestic, USD for global/crypto
  buyPriceFallback?: number;
  sellPriceFallback?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface RawMarketQuote {
  symbol: string;
  price: number;
  buyPrice?: number;
  sellPrice?: number;
  priceChange?: number;
  percentChange?: number;
  unit: string;
  provider: string;
  timestamp?: Date;
}

export interface NormalizedQuote {
  symbol: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  category: MarketCategory;
  market: 'DOMESTIC' | 'GLOBAL' | 'CRYPTO';
  currentPrice: number;
  buyPrice: number | null;
  sellPrice: number | null;
  priceChange: number;
  percentChange: number;
  direction: PriceDirection;
  unit: string;
  provider: string;
  isStale: boolean;
  providerTimestamp: string; // ISO string
  fetchedAt: string; // ISO string
  sparkline?: number[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface HistoryPoint {
  timestamp: string; // ISO string or format
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface ProviderFetchResult {
  provider: string;
  success: boolean;
  quotes: Record<string, RawMarketQuote>;
  error?: string;
  latencyMs?: number;
}

export interface MarketOverview {
  quotes: NormalizedQuote[];
  featured: NormalizedQuote[];
  categories: { key: MarketCategory; labelFa: string; count: number }[];
  lastUpdated: string;
  providerStatus: {
    providerName: string;
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    lastSuccessFetch: string | null;
    latencyMs: number | null;
  }[];
}

export interface ConversionResult {
  fromSymbol: string;
  toSymbol: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  formattedResult: string;
  lastUpdated: string;
}
