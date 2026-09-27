import { NextRequest, NextResponse } from 'next/server';
import { getAmbulanceRequests, createAmbulanceRequest, updateAmbulanceRequest } from '@/lib/db';
import { UrgencyLevel, AmbulanceRequestStatus } from '@/types';

export async function GET() {
  try {
    const requests = getAmbulanceRequests();
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientName, patientPhone, pickupLocation, urgency, notes, assignedAmbulanceId, assignedVehicleNumber } =
      body;

    if (!patientName || !patientPhone || !pickupLocation) {
      return NextResponse.json(
        { success: false, error: 'Patient name, phone number, and pickup location are required' },
        { status: 400 }
      );
    }

    const newReq = createAmbulanceRequest({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      pickupLocation: pickupLocation.trim(),
      urgency: (urgency as UrgencyLevel) || 'Critical',
      status: assignedAmbulanceId ? 'Dispatched' : 'Requested',
      assignedAmbulanceId: assignedAmbulanceId || undefined,
      assignedVehicleNumber: assignedVehicleNumber || undefined,
      notes: (notes || '').trim(),
      dispatchedAt: assignedAmbulanceId ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({ success: true, data: newReq }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const updated = updateAmbulanceRequest(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Ambulance request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
