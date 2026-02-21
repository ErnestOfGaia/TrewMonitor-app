import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { decryptData } from '@/lib/encryption';
import { getMockBotData, getLiveBotData, validateApiKeys } from '@/lib/phemex-api';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        settings: true,
        bots: { orderBy: { startedAt: 'desc' } },
      },
    });

    const hasApiKeys = !!(user?.settings?.encryptedApiKey && user?.settings?.encryptedSecret);
    const hasBots = (user?.bots?.length ?? 0) > 0;

    // No API keys — return demo data
    if (!hasApiKeys) {
      return NextResponse.json({
        success: true,
        demo: true,
        bots: getMockBotData(),
        message: 'Demo mode - configure API keys in settings for live data',
      });
    }

    // API keys exist but no bots added yet
    if (!hasBots) {
      return NextResponse.json({
        success: true,
        demo: false,
        bots: [],
        message: 'No bots configured - add your first bot on the Bots page',
      });
    }

    // Decrypt API keys
    const apiKey = decryptData(user?.settings?.encryptedApiKey ?? '');
    const apiSecret = decryptData(user?.settings?.encryptedSecret ?? '');

    // Validate API keys first
    const isValid = await validateApiKeys({ apiKey, apiSecret });
    if (!isValid) {
      return NextResponse.json({
        success: true,
        demo: true,
        bots: getMockBotData(),
        message: 'API key validation failed - showing demo data',
      });
    }

    // Fetch live data for each bot in parallel
    const liveBotsResults = await Promise.allSettled(
      (user?.bots ?? []).map((bot) =>
        getLiveBotData({ apiKey, apiSecret }, bot)
      )
    );

    const liveBots = liveBotsResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // If live data fetch fails for a bot, return it with zeros
        console.error(`Failed to fetch live data for bot ${user?.bots?.[index]?.id}:`, result.reason);
        const bot = user?.bots?.[index];
        return {
          id: bot?.id ?? '',
          pair: bot?.pair ?? '',
          displayPair: bot?.displayPair ?? '',
          status: bot?.status ?? 'active',
          upperLimit: bot?.upperLimit ?? 0,
          lowerLimit: bot?.lowerLimit ?? 0,
          gridCount: bot?.gridCount ?? 0,
          gridType: bot?.gridType ?? 'arithmetic',
          investment: bot?.investment ?? 0,
          startedAt: bot?.startedAt?.toISOString() ?? '',
          notes: bot?.notes ?? null,
          currentPrice: 0,
          realizedPnl: 0,
          unrealizedPnl: 0,
          totalArbitrages: 0,
          totalFees: 0,
          roi: 0,
          apr: 0,
          runtime: '0d 0h 0m',
          runtimeMs: 0,
          gridLevels: [],
          priceHistory: [],
          arbitrages: [],
        };
      }
    });

    return NextResponse.json({
      success: true,
      demo: false,
      bots: liveBots,
    });
  } catch (error) {
    console.error('Bots GET error:', error);
    return NextResponse.json({
      success: true,
      demo: true,
      bots: getMockBotData(),
      message: 'Error fetching data - showing demo data',
    });
  }
}
