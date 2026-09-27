import { NextRequest, NextResponse } from 'next/server';
import { getBloodBanks, searchBloodStock } from '@/lib/db';
import { BloodGroup } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup') as BloodGroup | null;
    const area = searchParams.get('area') || undefined;

    if (bloodGroup || area) {
      const results = searchBloodStock(bloodGroup || undefined, area);
      return NextResponse.json({ success: true, data: results });
    }

    const bloodBanks = getBloodBanks();
    return NextResponse.json({ success: true, data: bloodBanks });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
