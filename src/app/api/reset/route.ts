import { NextResponse } from 'next/server';
import { resetDbToSeed } from '@/lib/db';

export async function POST() {
  try {
    const freshData = resetDbToSeed();
    return NextResponse.json({
      success: true,
      message: 'Database reset to initial demo dataset successfully',
      data: freshData,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
