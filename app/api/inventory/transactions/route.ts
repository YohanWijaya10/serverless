import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createTransactionAndApply } from '@/lib/inventory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const result = await createTransactionAndApply(prisma, body);
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 400 });
  }
}

