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

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory cache for fast read/writes and serverless resilience
let globalMemoryDb: DatabaseSchema | null = null;

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
      name: 'Aarav Kulkarni',
      age: 42,
      gender: 'Male',
      phone: '+91 98220 14582',
      bloodGroup: 'O+',
      address: 'Flat 302, Rohan Tarang, Wakad, Pune 411057',
      createdAt: '2026-09-01T09:00:00Z',
    },
    {
      id: 'pat-2',
      name: 'Sunita Deshmukh',
      age: 58,
      gender: 'Female',
      phone: '+91 98501 23490',
      bloodGroup: 'A+',
      address: '14 Mayur Colony, Paud Road, Kothrud, Pune 411038',
      createdAt: '2026-09-03T11:20:00Z',
    },
    {
      id: 'pat-3',
      name: 'Ananya Iyer',
      age: 29,
      gender: 'Female',
      phone: '+91 99234 56781',
      bloodGroup: 'B-',
      address: 'A-401, Clover Highlands, NIBM Road, Kondhwa, Pune 411048',
      createdAt: '2026-09-05T14:15:00Z',
    },
    {
      id: 'pat-4',
      name: 'Rajesh Patil',
      age: 35,
      gender: 'Male',
      phone: '+91 98602 34512',
      bloodGroup: 'AB+',
      address: 'Flat 12, Amar Paradigm, Baner Road, Baner, Pune 411045',
      createdAt: '2026-09-10T10:00:00Z',
    },
    {
      id: 'pat-5',
      name: 'Kavita Joshi',
      age: 67,
      gender: 'Female',
      phone: '+91 97654 89012',
      bloodGroup: 'O-',
      address: '509 Prabhat Road, Lane 14, Deccan Gymkhana, Pune 411004',
      createdAt: '2026-09-12T08:30:00Z',
    },
    {
      id: 'pat-6',
      name: 'Vikram Shinde',
      age: 24,
      gender: 'Male',
      phone: '+91 98908 76543',
      bloodGroup: 'A-',
      address: '18 Nilgiri Heights, Shivaji Nagar, Pune 411005',
      createdAt: '2026-09-14T15:45:00Z',
    },
    {
      id: 'pat-7',
      name: 'Priya Sharma',
      age: 38,
      gender: 'Female',
      phone: '+91 98231 67890',
      bloodGroup: 'B+',
      address: '920 Konark Nagar, Sakore Nagar, Viman Nagar, Pune 411014',
      createdAt: '2026-09-15T12:00:00Z',
    },
    {
      id: 'pat-8',
      name: 'Deepak Gaikwad',
      age: 51,
      gender: 'Male',
      phone: '+91 94220 34567',
      bloodGroup: 'AB-',
      address: '404 Cosmos, Magarpatta City, Hadapsar, Pune 411028',
      createdAt: '2026-09-18T09:15:00Z',
    },
    {
      id: 'pat-9',
      name: 'Neha More',
      age: 31,
      gender: 'Female',
      phone: '+91 98811 45678',
      bloodGroup: 'O+',
      address: '27 Rajiv Gandhi Infotech Park, Hinjawadi Phase 1, Pune 411057',
      createdAt: '2026-09-20T16:20:00Z',
    },
    {
      id: 'pat-10',
      name: 'Rameshwar Bhalerao',
      age: 73,
      gender: 'Male',
      phone: '+91 98225 67891',
      bloodGroup: 'A+',
      address: '612 Sahakar Nagar No. 2, Near Taljai Hills, Parvati, Pune 411009',
      createdAt: '2026-09-21T11:00:00Z',
    },
    {
      id: 'pat-11',
      name: 'Pooja Jadhav',
      age: 19,
      gender: 'Female',
      phone: '+91 97630 12345',
      bloodGroup: 'O-',
      address: '108 Bharati Vidyapeeth Campus Road, Katraj, Pune 411046',
      createdAt: '2026-09-22T13:40:00Z',
    },
    {
      id: 'pat-12',
      name: 'Dattatray Gokhale',
      age: 62,
      gender: 'Male',
      phone: '+91 98509 87654',
      bloodGroup: 'B+',
      address: '83 Lokmanya Nagar, Near SP College, Sadashiv Peth, Pune 411030',
      createdAt: '2026-09-23T10:10:00Z',
    },
  ];

  const appointments: Appointment[] = [
    // Past appointments
    {
      id: 'apt-1',
      patientId: 'pat-1',
      patientName: 'Aarav Kulkarni',
      patientPhone: '+91 98220 14582',
      date: twoDaysAgo,
      time: '09:00',
      reason: 'Annual Routine Health Checkup',
      doctorName: 'Dr. Aditi Joshi',
      status: 'Completed',
      hasFollowUp: true,
      followUpDate: tomorrow,
      notes: 'Routine visit completed. Requested follow-up for routine blood panel review.',
      createdAt: '2026-09-20T08:00:00Z',
    },
    {
      id: 'apt-2',
      patientId: 'pat-2',
      patientName: 'Sunita Deshmukh',
      patientPhone: '+91 98501 23490',
      date: twoDaysAgo,
      time: '11:30',
      reason: 'Consultation & Dietary Review',
      doctorName: 'Dr. Rajesh Kulkarni',
      status: 'Completed',
      hasFollowUp: false,
      notes: 'General lifestyle counseling completed.',
      createdAt: '2026-09-20T10:00:00Z',
    },
    {
      id: 'apt-3',
      patientId: 'pat-6',
      patientName: 'Vikram Shinde',
      patientPhone: '+91 98908 76543',
      date: yesterday,
      time: '10:00',
      reason: 'Seasonal Influenza Vaccination',
      doctorName: 'Sister Pooja Thorat',
      status: 'Completed',
      hasFollowUp: false,
      notes: 'Routine vaccine administered.',
      createdAt: '2026-09-22T09:00:00Z',
    },
    {
      id: 'apt-4',
      patientId: 'pat-8',
      patientName: 'Deepak Gaikwad',
      patientPhone: '+91 94220 34567',
      date: yesterday,
      time: '14:30',
      reason: 'General Follow-up Visit',
      doctorName: 'Dr. Sneha Patil',
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
      patientName: 'Ananya Iyer',
      patientPhone: '+91 99234 56781',
      date: today,
      time: '09:30',
      reason: 'Workplace Physical Screening',
      doctorName: 'Dr. Aditi Joshi',
      status: 'Completed',
      hasFollowUp: false,
      notes: 'Physical checkup clearance paperwork issued.',
      createdAt: '2026-09-25T08:00:00Z',
    },
    {
      id: 'apt-6',
      patientId: 'pat-4',
      patientName: 'Rajesh Patil',
      patientPhone: '+91 98602 34512',
      date: today,
      time: '11:00',
      reason: 'Follow-up Consultation',
      doctorName: 'Dr. Rajesh Kulkarni',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Follow-up for previous visit.',
      createdAt: '2026-09-25T09:00:00Z',
    },
    {
      id: 'apt-7',
      patientId: 'pat-5',
      patientName: 'Kavita Joshi',
      patientPhone: '+91 97654 89012',
      date: today,
      time: '13:15',
      reason: 'General Geriatric Wellness Check',
      doctorName: 'Dr. Sneha Patil',
      status: 'Scheduled',
      hasFollowUp: true,
      followUpDate: inThreeDays,
      notes: 'Requires wheelchair assistance upon arrival at clinic entrance.',
      createdAt: '2026-09-25T10:30:00Z',
    },
    {
      id: 'apt-8',
      patientId: 'pat-7',
      patientName: 'Priya Sharma',
      patientPhone: '+91 98231 67890',
      date: today,
      time: '15:00',
      reason: 'Routine Health Consultation',
      doctorName: 'Dr. Aditi Joshi',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'First time visitor to this clinic branch.',
      createdAt: '2026-09-26T08:00:00Z',
    },
    {
      id: 'apt-9',
      patientId: 'pat-10',
      patientName: 'Rameshwar Bhalerao',
      patientPhone: '+91 98225 67891',
      date: today,
      time: '16:30',
      reason: 'Routine Blood Pressure Check',
      doctorName: 'Sister Pooja Thorat',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Patient requested afternoon appointment slot.',
      createdAt: '2026-09-26T12:00:00Z',
    },

    // Upcoming appointments
    {
      id: 'apt-10',
      patientId: 'pat-9',
      patientName: 'Neha More',
      patientPhone: '+91 98811 45678',
      date: tomorrow,
      time: '10:00',
      reason: 'General Wellness Consultation',
      doctorName: 'Dr. Rajesh Kulkarni',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Confirmed via appointment desk.',
      createdAt: '2026-09-26T14:00:00Z',
    },
    {
      id: 'apt-11',
      patientId: 'pat-1',
      patientName: 'Aarav Kulkarni',
      patientPhone: '+91 98220 14582',
      date: tomorrow,
      time: '11:30',
      reason: 'Scheduled Routine Follow-up',
      doctorName: 'Dr. Aditi Joshi',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Follow-up regarding routine labs.',
      createdAt: '2026-09-25T11:00:00Z',
    },
    {
      id: 'apt-12',
      patientId: 'pat-11',
      patientName: 'Pooja Jadhav',
      patientPhone: '+91 97630 12345',
      date: tomorrow,
      time: '14:00',
      reason: 'College Entrance Health Review',
      doctorName: 'Dr. Sneha Patil',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Immunization record check and signature.',
      createdAt: '2026-09-26T15:00:00Z',
    },
    {
      id: 'apt-13',
      patientId: 'pat-12',
      patientName: 'Dattatray Gokhale',
      patientPhone: '+91 98509 87654',
      date: inTwoDays,
      time: '09:00',
      reason: 'Bi-annual General Checkup',
      doctorName: 'Dr. Aditi Joshi',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Long-standing clinic patient.',
      createdAt: '2026-09-25T16:00:00Z',
    },
    {
      id: 'apt-14',
      patientId: 'pat-2',
      patientName: 'Sunita Deshmukh',
      patientPhone: '+91 98501 23490',
      date: inTwoDays,
      time: '11:00',
      reason: 'Dietary & Fitness Progress Review',
      doctorName: 'Dr. Rajesh Kulkarni',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Follow-up consultation.',
      createdAt: '2026-09-26T09:30:00Z',
    },
    {
      id: 'apt-15',
      patientId: 'pat-3',
      patientName: 'Ananya Iyer',
      patientPhone: '+91 99234 56781',
      date: inThreeDays,
      time: '10:30',
      reason: 'Travel Health Immunization Consultation',
      doctorName: 'Sister Pooja Thorat',
      status: 'Scheduled',
      hasFollowUp: false,
      notes: 'Review required travel vaccines.',
      createdAt: '2026-09-26T10:15:00Z',
    },
  ];

  const ambulances: Ambulance[] = [
    {
      id: 'amb-1',
      vehicleNumber: 'MH-12-PA-101',
      callSign: 'ALS Swargate Rapid 1',
      type: 'Advanced Life Support',
      status: 'Available',
      currentArea: 'Swargate Chowk Central Depot, Pune (0.8 km)',
      driverName: 'Sachin Salunkhe',
      contactPhone: '+91 98221 10101',
      lastActive: '5 mins ago',
    },
    {
      id: 'amb-2',
      vehicleNumber: 'MH-12-PA-102',
      callSign: 'ALS Kothrud Trauma Unit 2',
      type: 'Advanced Life Support',
      status: 'On Duty',
      currentArea: 'Paud Road, Kothrud (En route to Deenanath Hospital)',
      driverName: 'Santosh Jadhav',
      contactPhone: '+91 98221 10102',
      lastActive: '12 mins ago',
    },
    {
      id: 'amb-3',
      vehicleNumber: 'MH-12-PB-103',
      callSign: 'BLS Shivaji Nagar Transit 3',
      type: 'Basic Life Support',
      status: 'Available',
      currentArea: 'JM Road / Deccan Station, Pune (1.8 km)',
      driverName: 'Mangesh Pawar',
      contactPhone: '+91 98221 10103',
      lastActive: '20 mins ago',
    },
    {
      id: 'amb-4',
      vehicleNumber: 'MH-14-EM-104',
      callSign: 'BLS Hinjawadi IT Patrol 4',
      type: 'Basic Life Support',
      status: 'On Duty',
      currentArea: 'Wakad Bridge Corridor (Dispatched to Hinjawadi Phase 1)',
      driverName: 'Ganesh Shinde',
      contactPhone: '+91 98221 10104',
      lastActive: '3 mins ago',
    },
    {
      id: 'amb-5',
      vehicleNumber: 'MH-12-PT-105',
      callSign: 'Patient Transit Hadapsar 5',
      type: 'Patient Transport',
      status: 'Available',
      currentArea: 'Magarpatta South Hub, Hadapsar, Pune (3.4 km)',
      driverName: 'Nitin Gaikwad',
      contactPhone: '+91 98221 10105',
      lastActive: '45 mins ago',
    },
    {
      id: 'amb-6',
      vehicleNumber: 'MH-12-PA-106',
      callSign: 'ALS Specialized Baner 6',
      type: 'Advanced Life Support',
      status: 'Maintenance',
      currentArea: 'Aundh Regional Fleet Workshop (Service Bay 3)',
      driverName: 'Pune Emergency Fleet Tech Team',
      contactPhone: '+91 98221 10106',
      lastActive: 'Scheduled maintenance',
    },
  ];

  const ambulanceRequests: AmbulanceRequest[] = [
    {
      id: 'req-1',
      patientName: 'Dattatray Gokhale',
      patientPhone: '+91 98509 87654',
      pickupLocation: '83 Lokmanya Nagar, Near SP College, Sadashiv Peth, Pune',
      urgency: 'Critical',
      status: 'Dispatched',
      assignedAmbulanceId: 'amb-2',
      assignedVehicleNumber: 'MH-12-PA-102',
      notes: 'Immediate transport requested by clinic staff. ETA 7 mins.',
      dispatchedAt: '2026-09-27T08:15:00Z',
      createdAt: '2026-09-27T08:10:00Z',
    },
    {
      id: 'req-2',
      patientName: 'Kavita Joshi',
      patientPhone: '+91 97654 89012',
      pickupLocation: '509 Prabhat Road, Lane 14, Deccan Gymkhana, Pune',
      urgency: 'Moderate',
      status: 'Dispatched',
      assignedAmbulanceId: 'amb-4',
      assignedVehicleNumber: 'MH-14-EM-104',
      notes: 'Scheduled transport to Sahyadri Super Speciality Hospital.',
      dispatchedAt: '2026-09-27T08:45:00Z',
      createdAt: '2026-09-27T08:40:00Z',
    },
    {
      id: 'req-3',
      patientName: 'Deepak Gaikwad',
      patientPhone: '+91 94220 34567',
      pickupLocation: '404 Cosmos, Magarpatta City, Hadapsar, Pune',
      urgency: 'Critical',
      status: 'Requested',
      notes: 'Workplace coordination call. Immediate dispatch required.',
      createdAt: '2026-09-27T09:05:00Z',
    },
    {
      id: 'req-4',
      patientName: 'Sunita Deshmukh',
      patientPhone: '+91 98501 23490',
      pickupLocation: '14 Mayur Colony, Paud Road, Kothrud, Pune',
      urgency: 'Standard',
      status: 'Completed',
      assignedAmbulanceId: 'amb-3',
      assignedVehicleNumber: 'MH-12-PB-103',
      notes: 'Transport successfully completed to Deenanath Mangeshkar Hospital.',
      dispatchedAt: '2026-09-27T06:30:00Z',
      completedAt: '2026-09-27T07:20:00Z',
      createdAt: '2026-09-27T06:20:00Z',
    },
  ];

  const bloodBanks: BloodBank[] = [
    {
      id: 'bb-1',
      name: 'Janakalyan Blood Centre (Sarasbaug)',
      address: '1003 Shukrawar Peth, Near Sarasbaug, Swargate, Pune 411002',
      area: 'Swargate / Shukrawar Peth, Pune',
      contact: '+91 (020) 2444-9595',
      email: 'dispatch@janakalyanbloodbank.org',
      operatingHours: '24/7 Emergency Dispatch',
      stock: {
        'A+': 38,
        'A-': 14,
        'B+': 32,
        'B-': 7,
        'AB+': 20,
        'AB-': 5,
        'O+': 56,
        'O-': 9, // Critical reserve
      },
      lastUpdated: '10 mins ago',
    },
    {
      id: 'bb-2',
      name: 'Poona Serological Institute & Blood Bank',
      address: '438 Sadashiv Peth, Near Alka Talkies, Tilak Road, Pune 411030',
      area: 'Sadashiv Peth / Deccan, Pune',
      contact: '+91 (020) 2447-1234',
      email: 'transfusion@poonaserological.in',
      operatingHours: '24/7 Emergency Services',
      stock: {
        'A+': 24,
        'A-': 6,
        'B+': 21,
        'B-': 3, // Low
        'AB+': 15,
        'AB-': 2, // Critical
        'O+': 44,
        'O-': 4, // Low
      },
      lastUpdated: '25 mins ago',
    },
    {
      id: 'bb-3',
      name: 'Ruby Hall Clinic Blood Bank & Component Centre',
      address: '40 Sassoon Road, Near Pune Railway Station, Pune 411001',
      area: 'Pune Station / Bund Garden, Pune',
      contact: '+91 (020) 6645-5100',
      email: 'bloodbank@rubyhall.com',
      operatingHours: '24/7 Emergency Dispatch',
      stock: {
        'A+': 46,
        'A-': 16,
        'B+': 36,
        'B-': 10,
        'AB+': 22,
        'AB-': 6,
        'O+': 68,
        'O-': 12,
      },
      lastUpdated: '15 mins ago',
    },
    {
      id: 'bb-4',
      name: 'KEM Hospital Blood Bank (Rasta Peth)',
      address: '489 Sardar Moodliar Road, Rasta Peth, Camp, Pune 411011',
      area: 'Rasta Peth / Camp, Pune',
      contact: '+91 (020) 2612-5600',
      email: 'bloodcentre@kemhospitalpune.org',
      operatingHours: '24/7 Operations',
      stock: {
        'A+': 18,
        'A-': 9,
        'B+': 16,
        'B-': 8,
        'AB+': 10,
        'AB-': 3,
        'O+': 31,
        'O-': 7,
      },
      lastUpdated: '1 hour ago',
    },
    {
      id: 'bb-5',
      name: 'Sahyadri Specialty Blood Centre (Deccan)',
      address: 'Plot No. 30-C, Karve Road, Deccan Gymkhana, Pune 411004',
      area: 'Deccan Gymkhana / Kothrud, Pune',
      contact: '+91 (020) 6721-3000',
      email: 'bloodtransfusion@sahyadrihospitals.com',
      operatingHours: '24/7 Operations',
      stock: {
        'A+': 22,
        'A-': 5,
        'B+': 24,
        'B-': 4,
        'AB+': 12,
        'AB-': 2,
        'O+': 39,
        'O-': 5,
      },
      lastUpdated: '35 mins ago',
    },
  ];

  const bloodRequests: BloodRequest[] = [
    {
      id: 'br-1',
      patientName: 'Kavita Joshi',
      bloodGroup: 'O-',
      unitsNeeded: 2,
      urgency: 'Emergency',
      hospitalOrClinic: 'Sassoon General Hospital (Trauma Bay 4, Pune Station)',
      contactPhone: '+91 97654 89012',
      status: 'Approved',
      notes: 'Transfer approved from Janakalyan Blood Centre. Couriers dispatched on Tilak Road.',
      createdAt: '2026-09-27T08:20:00Z',
    },
    {
      id: 'br-2',
      patientName: 'Aarav Kulkarni',
      bloodGroup: 'O+',
      unitsNeeded: 1,
      urgency: 'Urgent',
      hospitalOrClinic: 'Sahayog Community Clinic (Wakad, Pune)',
      contactPhone: '+91 98220 14582',
      status: 'Pending',
      notes: 'Pre-procedure reserve coordination for outpatient visit.',
      createdAt: '2026-09-27T08:50:00Z',
    },
    {
      id: 'br-3',
      patientName: 'Vikram Shinde',
      bloodGroup: 'A-',
      unitsNeeded: 3,
      urgency: 'Emergency',
      hospitalOrClinic: 'Ruby Hall Clinic (Trauma Unit, Bund Garden, Pune)',
      contactPhone: '+91 98908 76543',
      status: 'Dispatched',
      notes: 'Units sealed and in transit with Rapid Emergency Couriers.',
      createdAt: '2026-09-27T07:40:00Z',
    },
    {
      id: 'br-4',
      patientName: 'Dattatray Gokhale',
      bloodGroup: 'B+',
      unitsNeeded: 2,
      urgency: 'Standard',
      hospitalOrClinic: 'Deenanath Mangeshkar Hospital (Erandwane, Pune)',
      contactPhone: '+91 98509 87654',
      status: 'Fulfilled',
      notes: 'Delivery verified by hospital receiving coordinator in Erandwane.',
      createdAt: '2026-09-26T16:00:00Z',
    },
  ];

  const facilities: NearbyFacility[] = [
    {
      id: 'fac-1',
      name: 'Sassoon General Hospital & Emergency Trauma Center',
      type: 'Trauma Center',
      address: 'Station Road, Near Pune Railway Station, Pune 411001',
      area: 'Pune Station / Central',
      distanceKm: 1.4,
      specialties: ['Level 1 Trauma', 'Emergency Resuscitation', 'Burn Care Unit', 'General Surgery', 'ICU'],
      contact: '+91 (020) 2612-8000',
      emergencyLine: '+91 (020) 2612-9999',
      capacityStatus: 'Busy',
      emergencyServices: true,
    },
    {
      id: 'fac-2',
      name: 'Deenanath Mangeshkar Hospital & Research Center',
      type: 'Specialty Hospital',
      address: 'Near Mhatre Bridge, Erandwane, Pune 411004',
      area: 'Erandwane / Kothrud',
      distanceKm: 3.2,
      specialties: ['Cardiac Emergencies', 'Pediatric ICU', 'Neurology', 'Surgical Oncology', 'Preventive Health'],
      contact: '+91 (020) 4015-1000',
      emergencyLine: '+91 (020) 4015-1111',
      capacityStatus: 'Available',
      emergencyServices: true,
    },
    {
      id: 'fac-3',
      name: 'Ruby Hall Clinic & Multi-Specialty Medical Center',
      type: 'General Hospital',
      address: '40 Sassoon Road, Bund Garden Area, Pune 411001',
      area: 'Bund Garden / Koregaon Park',
      distanceKm: 2.6,
      specialties: ['Interventional Cardiology', 'Trauma & Orthopedics', 'Critical Care', 'Neurotrauma'],
      contact: '+91 (020) 2616-3391',
      emergencyLine: '+91 (020) 6645-5200',
      capacityStatus: 'Available',
      emergencyServices: true,
    },
    {
      id: 'fac-4',
      name: 'Jehangir Hospital & Emergency Unit',
      type: 'Specialty Hospital',
      address: '32 Sassoon Road, Opposite Pune Central, Pune 411001',
      area: 'Camp / Pune Station',
      distanceKm: 2.1,
      specialties: ['Pediatrics', 'Emergency Medicine', 'Nephrology', 'Pulmonology', 'Diagnostic Imaging'],
      contact: '+91 (020) 6681-1000',
      emergencyLine: '+91 (020) 6681-1999',
      capacityStatus: 'Available',
      emergencyServices: true,
    },
    {
      id: 'fac-5',
      name: 'Sahyadri Super Speciality Hospital (Deccan)',
      type: 'Specialty Hospital',
      address: 'Plot No. 30-C, Karve Road, Erandwane, Deccan Gymkhana, Pune 411004',
      area: 'Deccan Gymkhana',
      distanceKm: 4.0,
      specialties: ['Neurology & Neurosurgery', 'Spine Care', 'Hematology', 'Emergency Critical Care'],
      contact: '+91 (020) 6721-3000',
      emergencyLine: '+91 (020) 6721-3999',
      capacityStatus: 'Critical Capacity',
      emergencyServices: true,
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
  if (globalMemoryDb) {
    return globalMemoryDb;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      globalMemoryDb = JSON.parse(data) as DatabaseSchema;
      return globalMemoryDb;
    }

    // Check if bundled project seed file exists
    const bundledFile = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(bundledFile)) {
      const bundledData = fs.readFileSync(bundledFile, 'utf-8');
      globalMemoryDb = JSON.parse(bundledData) as DatabaseSchema;
      try {
        fs.writeFileSync(DB_FILE, bundledData, 'utf-8');
      } catch {}
      return globalMemoryDb;
    }

    const seed = generateInitialSeed();
    globalMemoryDb = seed;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    } catch {}
    return seed;
  } catch (error) {
    console.error('Error reading DB, using memory fallback:', error);
    if (!globalMemoryDb) {
      globalMemoryDb = generateInitialSeed();
    }
    return globalMemoryDb;
  }
}

export function saveDb(data: DatabaseSchema): void {
  globalMemoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist to file, kept in memory cache:', err);
  }
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
