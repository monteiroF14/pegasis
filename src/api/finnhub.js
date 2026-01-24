import { upsertMarket } from './db.js';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

// Lista curada das stocks mais relevantes (mega caps, S&P 500 leaders, tech, finance, energy)
const RELEVANT_SYMBOLS = [
  'AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','BRK.B','JPM','V','MA','UNH','XOM','LLY','JNJ','WMT','PG','AVGO','HD','COST','PEP','KO','MRK','ABBV','BAC','ORCL','CVX','ADBE','CRM','NFLX','AMD','INTC','QCOM','TXN','IBM','CSCO','INTU','AMAT','GE','CAT','BA','MMM','UPS','FDX','RTX','LMT','NKE','DIS','MCD','SBUX','PFE','TMO','ABT','DHR','MDT','GS','MS','BLK','AXP','C','SCHW','SPGI','ICE','CME','BKNG','UBER','LYFT','PYPL','SQ','SHOP','SNOW','PLTR','NOW','ZM','DOCU','PANW','CRWD','ZS','OKTA','NET','DDOG','MDB','TWLO','ETSY','EBAY','BABA','TSM','ASML','SAP','SONY','NTDOY','TM','HMC','BP','SHEL','TOT','RIO','BHP','VALE','NVO','AZN','GSK','SAN','BBVA','ING','UBS','DB','BNP.PA','AIR.PA','MC.PA','OR.PA','ADS.DE','BMW.DE','MBG.DE','VOW3.DE'
];

/**
 * Fetches fresh data from Finnhub for relevant symbols and updates the database.
 * This runs in the background and does not return the data directly.
 * It strictly validates data before upserting.
 */
export async function syncMarketData() {
  if (!API_KEY) {
    console.warn("VITE_FINNHUB_API_KEY is missing. Skipping background sync.");
    return;
  }

  // Process a subset to avoid immediate rate limits if needed, 
  // but for now we try the first 200 as per original logic.
  const symbolsToSync = RELEVANT_SYMBOLS.slice(0, 200);

  // We process these in chunks or parallel.
  // Using Promise.allSettled to ensure one failure doesn't stop others.
  await Promise.allSettled(
    symbolsToSync.map(async (symbol) => {
      try {
        const [quoteRes, profileRes] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`)
        ]);

        if (!quoteRes.ok || !profileRes.ok) {
           return;
        }

        const quote = await quoteRes.json();
        const profile = await profileRes.json();

        // Strict Validation
        if (!quote || quote.c === undefined || quote.c === null || quote.error) {
           return;
        }

        const stockData = {
          id: symbol,
          symbol,
          description: profile.name || symbol,
          price: quote.c,
          change: quote.dp,
          logo: profile.logo || `https://logo.clearbit.com/${profile.weburl?.replace('https://','').replace('http://','')}`,
          ...quote,
          ...profile
        };
        
        await upsertMarket(stockData);
      } catch (err) {
        // Silently fail for individual symbols to avoid cluttering logs in background
        // console.error(`Failed to sync ${symbol}`, err);
      }
    })
  );
}
