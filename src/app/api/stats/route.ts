import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
