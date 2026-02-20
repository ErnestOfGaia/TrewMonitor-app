import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { encryptData, decryptData, maskApiKey } from '@/lib/encryption';

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

    if (!user?.settings) {
      return NextResponse.json({
        tipLevel: 1,
        refreshRate: 60,
        theme: 'green',
        hasApiKeys: false,
        maskedApiKey: '',
        demoMode: true,
        displayName: '',
        bio: '',
        socialTwitter: '',
        socialYoutube: '',
        socialTelegram: '',
      });
    }

    const hasApiKeys = !!(user?.settings?.encryptedApiKey && user?.settings?.encryptedSecret);
    const maskedApiKey = hasApiKeys
      ? maskApiKey(decryptData(user?.settings?.encryptedApiKey ?? ''))
      : '';

    return NextResponse.json({
      tipLevel: user?.settings?.tipLevel ?? 1,
      refreshRate: user?.settings?.refreshRate ?? 60,
      theme: user?.settings?.theme ?? 'green',
      hasApiKeys,
      maskedApiKey,
      demoMode: user?.settings?.demoMode ?? true,
      displayName: user?.settings?.displayName ?? '',
      bio: user?.settings?.bio ?? '',
      socialTwitter: user?.settings?.socialTwitter ?? '',
      socialYoutube: user?.settings?.socialYoutube ?? '',
      socialTelegram: user?.settings?.socialTelegram ?? '',
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request?.json?.();
    const { 
      apiKey, 
      apiSecret, 
      tipLevel, 
      refreshRate, 
      theme, 
      demoMode,
      displayName,
      bio,
      socialTwitter,
      socialYoutube,
      socialTelegram,
    } = body ?? {};

    const user = await prisma?.user?.findUnique?.({
      where: { email: session?.user?.email },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (apiKey && apiSecret) {
      updateData.encryptedApiKey = encryptData(apiKey);
      updateData.encryptedSecret = encryptData(apiSecret);
    }
    if (tipLevel !== undefined) updateData.tipLevel = tipLevel;
    if (refreshRate !== undefined) updateData.refreshRate = refreshRate;
    if (theme !== undefined) updateData.theme = theme;
    if (demoMode !== undefined) updateData.demoMode = demoMode;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (socialTwitter !== undefined) updateData.socialTwitter = socialTwitter;
    if (socialYoutube !== undefined) updateData.socialYoutube = socialYoutube;
    if (socialTelegram !== undefined) updateData.socialTelegram = socialTelegram;

    if (user?.settings) {
      await prisma?.userSettings?.update?.({
        where: { userId: user?.id },
        data: updateData,
      });
    } else {
      await prisma?.userSettings?.create?.({
        data: {
          userId: user?.id ?? '',
          ...updateData,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma?.user?.findUnique?.({
      where: { email: session?.user?.email },
    });

    if (user?.id) {
      await prisma?.userSettings?.update?.({
        where: { userId: user?.id },
        data: {
          encryptedApiKey: null,
          encryptedSecret: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete API keys' }, { status: 500 });
  }
}
