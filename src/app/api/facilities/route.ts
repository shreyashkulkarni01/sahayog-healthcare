import { NextResponse } from 'next/server';
import { getNearbyFacilities } from '@/lib/db';

export async function GET() {
  try {
    const facilities = getNearbyFacilities();
    return NextResponse.json({ success: true, data: facilities });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
