import { NextRequest, NextResponse } from 'next/server';
import { getPatientById, getAppointments } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = getPatientById(id);
    if (!patient) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    const appointments = getAppointments().filter((a) => a.patientId === id);

    return NextResponse.json({
      success: true,
      data: {
        ...patient,
        appointments,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
