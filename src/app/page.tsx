'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { ToastProvider, useToast } from '@/components/ToastContext';
import DashboardView from '@/components/DashboardView';
import PatientsView from '@/components/PatientsView';
import AppointmentsView from '@/components/AppointmentsView';
import AmbulanceView from '@/components/AmbulanceView';
import BloodBankView from '@/components/BloodBankView';
import FacilitiesView from '@/components/FacilitiesView';
import AnalyticsView from '@/components/AnalyticsView';

// Modals
import RegisterPatientModal from '@/components/modals/RegisterPatientModal';
import BookAppointmentModal from '@/components/modals/BookAppointmentModal';
import RequestAmbulanceModal from '@/components/modals/RequestAmbulanceModal';
import EmergencyBloodRequestModal from '@/components/modals/EmergencyBloodRequestModal';
import RapidEmergencyModal from '@/components/modals/RapidEmergencyModal';

import {
  Patient,
  Appointment,
  Ambulance,
  AmbulanceRequest,
  BloodBank,
  BloodRequest,
  NearbyFacility,
  BloodGroup,
} from '@/types';

import {
  LayoutDashboard,
  Users,
  Calendar,
  Ambulance as AmbulanceIcon,
  Droplet,
  Building2,
  BarChart3,
  Loader2,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';

function MainPlatformContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);

  // Core data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [ambulanceRequests, setAmbulanceRequests] = useState<AmbulanceRequest[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Modals state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isRegisterPatientModalOpen, setIsRegisterPatientModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookPreselectedPatient, setBookPreselectedPatient] = useState<Patient | null>(null);
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [isBloodModalOpen, setIsBloodModalOpen] = useState(false);
  const [preselectedBloodGroup, setPreselectedBloodGroup] = useState<BloodGroup | undefined>(undefined);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Fetch all platform data
  const fetchData = useCallback(async () => {
    try {
      const [
        patientsRes,
        appointmentsRes,
        ambulancesRes,
        ambulanceReqsRes,
        bloodBanksRes,
        bloodReqsRes,
        facilitiesRes,
        statsRes,
      ] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/appointments'),
        fetch('/api/ambulances'),
        fetch('/api/ambulance-requests'),
        fetch('/api/blood-banks'),
        fetch('/api/blood-requests'),
        fetch('/api/facilities'),
        fetch('/api/stats'),
      ]);

      const [
        patientsData,
        appointmentsData,
        ambulancesData,
        ambulanceReqsData,
        bloodBanksData,
        bloodReqsData,
        facilitiesData,
        statsData,
      ] = await Promise.all([
        patientsRes.json(),
        appointmentsRes.json(),
        ambulancesRes.json(),
        ambulanceReqsRes.json(),
        bloodBanksRes.json(),
        bloodReqsRes.json(),
        facilitiesRes.json(),
        statsRes.json(),
      ]);

      if (patientsData.success) setPatients(patientsData.data);
      if (appointmentsData.success) setAppointments(appointmentsData.data);
      if (ambulancesData.success) setAmbulances(ambulancesData.data);
      if (ambulanceReqsData.success) setAmbulanceRequests(ambulanceReqsData.data);
      if (bloodBanksData.success) setBloodBanks(bloodBanksData.data);
      if (bloodReqsData.success) setBloodRequests(bloodReqsData.data);
      if (facilitiesData.success) setFacilities(facilitiesData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching healthcare data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Today's appointments filtered
  const today = stats?.todayDate || new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === today);

  // Active emergencies count
  const activeEmergencyCount =
    (stats?.activeAmbulanceRequests || 0) + (stats?.pendingBloodRequests || 0);

  const handleOpenBookForPatient = (patient: Patient) => {
    setBookPreselectedPatient(patient);
    setIsBookModalOpen(true);
  };

  const handleOpenBloodModalWithGroup = (group?: BloodGroup) => {
    setPreselectedBloodGroup(group);
    setIsBloodModalOpen(true);
  };

  const handleSelectPatientFromAppointment = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <Header
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onDataRefresh={fetchData}
        activeEmergencyCount={activeEmergencyCount}
      />

      {/* Main Tab Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'patients'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Patients</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'patients'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {patients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'appointments'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'appointments'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {appointments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ambulances')}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'ambulances'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AmbulanceIcon className="w-4 h-4" />
              <span>Ambulances</span>
              {stats?.activeAmbulanceRequests > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 font-extrabold animate-pulse">
                  {stats.activeAmbulanceRequests}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('blood-bank')}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'blood-bank'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Droplet className="w-4 h-4 fill-current" />
              <span>Blood Bank</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'blood-bank'
                    ? 'bg-red-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {bloodBanks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'facilities'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Hospitals & Clinics</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'analytics'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Reports</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            <div className="text-sm font-bold text-slate-700">Loading Sahayog Coordination Platform...</div>
            <p className="text-xs text-slate-400">Syncing seeded records and live fleet status (Pune Network)</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                todayAppointments={todayAppointments}
                activeAmbulanceRequests={ambulanceRequests.filter(
                  (r) => r.status === 'Requested' || r.status === 'Dispatched'
                )}
                pendingBloodRequests={bloodRequests.filter(
                  (b) => b.status === 'Pending' || b.status === 'Approved'
                )}
                patients={patients}
                onOpenBookModal={() => {
                  setBookPreselectedPatient(null);
                  setIsBookModalOpen(true);
                }}
                onOpenPatientModal={() => setIsRegisterPatientModalOpen(true)}
                onOpenAmbulanceModal={() => setIsAmbulanceModalOpen(true)}
                onOpenBloodModal={() => handleOpenBloodModalWithGroup()}
                onSelectTab={setActiveTab}
                onRefreshData={fetchData}
                onSelectPatient={handleSelectPatientFromAppointment}
              />
            )}

            {activeTab === 'patients' && (
              <PatientsView
                patients={patients}
                appointments={appointments}
                onRefreshData={fetchData}
                onOpenRegisterModal={() => setIsRegisterPatientModalOpen(true)}
                onOpenBookAppointmentForPatient={handleOpenBookForPatient}
                selectedPatientId={selectedPatientId}
                onClearSelectedPatient={() => setSelectedPatientId(null)}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsView
                appointments={appointments}
                patients={patients}
                onRefreshData={fetchData}
                onOpenBookModal={() => {
                  setBookPreselectedPatient(null);
                  setIsBookModalOpen(true);
                }}
                onSelectPatient={handleSelectPatientFromAppointment}
              />
            )}

            {activeTab === 'ambulances' && (
              <AmbulanceView
                ambulances={ambulances}
                requests={ambulanceRequests}
                onRefreshData={fetchData}
                onOpenNewRequestModal={() => setIsAmbulanceModalOpen(true)}
              />
            )}

            {activeTab === 'blood-bank' && (
              <BloodBankView
                bloodBanks={bloodBanks}
                bloodRequests={bloodRequests}
                onRefreshData={fetchData}
                onOpenNewBloodRequestModal={handleOpenBloodModalWithGroup}
              />
            )}

            {activeTab === 'facilities' && (
              <FacilitiesView facilities={facilities} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                appointments={appointments}
                ambulances={ambulances}
                bloodBanks={bloodBanks}
                ambulanceRequests={ambulanceRequests}
                bloodRequests={bloodRequests}
              />
            )}
          </>
        )}
      </main>

      {/* Footer & Compliance Notice */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-800">Sahayog Healthcare Coordination Platform (Pune, Maharashtra)</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              v1.0-MVP
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-center sm:text-right">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Strictly administrative & coordination tool. No clinical diagnostic or medical decision-making capability.
            </span>
          </div>
        </div>
      </footer>

      {/* Modals Container */}
      <RegisterPatientModal
        isOpen={isRegisterPatientModalOpen}
        onClose={() => setIsRegisterPatientModalOpen(false)}
        onPatientCreated={fetchData}
      />

      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookPreselectedPatient(null);
        }}
        patients={patients}
        preselectedPatient={bookPreselectedPatient}
        onAppointmentBooked={fetchData}
        onOpenRegisterPatientModal={() => setIsRegisterPatientModalOpen(true)}
      />

      <RequestAmbulanceModal
        isOpen={isAmbulanceModalOpen}
        onClose={() => setIsAmbulanceModalOpen(false)}
        patients={patients}
        ambulances={ambulances}
        onRequestCreated={fetchData}
      />

      <EmergencyBloodRequestModal
        isOpen={isBloodModalOpen}
        onClose={() => setIsBloodModalOpen(false)}
        patients={patients}
        facilities={facilities}
        preselectedGroup={preselectedBloodGroup}
        onRequestCreated={fetchData}
      />

      <RapidEmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        patients={patients}
        ambulances={ambulances}
        bloodBanks={bloodBanks}
        onRefreshData={fetchData}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsEmergencyModalOpen(false);
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <MainPlatformContent />
    </ToastProvider>
  );
}
