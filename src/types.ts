export interface Stock {
  id: string;
  symbol: string;
  description: string;
  price: number;
  change: number;
  logo: string;
  /** Current price */
  c: number;
  /** Change */
  d: number;
  /** Percent change */
  dp: number;
  /** High price of the day */
  h: number;
  /** Low price of the day */
  l: number;
  /** Open price of the day */
  o: number;
  /** Previous close price */
  pc: number;
  /** Timestamp */
  t: number;
  country: string;
  currency: string;
  estimateCurrency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface PortfolioItem {
  id: number | string;
  stockId: string;
  name: string; // Cached name for display
  quantity: number;
  buyPrice: number;
  buyDate: string; // ISO Date
}

export interface Transaction {
  id: number | string;
  type: 'BUY' | 'SELL';
  stockId: string;
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
  /** Realized Profit/Loss (only for SELLs) */
  pnl?: number;
  date: string; // ISO Date
}

export interface Goal {
  description: string;
  xp: number;
  progress: number;
}

export interface Badge {
  id: number;
  description: string;
  multiplier: number;
  date: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  balance: number;
  level: number;
  xp: number;
  badgeIds: number[];
  goals: Goal[];
  /** Array of Stock IDs */
  watchlist: string[];
  portfolio: PortfolioItem[];
  history: Transaction[];
}
