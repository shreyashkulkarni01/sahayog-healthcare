import fs from 'fs';
import path from 'path';
import {
  Patient,
  Appointment,
  Ambulance,
  AmbulanceRequest,
  BloodBank,
  BloodRequest,
  NearbyFacility,
  DatabaseSchema,
  BloodGroup,
  AppointmentStatus,
  AmbulanceStatus,
  AmbulanceRequestStatus,
  BloodRequestStatus,
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Helper to format date offset from today
function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function generateInitialSeed(): DatabaseSchema {
  const today = getDateOffset(0);
  const yesterday = getDateOffset(-1);
  const twoDaysAgo = getDateOffset(-2);
  const tomorrow = getDateOffset(1);
  const inTwoDays = getDateOffset(2);
  const inThreeDays = getDateOffset(3);

  const patients: Patient[] = [
    {
      id: 'pat-1',
      name: 'Eleanor Vance',
      age: 42,
      gender: 'Female',
      phone: '+1 (555) 234-8901',
      bloodGroup: 'O+',
      address: '742 Evergreen Terrace, Springfield',
      createdAt: '2026-09-01T09:00:00Z',
    },
    {
      id: 'pat-2',
      name: 'Marcus Brody',
      age: 58,
      gender: 'Male',
      phone: '+1 (555) 345-6789',
      bloodGroup: 'A+',
      address: '1204 Pine Street, Oakridge',
      createdAt: '2026-09-03T11:20:00Z',
    },
    {
      id: 'pat-3',
      name: 'Amina Al-Mansoor',
      age: 29,
      gender: 'Female',
      phone: '+1 (555) 456-7890',
      bloodGroup: 'B-',
      address: '88 Riverview Boulevard, Riverside',
      createdAt: '2026-09-05T14:15:00Z',
    },
    {
      id: 'pat-4',
      name: 'David Chen',
      age: 35,
      gender: 'Male',
      phone: '+1 (555) 567-8901',
      bloodGroup: 'AB+',
      address: '315 Maple Lane, Greenfield',
      createdAt: '2026-09-10T10:00:00Z',
    },
    {
      id: 'pat-5',
      name: 'Sophia Rodriguez',
      age: 67,
      gender: 'Female',
      phone: '+1 (555) 678-9012',
      bloodGroup: 'O-',
      address: '509 Horizon Way, Highland',
      createdAt: '2026-09-12T08:30:00Z',
    },
    {
      id: 'pat-6',
      name: 'James Thornton',
      age: 24,
      gender: 'Male',
      phone: '+1 (555) 789-0123',
      bloodGroup: 'A-',
      address: '14 Elmwood Drive, Lakeview',
      createdAt: '2026-09-14T15:45:00Z',
    },
    {
      id: 'pat-7',
      name: 'Priya Patel',
      age: 38,
      gender: 'Female',
      phone: '+1 (555) 890-1234',
      bloodGroup: 'B+',
      address: '920 Meadow Court, Sunnyside',
      createdAt: '2026-09-15T12:00:00Z',
    },
    {
      id: 'pat-8',
      name: 'Robert Kowalski',
      age: 51,
      gender: 'Male',
      phone: '+1 (555) 901-2345',
      bloodGroup: 'AB-',
      address: '404 Industrial Parkway, Eastgate',
      createdAt: '2026-09-18T09:15:00Z',
    },
    {
      id: 'pat-9',
      name: 'Grace Hopper-Kim',
      age: 31,
      gender: 'Female',
      phone: '+1 (555) 012-3456',
      bloodGroup: 'O+',
      address: '27 Beacon Hill Road, Westside',
      createdAt: '2026-09-20T16:20:00Z',
    },
    {
      id: 'pat-10',
      name: 'Thomas Sterling',
      age: 73,
      gender: 'Male',
      phone: '+1 (555) 123-9876',
      bloodGroup: 'A+',
      address: '612 Cedar Crest, Fairview',
      createdAt: '2026-09-21T11:00:00Z',
    },
    {
      id: 'pat-11',
      name: 'Chloe Tremblay',
      age: 19,
      gender: 'Female',
      phone: '+1 (555) 234-5678',
      bloodGroup: 'O-',
      address: '108 University Ave, Northwood',
      createdAt: '2026-09-22T13:40:00Z',
    },
    {
      id: 'pat-12',
      name: 'Arthur Pendelton',
      age: 62,
      gender: 'Male',
      phone: '+1 (555) 345-8765',
      bloodGroup: 'B+',
      address: '83 Kensington Crescent, Old Town',
      createdAt: '2026-09-23T10:10:00Z',
    },
  ];

  const appointments: Appointment[] = [
    // Past appointments
    {
      id: 'apt-1',
      patientId: 'pat-1',
      patientName: 'Eleanor Vance',
      patientPhone: '+1 (555) 234-8901',
      date: twoDaysAgo,
      time: '09:00',
      reason: 'Annual Routine Health Checkup',
      doctorName: 'Dr. Sarah Chen',
      status: 'Completed',
      hasFollowUp: true,
      followUpDate: tomorrow,
      notes: 'Routine visit completed. Requested follow-up for routine blood panel review.',
      createdAt: '2026-09-20T08:00:00Z',
    },
    {
      id: 'apt-2',
      patientId: 'pat-2',
      patientName: 'Marcus Brody',
      patientPhone: '+1 (555) 345-6789',
      date: twoDaysAgo,
      time: '11:30',
      reason: 'Consultation & Dietary Review',
      doctorName: 'Dr. Rajesh Sharma',
      status: 'Completed',
      hasFollowUp: false,
      notes: 'General lifestyle counseling completed.',
      createdAt: '2026-09-20T10:00:00Z',
    },
    {
      id: 'apt-3',
      patientId: 'pat-6',
      patientName: 'James Thornton',
      patientPhone: '+1 (555) 789-0123',
      date: yesterday,
      time: '10:00',
      reason: 'Seasonal Influenza Vaccination',
      doctorName: 'Nurse Mark Davis',
      status: 'Completed',
      hasFollowUp: false,
      notes: 'Routine vaccine administered.',
      createdAt: '2026-09-22T09:00:00Z',
    },
    {
      id: 'apt-4',
      patientId: 'pat-8',
      patientName: 'Robert Kowalski',
      patientPhone: '+1 (555) 901-2345',
      date: yesterday,
      time: '14:30',
      reason: 'General Follow-up Visit',
      doctorName: 'Dr. Emily Taylor',
      status: 'No-show',
      hasFollowUp: true,
      followUpDate: today,
      notes: 'Patient did not arrive. Staff scheduled to follow up today.',
      createdAt: '2026-09-22T11:00:00Z',
    },

    // Today's appointments
    {
      id: 'apt-5',
      patientId: 'pat-3',
      patientName: 'Amina Al-Mansoor',
      patientPhone: '+1 (555) 456-7890',
      date: today,
      time: '09:30',
      reason: 'Workplace Physical Screening',
      doctorName: 'Dr. Sarah Chen',
      status: 'Completed',
      hasFollowUp: false,
      notes: 'Physical checkup clearance paperwork issued.',
      createdAt: '2026-09-25T08:00:00Z',
    },
    {
      id: 'apt-6',
      patientId: 'pat-4',
      patientName: 'David Chen',
      patientPhone: '+1 (555) 567-8901',
      date: today,
      time: '11:00',
      reason: 'Follow-up Consultation',
      doctorName: 'Dr. Rajesh Sharma',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Follow-up for previous visit.',
      createdAt: '2026-09-25T09:00:00Z',
    },
    {
      id: 'apt-7',
      patientId: 'pat-5',
      patientName: 'Sophia Rodriguez',
      patientPhone: '+1 (555) 678-9012',
      date: today,
      time: '13:15',
      reason: 'General Geriatric Wellness Check',
      doctorName: 'Dr. Emily Taylor',
      status: 'Scheduled',
      hasFollowUp: true,
      followUpDate: inThreeDays,
      notes: 'Requires wheelchair assistance upon arrival.',
      createdAt: '2026-09-25T10:30:00Z',
    },
    {
      id: 'apt-8',
      patientId: 'pat-7',
      patientName: 'Priya Patel',
      patientPhone: '+1 (555) 890-1234',
      date: today,
      time: '15:00',
      reason: 'Routine Health Consultation',
      doctorName: 'Dr. Sarah Chen',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'First time visitor to this clinic branch.',
      createdAt: '2026-09-26T08:00:00Z',
    },
    {
      id: 'apt-9',
      patientId: 'pat-10',
      patientName: 'Thomas Sterling',
      patientPhone: '+1 (555) 123-9876',
      date: today,
      time: '16:30',
      reason: 'Routine Blood Pressure Check',
      doctorName: 'Nurse Mark Davis',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Patient requested afternoon appointment.',
      createdAt: '2026-09-26T12:00:00Z',
    },

    // Upcoming appointments
    {
      id: 'apt-10',
      patientId: 'pat-9',
      patientName: 'Grace Hopper-Kim',
      patientPhone: '+1 (555) 012-3456',
      date: tomorrow,
      time: '10:00',
      reason: 'General Wellness Consultation',
      doctorName: 'Dr. Rajesh Sharma',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Confirmed via appointment desk.',
      createdAt: '2026-09-26T14:00:00Z',
    },
    {
      id: 'apt-11',
      patientId: 'pat-1',
      patientName: 'Eleanor Vance',
      patientPhone: '+1 (555) 234-8901',
      date: tomorrow,
      time: '11:30',
      reason: 'Scheduled Routine Follow-up',
      doctorName: 'Dr. Sarah Chen',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Follow-up regarding routine labs.',
      createdAt: '2026-09-25T11:00:00Z',
    },
    {
      id: 'apt-12',
      patientId: 'pat-11',
      patientName: 'Chloe Tremblay',
      patientPhone: '+1 (555) 234-5678',
      date: tomorrow,
      time: '14:00',
      reason: 'College Entrance Health Review',
      doctorName: 'Dr. Emily Taylor',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Immunization record check and signature.',
      createdAt: '2026-09-26T15:00:00Z',
    },
    {
      id: 'apt-13',
      patientId: 'pat-12',
      patientName: 'Arthur Pendelton',
      patientPhone: '+1 (555) 345-8765',
      date: inTwoDays,
      time: '09:00',
      reason: 'Bi-annual General Checkup',
      doctorName: 'Dr. Sarah Chen',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Long-standing clinic patient.',
      createdAt: '2026-09-25T16:00:00Z',
    },
    {
      id: 'apt-14',
      patientId: 'pat-2',
      patientName: 'Marcus Brody',
      patientPhone: '+1 (555) 345-6789',
      date: inTwoDays,
      time: '11:00',
      reason: 'Dietary & Fitness Progress Review',
      doctorName: 'Dr. Rajesh Sharma',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Follow-up consultation.',
      createdAt: '2026-09-26T09:30:00Z',
    },
    {
      id: 'apt-15',
      patientId: 'pat-3',
      patientName: 'Amina Al-Mansoor',
      patientPhone: '+1 (555) 456-7890',
      date: inThreeDays,
      time: '10:30',
      reason: 'Travel Health Immunization Consultation',
      doctorName: 'Nurse Mark Davis',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Review required travel vaccines.',
      createdAt: '2026-09-26T10:15:00Z',
    },
  ];

  const ambulances: Ambulance[] = [
    {
      id: 'amb-1',
      vehicleNumber: 'MED-101',
      callSign: 'ALS Rapid Response 1',
      type: 'Advanced Life Support',
      status: 'Available',
      currentArea: 'Downtown Central Station (0.8 km)',
      driverName: 'Officer Gregory House',
      contactPhone: '+1 (555) 911-0101',
      lastActive: '5 mins ago',
    },
    {
      id: 'amb-2',
      vehicleNumber: 'MED-102',
      callSign: 'ALS Trauma Mobile 2',
      type: 'Advanced Life Support',
      status: 'On Duty',
      currentArea: 'North District Metro Hub (En route to Mercy)',
      driverName: 'Officer Sarah Connor',
      contactPhone: '+1 (555) 911-0102',
      lastActive: '12 mins ago',
    },
    {
      id: 'amb-3',
      vehicleNumber: 'MED-103',
      callSign: 'BLS Community Transit 3',
      type: 'Basic Life Support',
      status: 'Available',
      currentArea: 'Eastside Sector 4 Station (2.1 km)',
      driverName: 'Paramedic Lucas Scott',
      contactPhone: '+1 (555) 911-0103',
      lastActive: '20 mins ago',
    },
    {
      id: 'amb-4',
      vehicleNumber: 'MED-104',
      callSign: 'BLS Rapid Patrol 4',
      type: 'Basic Life Support',
      status: 'On Duty',
      currentArea: 'West Highway Corridor (Dispatched to Maple St)',
      driverName: 'Paramedic Elena Gomez',
      contactPhone: '+1 (555) 911-0104',
      lastActive: '3 mins ago',
    },
    {
      id: 'amb-5',
      vehicleNumber: 'MED-105',
      callSign: 'Patient Transport 5',
      type: 'Patient Transport',
      status: 'Available',
      currentArea: 'South Valley Medical Center Base (3.4 km)',
      driverName: 'Driver Anthony Russo',
      contactPhone: '+1 (555) 911-0105',
      lastActive: '45 mins ago',
    },
    {
      id: 'amb-6',
      vehicleNumber: 'MED-106',
      callSign: 'ALS Specialized 6',
      type: 'Advanced Life Support',
      status: 'Maintenance',
      currentArea: 'Central Fleet Workshop (Service Bay 2)',
      driverName: 'Fleet Tech Team',
      contactPhone: '+1 (555) 911-0106',
      lastActive: 'Scheduled maintenance',
    },
  ];

  const ambulanceRequests: AmbulanceRequest[] = [
    {
      id: 'req-1',
      patientName: 'Arthur Pendelton',
      patientPhone: '+1 (555) 345-8765',
      pickupLocation: '83 Kensington Crescent, Old Town',
      urgency: 'Critical',
      status: 'Dispatched',
      assignedAmbulanceId: 'amb-2',
      assignedVehicleNumber: 'MED-102',
      notes: 'Immediate transport requested by clinic staff. ETA 7 mins.',
      dispatchedAt: '2026-09-27T08:15:00Z',
      createdAt: '2026-09-27T08:10:00Z',
    },
    {
      id: 'req-2',
      patientName: 'Sophia Rodriguez',
      patientPhone: '+1 (555) 678-9012',
      pickupLocation: '509 Horizon Way, Highland',
      urgency: 'Moderate',
      status: 'Dispatched',
      assignedAmbulanceId: 'amb-4',
      assignedVehicleNumber: 'MED-104',
      notes: 'Scheduled transport to regional health center. Paramedic on route.',
      dispatchedAt: '2026-09-27T08:45:00Z',
      createdAt: '2026-09-27T08:40:00Z',
    },
    {
      id: 'req-3',
      patientName: 'Robert Kowalski',
      patientPhone: '+1 (555) 901-2345',
      pickupLocation: '404 Industrial Parkway, Eastgate',
      urgency: 'Critical',
      status: 'Requested',
      notes: 'Workplace coordination call. Immediate dispatch required.',
      createdAt: '2026-09-27T09:05:00Z',
    },
    {
      id: 'req-4',
      patientName: 'Marcus Brody',
      patientPhone: '+1 (555) 345-6789',
      pickupLocation: '1204 Pine Street, Oakridge',
      urgency: 'Standard',
      status: 'Completed',
      assignedAmbulanceId: 'amb-3',
      assignedVehicleNumber: 'MED-103',
      notes: 'Transport successfully completed to City General.',
      dispatchedAt: '2026-09-27T06:30:00Z',
      completedAt: '2026-09-27T07:20:00Z',
      createdAt: '2026-09-27T06:20:00Z',
    },
  ];

  const bloodBanks: BloodBank[] = [
    {
      id: 'bb-1',
      name: 'Central Red Cross Blood Bank',
      address: '100 Medical Center Drive, Downtown',
      area: 'Central / Downtown',
      contact: '+1 (555) 256-6301',
      email: 'dispatch@redcross-central.org',
      operatingHours: '24/7 Emergency Dispatch',
      stock: {
        'A+': 34,
        'A-': 12,
        'B+': 28,
        'B-': 6,
        'AB+': 18,
        'AB-': 4,
        'O+': 52,
        'O-': 8, // Critical reserve
      },
      lastUpdated: '10 mins ago',
    },
    {
      id: 'bb-2',
      name: 'Metro Health Regional Transfusion Center',
      address: '450 North Boulevard, Metro District',
      area: 'North District',
      contact: '+1 (555) 256-6302',
      email: 'blood@metrohealth.org',
      operatingHours: '24/7 Emergency Services',
      stock: {
        'A+': 22,
        'A-': 5,
        'B+': 19,
        'B-': 2, // Low
        'AB+': 14,
        'AB-': 1, // Critical
        'O+': 41,
        'O-': 3, // Low
      },
      lastUpdated: '25 mins ago',
    },
    {
      id: 'bb-3',
      name: 'St. Jude Community Blood Depot',
      address: '77 Hope Way, Eastgate Area',
      area: 'Eastgate',
      contact: '+1 (555) 256-6303',
      email: 'transfusion@stjude-depot.org',
      operatingHours: '06:00 - 22:00 (On-call 24h)',
      stock: {
        'A+': 16,
        'A-': 8,
        'B+': 14,
        'B-': 7,
        'AB+': 9,
        'AB-': 3,
        'O+': 29,
        'O-': 6,
      },
      lastUpdated: '1 hour ago',
    },
    {
      id: 'bb-4',
      name: 'Westside Lifeline Donor Center',
      address: '890 Sunset Expressway, Westside',
      area: 'Westside',
      contact: '+1 (555) 256-6304',
      email: 'contact@lifelinewest.org',
      operatingHours: '24/7 Emergency Dispatch',
      stock: {
        'A+': 45,
        'A-': 14,
        'B+': 32,
        'B-': 9,
        'AB+': 21,
        'AB-': 5,
        'O+': 64,
        'O-': 11,
      },
      lastUpdated: '15 mins ago',
    },
    {
      id: 'bb-5',
      name: 'Valley Care Blood Transfusion Hub',
      address: '320 River Crossing, South Valley',
      area: 'South Valley',
      contact: '+1 (555) 256-6305',
      email: 'bloodhub@valleycare.org',
      operatingHours: '24/7 Operations',
      stock: {
        'A+': 19,
        'A-': 4,
        'B+': 21,
        'B-': 3,
        'AB+': 11,
        'AB-': 2,
        'O+': 36,
        'O-': 4,
      },
      lastUpdated: '35 mins ago',
    },
  ];

  const bloodRequests: BloodRequest[] = [
    {
      id: 'br-1',
      patientName: 'Sophia Rodriguez',
      bloodGroup: 'O-',
      unitsNeeded: 2,
      urgency: 'Emergency',
      hospitalOrClinic: 'City General Hospital (ER Bay 4)',
      contactPhone: '+1 (555) 678-9012',
      status: 'Approved',
      notes: 'Transfer approved from Central Red Cross. Couriers dispatched.',
      createdAt: '2026-09-27T08:20:00Z',
    },
    {
      id: 'br-2',
      patientName: 'Eleanor Vance',
      bloodGroup: 'O+',
      unitsNeeded: 1,
      urgency: 'Urgent',
      hospitalOrClinic: 'Downtown Family Clinic',
      contactPhone: '+1 (555) 234-8901',
      status: 'Pending',
      notes: 'Pre-procedure reserve coordination.',
      createdAt: '2026-09-27T08:50:00Z',
    },
    {
      id: 'br-3',
      patientName: 'James Thornton',
      bloodGroup: 'A-',
      unitsNeeded: 3,
      urgency: 'Emergency',
      hospitalOrClinic: 'Metro Trauma Center',
      contactPhone: '+1 (555) 789-0123',
      status: 'Dispatched',
      notes: 'Units sealed and in transit with Rapid Couriers.',
      createdAt: '2026-09-27T07:40:00Z',
    },
    {
      id: 'br-4',
      patientName: 'Arthur Pendelton',
      bloodGroup: 'B+',
      unitsNeeded: 2,
      urgency: 'Standard',
      hospitalOrClinic: 'St. Mary Care Center',
      contactPhone: '+1 (555) 345-8765',
      status: 'Fulfilled',
      notes: 'Delivery verified by hospital receiving coordinator.',
      createdAt: '2026-09-26T16:00:00Z',
    },
  ];

  const facilities: NearbyFacility[] = [
    {
      id: 'fac-1',
      name: 'City General Hospital & Emergency Center',
      type: 'General Hospital',
      address: '100 Medical Center Drive, Downtown',
      area: 'Downtown',
      distanceKm: 1.2,
      specialties: ['Level 1 Trauma', 'Cardiac Care', 'Neurology', 'Pediatric ICU', 'General Surgery'],
      contact: '+1 (555) 444-1000',
      emergencyLine: '+1 (555) 444-9111',
      capacityStatus: 'Available',
      emergencyServices: true,
    },
    {
      id: 'fac-2',
      name: 'Metro Trauma & Acute Care Center',
      type: 'Trauma Center',
      address: '780 North Expressway, North District',
      area: 'North District',
      distanceKm: 3.5,
      specialties: ['Comprehensive Trauma', 'Burn Unit', 'Orthopedic Surgery', 'Acute Resuscitation'],
      contact: '+1 (555) 444-2000',
      emergencyLine: '+1 (555) 444-9222',
      capacityStatus: 'Busy',
      emergencyServices: true,
    },
    {
      id: 'fac-3',
      name: 'St. Mary Urgent Care & Community Clinic',
      type: 'Community Clinic',
      address: '215 Meadowview Road, Eastgate',
      area: 'Eastgate',
      distanceKm: 2.8,
      specialties: ['Urgent Walk-in Care', 'Minor Injuries', 'Diagnostic Imaging', 'Family Health'],
      contact: '+1 (555) 444-3000',
      emergencyLine: '+1 (555) 444-3111',
      capacityStatus: 'Available',
      emergencyServices: false,
    },
    {
      id: 'fac-4',
      name: 'Westside Pediatric & Family Medical Center',
      type: 'Specialty Hospital',
      address: '940 Westview Boulevard, Westside',
      area: 'Westside',
      distanceKm: 4.1,
      specialties: ['Pediatrics', 'Neonatal Intensive Care', 'Family Medicine', 'Adolescent Care'],
      contact: '+1 (555) 444-4000',
      emergencyLine: '+1 (555) 444-9444',
      capacityStatus: 'Available',
      emergencyServices: true,
    },
    {
      id: 'fac-5',
      name: 'Apex Orthopedic & Surgical Specialty Pavilion',
      type: 'Specialty Hospital',
      address: '55 Innovation Way, South Valley',
      area: 'South Valley',
      distanceKm: 5.6,
      specialties: ['Orthopedic Trauma', 'Spine Center', 'Sports Rehabilitation', 'Joint Replacement'],
      contact: '+1 (555) 444-5000',
      emergencyLine: '+1 (555) 444-5111',
      capacityStatus: 'Critical Capacity',
      emergencyServices: false,
    },
  ];

  return {
    patients,
    appointments,
    ambulances,
    ambulanceRequests,
    bloodBanks,
    bloodRequests,
    facilities,
  };
}

// Database helper functions
export function getDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const seed = generateInitialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }

  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading DB, re-initializing seed:', error);
    const seed = generateInitialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
}

export function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function resetDbToSeed(): DatabaseSchema {
  const seed = generateInitialSeed();
  saveDb(seed);
  return seed;
}

// Patient Repository
export function getPatients(): Patient[] {
  return getDb().patients;
}

export function getPatientById(id: string): Patient | undefined {
  return getDb().patients.find((p) => p.id === id);
}

export function createPatient(data: Omit<Patient, 'id' | 'createdAt'>): Patient {
  const db = getDb();
  const newPatient: Patient = {
    ...data,
    id: `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  db.patients.unshift(newPatient);
  saveDb(db);
  return newPatient;
}

export function searchPatients(query: string): Patient[] {
  const db = getDb();
  const q = query.toLowerCase().trim();
  if (!q) return db.patients;
  return db.patients.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.bloodGroup.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
  );
}

// Appointment Repository
export function getAppointments(): Appointment[] {
  return getDb().appointments;
}

export function createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
  const db = getDb();
  const newAppointment: Appointment = {
    ...data,
    id: `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  db.appointments.unshift(newAppointment);
  saveDb(db);
  return newAppointment;
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus): Appointment | null {
  const db = getDb();
  const apt = db.appointments.find((a) => a.id === id);
  if (!apt) return null;
  apt.status = status;
  saveDb(db);
  return apt;
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const db = getDb();
  const index = db.appointments.findIndex((a) => a.id === id);
  if (index === -1) return null;
  db.appointments[index] = { ...db.appointments[index], ...updates };
  saveDb(db);
  return db.appointments[index];
}

// Ambulance Repository
export function getAmbulances(): Ambulance[] {
  return getDb().ambulances;
}

export function updateAmbulanceStatus(id: string, status: AmbulanceStatus): Ambulance | null {
  const db = getDb();
  const amb = db.ambulances.find((a) => a.id === id);
  if (!amb) return null;
  amb.status = status;
  amb.lastActive = 'Just now';
  saveDb(db);
  return amb;
}

// Ambulance Requests
export function getAmbulanceRequests(): AmbulanceRequest[] {
  return getDb().ambulanceRequests;
}

export function createAmbulanceRequest(
  data: Omit<AmbulanceRequest, 'id' | 'createdAt'>
): AmbulanceRequest {
  const db = getDb();
  const newRequest: AmbulanceRequest = {
    ...data,
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };

  // If dispatched with an ambulance, update that ambulance's status to 'On Duty'
  if (data.status === 'Dispatched' && data.assignedAmbulanceId) {
    const amb = db.ambulances.find((a) => a.id === data.assignedAmbulanceId);
    if (amb) {
      amb.status = 'On Duty';
      amb.lastActive = 'Dispatched to call';
    }
  }

  db.ambulanceRequests.unshift(newRequest);
  saveDb(db);
  return newRequest;
}

export function updateAmbulanceRequest(
  id: string,
  updates: Partial<AmbulanceRequest>
): AmbulanceRequest | null {
  const db = getDb();
  const index = db.ambulanceRequests.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const current = db.ambulanceRequests[index];
  const updated = { ...current, ...updates };

  // If status changed to Completed or Cancelled, free up assigned ambulance
  if (
    (updates.status === 'Completed' || updates.status === 'Cancelled') &&
    updated.assignedAmbulanceId
  ) {
    const amb = db.ambulances.find((a) => a.id === updated.assignedAmbulanceId);
    if (amb && amb.status === 'On Duty') {
      amb.status = 'Available';
      amb.lastActive = 'Call completed';
    }
    if (updates.status === 'Completed' && !updated.completedAt) {
      updated.completedAt = new Date().toISOString();
    }
  }

  // If status changed to Dispatched, set ambulance to On Duty
  if (updates.status === 'Dispatched' && updated.assignedAmbulanceId) {
    const amb = db.ambulances.find((a) => a.id === updated.assignedAmbulanceId);
    if (amb) {
      amb.status = 'On Duty';
      amb.lastActive = 'Dispatched to call';
    }
    if (!updated.dispatchedAt) {
      updated.dispatchedAt = new Date().toISOString();
    }
  }

  db.ambulanceRequests[index] = updated;
  saveDb(db);
  return updated;
}

// Blood Bank Repository
export function getBloodBanks(): BloodBank[] {
  return getDb().bloodBanks;
}

export function searchBloodStock(bloodGroup?: BloodGroup, area?: string) {
  const banks = getDb().bloodBanks;
  return banks.map((bank) => ({
    id: bank.id,
    name: bank.name,
    address: bank.address,
    area: bank.area,
    contact: bank.contact,
    operatingHours: bank.operatingHours,
    stock: bloodGroup ? { [bloodGroup]: bank.stock[bloodGroup] || 0 } : bank.stock,
    matchingUnits: bloodGroup ? bank.stock[bloodGroup] || 0 : undefined,
    lastUpdated: bank.lastUpdated,
  })).filter((bank) => {
    if (area && area !== 'All' && !bank.area.toLowerCase().includes(area.toLowerCase())) {
      return false;
    }
    return true;
  });
}

// Blood Requests
export function getBloodRequests(): BloodRequest[] {
  return getDb().bloodRequests;
}

export function createBloodRequest(data: Omit<BloodRequest, 'id' | 'createdAt'>): BloodRequest {
  const db = getDb();
  const newReq: BloodRequest = {
    ...data,
    id: `br-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  db.bloodRequests.unshift(newReq);
  saveDb(db);
  return newReq;
}

export function updateBloodRequestStatus(
  id: string,
  status: BloodRequestStatus
): BloodRequest | null {
  const db = getDb();
  const req = db.bloodRequests.find((r) => r.id === id);
  if (!req) return null;
  req.status = status;
  saveDb(db);
  return req;
}

// Nearby Facilities
export function getNearbyFacilities(): NearbyFacility[] {
  return getDb().facilities;
}

// Dashboard statistics
export function getDashboardStats() {
  const db = getDb();
  const today = getDateOffset(0);

  const totalPatients = db.patients.length;
  const todayAppointments = db.appointments.filter((a) => a.date === today);
  const todayTotal = todayAppointments.length;
  const todayCompleted = todayAppointments.filter((a) => a.status === 'Completed').length;
  const todayScheduled = todayAppointments.filter((a) => a.status === 'Scheduled').length;
  const todayCancelled = todayAppointments.filter(
    (a) => a.status === 'Cancelled' || a.status === 'No-show'
  ).length;

  const totalUpcoming = db.appointments.filter((a) => a.date > today && a.status === 'Scheduled').length;

  const availableAmbulances = db.ambulances.filter((a) => a.status === 'Available').length;
  const onDutyAmbulances = db.ambulances.filter((a) => a.status === 'On Duty').length;
  const activeAmbulanceRequests = db.ambulanceRequests.filter(
    (r) => r.status === 'Requested' || r.status === 'Dispatched'
  ).length;

  const pendingBloodRequests = db.bloodRequests.filter(
    (b) => b.status === 'Pending' || b.status === 'Approved'
  ).length;

  // Due follow-ups (today or past due without completion)
  const dueFollowUps = db.appointments.filter(
    (a) => a.hasFollowUp && a.followUpDate && a.followUpDate <= today
  );

  return {
    totalPatients,
    todayTotal,
    todayCompleted,
    todayScheduled,
    todayCancelled,
    totalUpcoming,
    availableAmbulances,
    totalAmbulances: db.ambulances.length,
    onDutyAmbulances,
    activeAmbulanceRequests,
    pendingBloodRequests,
    dueFollowUpsCount: dueFollowUps.length,
    todayDate: today,
  };
}
