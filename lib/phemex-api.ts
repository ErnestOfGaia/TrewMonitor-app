import CryptoJS from 'crypto-js';

const BASE_URL = 'https://api.phemex.com';

interface PhemexCredentials {
  apiKey: string;
  apiSecret: string;
}

function createSignature(apiSecret: string, path: string, queryString: string, expiry: number, body: string = ''): string {
  const signString = `${path}${queryString}${expiry}${body}`;
  return CryptoJS?.HmacSHA256?.(signString, apiSecret)?.toString?.() ?? '';
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
    const queryString = Object.keys(queryParams ?? {})?.length > 0
      ? Object.entries(queryParams ?? {})
          ?.map(([k, v]) => `${k}=${v}`)
          ?.join('&')
      : '';
    
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = createSignature(
      credentials?.apiSecret ?? '',
      path,
      queryString,
      expiry,
      bodyString
    );

    const url = `${BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-phemex-access-token': credentials?.apiKey ?? '',
      'x-phemex-request-signature': signature,
      'x-phemex-request-expiry': String(expiry),
    };

    const response = await fetch(url, {
      method,
      headers,
      body: bodyString || undefined,
    });

    if (response?.status === 401) {
      return { success: false, error: 'Authentication failed - check your API keys' };
    }
    if (response?.status === 429) {
      return { success: false, error: 'API rate limit reached - please wait' };
    }
    if (!response?.ok) {
      return { success: false, error: `API error: ${response?.status}` };
    }

    const data = await response?.json?.();
    if (data?.code !== 0) {
      return { success: false, error: data?.msg ?? 'Unknown API error' };
    }

    return { success: true, data: data?.data };
  } catch (error) {
    return { success: false, error: 'Network error - please check your connection' };
  }
}

export async function getSpotAccounts(credentials: PhemexCredentials) {
  return phemexRequest(credentials, '/spot/wallets');
}

export async function getSpotOrders(credentials: PhemexCredentials, symbol: string) {
  return phemexRequest(credentials, '/spot/orders/active', 'GET', { symbol });
}

export async function getSpotTrades(credentials: PhemexCredentials, symbol: string) {
  return phemexRequest(credentials, '/exchange/spot/order/trades', 'GET', { symbol });
}

export async function validateApiKeys(credentials: PhemexCredentials): Promise<boolean> {
  const result = await getSpotAccounts(credentials);
  return result?.success === true;
}

// Mock data for demo mode when API keys aren't configured
export function getMockBotData() {
  const btcGridLevels = [62000, 62500, 63000, 63500, 64000, 64500, 65000, 65500, 66000, 66500, 67000, 67500, 68000, 68500, 69000, 69500, 70000, 70500, 71000, 71500, 72000];
  const ethGridLevels = [3100, 3146, 3193, 3241, 3290, 3340, 3391, 3443, 3496, 3550, 3605, 3661, 3718, 3776, 3800];
  const solGridLevels = [150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200];
  
  return [
    {
      id: 'bot-1',
      pair: 'BTC/USDT',
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
      pair: 'ETH/USDT',
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
      pair: 'SOL/USDT',
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
  
  // Generate 48 hours of hourly data
  for (let i = 47; i >= 0; i--) {
    const timestamp = Date.now() - i * 3600000;
    const randomOffset = (Math.random() - 0.5) * range * 0.3;
    const price = Math.max(lower, Math.min(upper, midPoint + randomOffset));
    history.push({ timestamp, price });
  }
  
  // Ensure last price matches current
  history.push({ timestamp: Date.now(), price: currentPrice });
  
  return history;
}

function generateMockArbitrages(gridLevels: number[], currentPrice: number) {
  const arbitrages = [];
  
  // Generate arbitrage events at actual grid levels
  for (let i = 0; i < 12; i++) {
    const timestamp = Date.now() - Math.random() * 86400000 * 2;
    // Pick a random grid level for the arbitrage
    const gridIndex = Math.floor(Math.random() * (gridLevels.length - 1));
    const gridLevel = gridLevels[gridIndex];
    // Determine if this was a buy (below current) or sell (above current)
    const isBuy = gridLevel < currentPrice;
    const profit = Math.random() * 10 + 2;
    
    arbitrages.push({
      timestamp,
      price: gridLevel, // Arbitrage happens exactly at the grid level
      gridLevel,
      profit,
      type: isBuy ? 'buy' : 'sell',
    });
  }
  
  return arbitrages.sort((a, b) => a.timestamp - b.timestamp);
}

export type BotData = ReturnType<typeof getMockBotData>[0];
