import { NextRequest, NextResponse } from 'next/server';
import { getBloodRequests, createBloodRequest, updateBloodRequestStatus } from '@/lib/db';
import { BloodGroup, BloodRequestStatus } from '@/types';

export async function GET() {
  try {
    const requests = getBloodRequests();
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientName, bloodGroup, unitsNeeded, urgency, hospitalOrClinic, contactPhone, notes } = body;

    if (!patientName || !bloodGroup || !unitsNeeded || !hospitalOrClinic || !contactPhone) {
      return NextResponse.json(
        { success: false, error: 'Patient, blood group, units, facility, and phone are required' },
        { status: 400 }
      );
    }

    const newReq = createBloodRequest({
      patientName: patientName.trim(),
      bloodGroup: bloodGroup as BloodGroup,
      unitsNeeded: Math.max(1, Number(unitsNeeded) || 1),
      urgency: urgency || 'Urgent',
      hospitalOrClinic: hospitalOrClinic.trim(),
      contactPhone: contactPhone.trim(),
      status: 'Pending',
      notes: (notes || '').trim(),
    });

    return NextResponse.json({ success: true, data: newReq }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const updated = updateBloodRequestStatus(id, status as BloodRequestStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Blood request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
