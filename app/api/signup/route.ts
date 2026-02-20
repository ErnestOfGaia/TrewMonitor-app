import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request?.json?.();
    const { email, password, name } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma?.user?.findUnique?.({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt?.hash?.(password, 12);

    const user = await prisma?.user?.create?.({
      data: {
        email,
        password: hashedPassword,
        name: name ?? email?.split?.('@')?.[0] ?? 'User',
        settings: {
          create: {
            tipLevel: 1,
            refreshRate: 60,
            theme: 'green',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
