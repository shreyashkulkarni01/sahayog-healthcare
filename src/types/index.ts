export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Gender = 'Male' | 'Female' | 'Other';

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';

export type UrgencyLevel = 'Critical' | 'Moderate' | 'Standard';

export type AmbulanceStatus = 'Available' | 'On Duty' | 'Maintenance';

export type AmbulanceRequestStatus = 'Requested' | 'Dispatched' | 'Completed' | 'Cancelled';

export type BloodRequestStatus = 'Pending' | 'Approved' | 'Dispatched' | 'Fulfilled';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  bloodGroup: BloodGroup;
  address: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason: string; // Non-diagnostic administrative reason
  doctorName: string;
  status: AppointmentStatus;
  hasFollowUp: boolean;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  callSign: string;
  type: 'Advanced Life Support' | 'Basic Life Support' | 'Patient Transport';
  status: AmbulanceStatus;
  currentArea: string;
  driverName: string;
  contactPhone: string;
  lastActive: string;
}

export interface AmbulanceRequest {
  id: string;
  patientName: string;
  patientPhone: string;
  pickupLocation: string;
  urgency: UrgencyLevel;
  status: AmbulanceRequestStatus;
  assignedAmbulanceId?: string;
  assignedVehicleNumber?: string;
  notes?: string;
  dispatchedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  area: string;
  contact: string;
  email: string;
  operatingHours: string;
  stock: Record<BloodGroup, number>;
  lastUpdated: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: 'Emergency' | 'Urgent' | 'Standard';
  hospitalOrClinic: string;
  contactPhone: string;
  status: BloodRequestStatus;
  notes?: string;
  createdAt: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  type: 'General Hospital' | 'Specialty Hospital' | 'Community Clinic' | 'Trauma Center';
  address: string;
  area: string;
  distanceKm: number;
  specialties: string[];
  contact: string;
  emergencyLine: string;
  capacityStatus: 'Available' | 'Busy' | 'Critical Capacity';
  emergencyServices: boolean;
}

export interface DatabaseSchema {
  patients: Patient[];
  appointments: Appointment[];
  ambulances: Ambulance[];
  ambulanceRequests: AmbulanceRequest[];
  bloodBanks: BloodBank[];
  bloodRequests: BloodRequest[];
  facilities: NearbyFacility[];
}
