import { NextRequest, NextResponse } from 'next/server';
import { getAmbulances, updateAmbulanceStatus } from '@/lib/db';
import { AmbulanceStatus } from '@/types';

export async function GET() {
  try {
    const ambulances = getAmbulances();
    return NextResponse.json({ success: true, data: ambulances });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Ambulance ID and status required' }, { status: 400 });
    }

    const updated = updateAmbulanceStatus(id, status as AmbulanceStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Ambulance not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
