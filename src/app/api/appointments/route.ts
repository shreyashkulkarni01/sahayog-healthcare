import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, createAppointment, updateAppointment } from '@/lib/db';
import { AppointmentStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    let appointments = getAppointments();

    if (date) {
      appointments = appointments.filter((a) => a.date === date);
    }
    if (patientId) {
      appointments = appointments.filter((a) => a.patientId === patientId);
    }
    if (status && status !== 'All') {
      appointments = appointments.filter((a) => a.status === status);
    }

    // Sort by date and time
    appointments.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      patientName,
      patientPhone,
      date,
      time,
      reason,
      doctorName,
      status,
      hasFollowUp,
      followUpDate,
      notes,
    } = body;

    if (!patientId || !patientName || !date || !time || !reason || !doctorName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient, date, time, reason, and assigned doctor/staff are required.',
        },
        { status: 400 }
      );
    }

    const newAppointment = createAppointment({
      patientId,
      patientName,
      patientPhone: patientPhone || '',
      date,
      time,
      reason: reason.trim(),
      doctorName: doctorName.trim(),
      status: (status as AppointmentStatus) || 'Scheduled',
      hasFollowUp: Boolean(hasFollowUp),
      followUpDate: followUpDate || undefined,
      notes: (notes || '').trim(),
    });

    return NextResponse.json({ success: true, data: newAppointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Appointment ID is required' }, { status: 400 });
    }

    const updated = updateAppointment(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
