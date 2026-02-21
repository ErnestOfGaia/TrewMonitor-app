import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET - fetch all bots for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { bots: { orderBy: { startedAt: 'desc' } } },
    });

    return NextResponse.json({ success: true, bots: user?.bots ?? [] });
  } catch (error) {
    console.error('Bots manage GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bots' }, { status: 500 });
  }
}

// POST - create a new bot
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pair, upperLimit, lowerLimit, gridCount, gridType, investment, startedAt, notes, status } = body;

    if (!pair || !upperLimit || !lowerLimit || !gridCount || !investment || !startedAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (upperLimit <= lowerLimit) {
      return NextResponse.json({ error: 'Upper limit must be greater than lower limit' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert pair to Phemex format (remove / and ensure uppercase)
    const phemexPair = pair.replace('/', '').toUpperCase();
    // Store display pair with slash
    const displayPair = pair.includes('/')
      ? pair.toUpperCase()
      : `${pair.slice(0, -4).toUpperCase()}/${pair.slice(-4).toUpperCase()}`;

    const bot = await prisma.gridBot.create({
      data: {
        userId: user.id,
        pair: phemexPair,
        displayPair,
        upperLimit: parseFloat(upperLimit),
        lowerLimit: parseFloat(lowerLimit),
        gridCount: parseInt(gridCount),
        gridType: gridType ?? 'arithmetic',
        investment: parseFloat(investment),
        startedAt: new Date(startedAt),
        notes: notes ?? null,
        status: status ?? 'active',
      },
    });

    return NextResponse.json({ success: true, bot });
  } catch (error) {
    console.error('Bots manage POST error:', error);
    return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 });
  }
}

// PUT - update an existing bot
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, pair, upperLimit, lowerLimit, gridCount, gridType, investment, startedAt, notes, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the bot belongs to this user
    const existingBot = await prisma.gridBot.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingBot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (pair) {
      updateData.pair = pair.replace('/', '').toUpperCase();
      updateData.displayPair = pair.includes('/')
        ? pair.toUpperCase()
        : `${pair.slice(0, -4).toUpperCase()}/${pair.slice(-4).toUpperCase()}`;
    }
    if (upperLimit !== undefined) updateData.upperLimit = parseFloat(upperLimit);
    if (lowerLimit !== undefined) updateData.lowerLimit = parseFloat(lowerLimit);
    if (gridCount !== undefined) updateData.gridCount = parseInt(gridCount);
    if (gridType !== undefined) updateData.gridType = gridType;
    if (investment !== undefined) updateData.investment = parseFloat(investment);
    if (startedAt !== undefined) updateData.startedAt = new Date(startedAt);
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const bot = await prisma.gridBot.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, bot });
  } catch (error) {
    console.error('Bots manage PUT error:', error);
    return NextResponse.json({ error: 'Failed to update bot' }, { status: 500 });
  }
}

// DELETE - remove a bot
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the bot belongs to this user before deleting
    const existingBot = await prisma.gridBot.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingBot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    await prisma.gridBot.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bots manage DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete bot' }, { status: 500 });
  }
}
