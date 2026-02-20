import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { decryptData } from '@/lib/encryption';
import { getMockBotData, getSpotAccounts } from '@/lib/phemex-api';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma?.user?.findUnique?.({
      where: { email: session?.user?.email },
      include: { settings: true },
    });

    const hasApiKeys = !!(user?.settings?.encryptedApiKey && user?.settings?.encryptedSecret);

    // If no API keys configured, return demo data
    if (!hasApiKeys) {
      return NextResponse.json({
        success: true,
        demo: true,
        bots: getMockBotData(),
        message: 'Demo mode - configure API keys in settings for live data',
      });
    }

    // Decrypt and use real API keys
    const apiKey = decryptData(user?.settings?.encryptedApiKey ?? '');
    const apiSecret = decryptData(user?.settings?.encryptedSecret ?? '');

    // Try to fetch real data from Phemex
    const accountResult = await getSpotAccounts({ apiKey, apiSecret });

    if (!accountResult?.success) {
      // Fall back to demo data on API error
      return NextResponse.json({
        success: true,
        demo: true,
        bots: getMockBotData(),
        message: accountResult?.error ?? 'API error - showing demo data',
      });
    }

    // Note: Phemex doesn't have dedicated grid bot API endpoints
    // In a real implementation, you would parse account data and orders
    // to reconstruct grid bot state. For now, return demo data with
    // indication that API connection is successful.
    return NextResponse.json({
      success: true,
      demo: true,
      bots: getMockBotData(),
      message: 'API connected - grid bot specific endpoints not available. Showing demo data.',
      accountData: accountResult?.data,
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
