import { NextRequest, NextResponse } from 'next/server';
import { getPatients, searchPatients, createPatient } from '@/lib/db';
import { Gender, BloodGroup } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    if (query) {
      const results = searchPatients(query);
      return NextResponse.json({ success: true, data: results });
    }
    const patients = getPatients();
    return NextResponse.json({ success: true, data: patients });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, age, gender, phone, bloodGroup, address } = body;

    if (!name || !phone || !gender || !bloodGroup) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, gender, and blood group are required.' },
        { status: 400 }
      );
    }

    const newPatient = createPatient({
      name: name.trim(),
      age: Number(age) || 0,
      gender: gender as Gender,
      phone: phone.trim(),
      bloodGroup: bloodGroup as BloodGroup,
      address: (address || '').trim(),
    });

    return NextResponse.json({ success: true, data: newPatient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
