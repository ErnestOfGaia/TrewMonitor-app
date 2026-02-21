import CryptoJS from 'crypto-js';

const BASE_URL = 'https://api.phemex.com';

interface PhemexCredentials {
  apiKey: string;
  apiSecret: string;
}

function createSignature(apiSecret: string, path: string, queryString: string, expiry: number, body: string = ''): string {
  const signString = `${path}${queryString}${expiry}${body}`;
  return CryptoJS.HmacSHA256(signString, apiSecret).toString();
}

export async function phemexRequest(
  credentials: PhemexCredentials,
  path: string,
  method: string = 'GET',
  queryParams: Record<string, string> = {},
  body: Record<string, unknown> | null = null
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const expiry = Math.floor(Date.now() / 1000) + 60;
    const queryString = Object.keys(queryParams).length > 0
      ? Object.entries(queryParams).map(([k, v]) => `${k}=${v}`).join('&')
      : '';

    const bodyString = body ? JSON.stringify(body) : '';
    const signature = createSignature(credentials.apiSecret, path, queryString, expiry, bodyString);
    const url = `${BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-phemex-access-token': credentials.apiKey,
      'x-phemex-request-signature': signature,
      'x-phemex-request-expiry': String(expiry),
    };

    const response = await fetch(url, {
      method,
      headers,
      body: bodyString || undefined,
    });

    if (response.status === 401) return { success: false, error: 'Authentication failed - check your API keys' };
    if (response.status === 429) return { success: false, error: 'API rate limit reached - please wait' };
    if (!response.ok) return { success: false, error: `API error: ${response.status}` };

    const data = await response.json();
    if (data?.code !== 0) return { success: false, error: data?.msg ?? 'Unknown API error' };

    return { success: true, data: data?.data };
  } catch {
    return { success: false, error: 'Network error - please check your connection' };
  }
}

// ============================================
// Account
// ============================================
export async function getSpotAccounts(credentials: PhemexCredentials) {
  return phemexRequest(credentials, '/spot/wallets');
}

export async function validateApiKeys(credentials: PhemexCredentials): Promise<boolean> {
  const result = await getSpotAccounts(credentials);
  return result.success === true;
}

// ============================================
// Live price
// ============================================
export async function getSpotTicker(credentials: PhemexCredentials, symbol: string) {
  return phemexRequest(credentials, '/spot/ticker/24hr', 'GET', { symbol });
}

// ============================================
// Orders
// ============================================
export async function getOpenOrders(credentials: PhemexCredentials, symbol: string) {
  return phemexRequest(credentials, '/spot/orders/active', 'GET', { symbol });
}

// ============================================
// Trade history
// ============================================
export async function getTradeHistory(credentials: PhemexCredentials, symbol: string) {
  return phemexRequest(credentials, '/exchange/spot/order/trades', 'GET', { symbol });
}

// ============================================
// PnL
// ============================================
export async function getSpotPnl(credentials: PhemexCredentials, symbol: string) {
  return phemexRequest(credentials, '/api-data/spot/pnl', 'GET', { symbol });
}

// ============================================
// Live bot data — combines all sources for one bot
// ============================================
export interface LiveBotData {
  id: string;
  pair: string;
  displayPair: string;
  status: string;
  upperLimit: number;
  lowerLimit: number;
  gridCount: number;
  gridType: string;
  investment: number;
  startedAt: string;
  notes: string | null;
  // Live data
  currentPrice: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalArbitrages: number;
  totalFees: number;
  roi: number;
  apr: number;
  runtime: string;
  runtimeMs: number;
  gridLevels: number[];
  priceHistory: { timestamp: number; price: number }[];
  arbitrages: { timestamp: number; price: number; type: string; profit: number }[];
}

export async function getLiveBotData(
  credentials: PhemexCredentials,
  bot: {
    id: string;
    pair: string;
    displayPair: string;
    status: string;
    upperLimit: number;
    lowerLimit: number;
    gridCount: number;
    gridType: string;
    investment: number;
    startedAt: Date;
    notes: string | null;
  }
): Promise<LiveBotData> {
  // Calculate runtime
  const runtimeMs = Date.now() - new Date(bot.startedAt).getTime();
  const runtime = formatRuntime(runtimeMs);

  // Calculate grid levels
  const gridLevels = calculateGridLevels(bot.lowerLimit, bot.upperLimit, bot.gridCount, bot.gridType);

  // Fetch all live data in parallel
  const [tickerResult, tradesResult, pnlResult] = await Promise.all([
    getSpotTicker(credentials, bot.pair),
    getTradeHistory(credentials, bot.pair),
    getSpotPnl(credentials, bot.pair),
  ]);

  // Current price
  const tickerData = tickerResult.data as Record<string, unknown> | null;
  const currentPrice = tickerData?.lastPrice
    ? parseFloat(String(tickerData.lastPrice))
    : 0;

  // Realized PnL from PnL endpoint
  const pnlData = pnlResult.data as Record<string, unknown> | null;
  const realizedPnl = pnlData?.realisedPnl
    ? parseFloat(String(pnlData.realisedPnl)) / 1e8 // Phemex uses scaled integers
    : 0;

  // Parse trades for arbitrage history and fees
  const tradesData = tradesResult.data as { rows?: unknown[] } | null;
  const trades = tradesData?.rows ?? [];

  // Filter trades to only those after bot start time
  const botStartTime = new Date(bot.startedAt).getTime();
  const botTrades = (trades as Record<string, unknown>[]).filter((t) => {
    const tradeTime = Number(t.transactTimeNs ?? 0) / 1e6; // nanoseconds to ms
    return tradeTime >= botStartTime;
  });

  const totalArbitrages = Math.floor(botTrades.length / 2); // buy + sell = 1 arbitrage
  const totalFees = botTrades.reduce((sum, t) => {
    return sum + (parseFloat(String(t.feeAmount ?? 0)) / 1e8);
  }, 0);

  // Build arbitrage events from trades
  const arbitrages = botTrades.slice(-20).map((t) => ({
    timestamp: Number(t.transactTimeNs ?? 0) / 1e6,
    price: parseFloat(String(t.priceEp ?? 0)) / 1e4,
    type: String(t.side ?? '').toLowerCase() === 'buy' ? 'buy' : 'sell',
    profit: parseFloat(String(t.execFeeEv ?? 0)) / 1e8,
  }));

  // Build price history from trades (last 48 data points)
  const priceHistory = botTrades.slice(-48).map((t) => ({
    timestamp: Number(t.transactTimeNs ?? 0) / 1e6,
    price: parseFloat(String(t.priceEp ?? 0)) / 1e4,
  }));

  // Add current price as last point
  if (currentPrice > 0) {
    priceHistory.push({ timestamp: Date.now(), price: currentPrice });
  }

  // Unrealized PnL — estimate based on current price vs investment
  // (Phemex doesn't expose this directly for spot grid bots)
  const unrealizedPnl = 0;

  // ROI and APR
  const totalPnl = realizedPnl + unrealizedPnl;
  const roi = bot.investment > 0 ? (totalPnl / bot.investment) * 100 : 0;
  const runtimeDays = runtimeMs / (1000 * 60 * 60 * 24);
  const apr = runtimeDays > 0 ? (roi / runtimeDays) * 365 : 0;

  return {
    id: bot.id,
    pair: bot.pair,
    displayPair: bot.displayPair,
    status: bot.status,
    upperLimit: bot.upperLimit,
    lowerLimit: bot.lowerLimit,
    gridCount: bot.gridCount,
    gridType: bot.gridType,
    investment: bot.investment,
    startedAt: bot.startedAt.toISOString(),
    notes: bot.notes,
    currentPrice,
    realizedPnl,
    unrealizedPnl,
    totalArbitrages,
    totalFees,
    roi,
    apr,
    runtime,
    runtimeMs,
    gridLevels,
    priceHistory,
    arbitrages,
  };
}

// ============================================
// Helpers
// ============================================
function formatRuntime(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${minutes}m`;
}

function calculateGridLevels(lower: number, upper: number, count: number, type: string): number[] {
  const levels: number[] = [];
  if (type === 'geometric') {
    const ratio = Math.pow(upper / lower, 1 / count);
    for (let i = 0; i <= count; i++) {
      levels.push(parseFloat((lower * Math.pow(ratio, i)).toFixed(8)));
    }
  } else {
    // arithmetic
    const step = (upper - lower) / count;
    for (let i = 0; i <= count; i++) {
      levels.push(parseFloat((lower + step * i).toFixed(8)));
    }
  }
  return levels;
}

// ============================================
// Mock data for demo mode
// ============================================
export function getMockBotData() {
  const btcGridLevels = calculateGridLevels(62000, 72000, 20, 'arithmetic');
  const ethGridLevels = calculateGridLevels(3100, 3800, 15, 'geometric');
  const solGridLevels = calculateGridLevels(150, 200, 10, 'arithmetic');

  return [
    {
      id: 'bot-1',
      pair: 'BTCUSDT',
      displayPair: 'BTC/USDT',
      status: 'active',
      currentPrice: 67245.50,
      entryPrice: 65500.00,
      upperLimit: 72000,
      lowerLimit: 62000,
      gridCount: 20,
      investment: 5000,
      totalArbitrages: 47,
      realizedPnl: 234.56,
      unrealizedPnl: -45.23,
      roi: 3.78,
      apr: 45.6,
      runtime: '12d 5h 32m',
      runtimeMs: 1056720000,
      totalFees: 12.34,
      gridType: 'arithmetic',
      gridLevels: btcGridLevels,
      priceHistory: generateMockPriceHistory(67245.50, 62000, 72000),
      arbitrages: generateMockArbitrages(btcGridLevels, 67245.50),
      shareLink: 'https://phemex.com/trading-bots/share?id=7175119&referralCode=D7P5V5&type=SPOT_GRID',
    },
    {
      id: 'bot-2',
      pair: 'ETHUSDT',
      displayPair: 'ETH/USDT',
      status: 'active',
      currentPrice: 3456.78,
      entryPrice: 3350.00,
      upperLimit: 3800,
      lowerLimit: 3100,
      gridCount: 15,
      investment: 3000,
      totalArbitrages: 32,
      realizedPnl: 156.78,
      unrealizedPnl: 23.45,
      roi: 6.01,
      apr: 72.3,
      runtime: '8d 14h 22m',
      runtimeMs: 742320000,
      totalFees: 8.92,
      gridType: 'geometric',
      gridLevels: ethGridLevels,
      priceHistory: generateMockPriceHistory(3456.78, 3100, 3800),
      arbitrages: generateMockArbitrages(ethGridLevels, 3456.78),
      shareLink: 'https://phemex.com/trading-bots/share?id=7175120&referralCode=D7P5V5&type=SPOT_GRID',
    },
    {
      id: 'bot-3',
      pair: 'SOLUSDT',
      displayPair: 'SOL/USDT',
      status: 'active',
      currentPrice: 178.45,
      entryPrice: 165.00,
      upperLimit: 200,
      lowerLimit: 150,
      gridCount: 10,
      investment: 1500,
      totalArbitrages: 28,
      realizedPnl: 89.12,
      unrealizedPnl: -12.34,
      roi: 5.12,
      apr: 62.4,
      runtime: '6d 9h 45m',
      runtimeMs: 553500000,
      totalFees: 4.56,
      gridType: 'arithmetic',
      gridLevels: solGridLevels,
      priceHistory: generateMockPriceHistory(178.45, 150, 200),
      arbitrages: generateMockArbitrages(solGridLevels, 178.45),
      shareLink: 'https://phemex.com/trading-bots/share?id=7175121&referralCode=D7P5V5&type=SPOT_GRID',
    },
  ];
}

function generateMockPriceHistory(currentPrice: number, lower: number, upper: number) {
  const history = [];
  const range = upper - lower;
  const midPoint = (upper + lower) / 2;
  for (let i = 47; i >= 0; i--) {
    const timestamp = Date.now() - i * 3600000;
    const randomOffset = (Math.random() - 0.5) * range * 0.3;
    const price = Math.max(lower, Math.min(upper, midPoint + randomOffset));
    history.push({ timestamp, price });
  }
  history.push({ timestamp: Date.now(), price: currentPrice });
  return history;
}

function generateMockArbitrages(gridLevels: number[], currentPrice: number) {
  const arbitrages = [];
  for (let i = 0; i < 12; i++) {
    const timestamp = Date.now() - Math.random() * 86400000 * 2;
    const gridIndex = Math.floor(Math.random() * (gridLevels.length - 1));
    const gridLevel = gridLevels[gridIndex];
    const isBuy = gridLevel < currentPrice;
    const profit = Math.random() * 10 + 2;
    arbitrages.push({
      timestamp,
      price: gridLevel,
      gridLevel,
      profit,
      type: isBuy ? 'buy' : 'sell',
    });
  }
  return arbitrages.sort((a, b) => a.timestamp - b.timestamp);
}

export type BotData = ReturnType<typeof getMockBotData>[0];
