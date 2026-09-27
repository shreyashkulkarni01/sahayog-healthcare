'use client';

import React from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Ambulance,
  Droplet,
  BellRing,
  ArrowRight,
  UserPlus,
  CalendarPlus,
  Siren,
  Phone,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Appointment, Patient, AmbulanceRequest, BloodRequest, AppointmentStatus } from '@/types';
import { useToast } from './ToastContext';

interface DashboardStats {
  totalPatients: number;
  todayTotal: number;
  todayCompleted: number;
  todayScheduled: number;
  todayCancelled: number;
  totalUpcoming: number;
  availableAmbulances: number;
  totalAmbulances: number;
  onDutyAmbulances: number;
  activeAmbulanceRequests: number;
  pendingBloodRequests: number;
  dueFollowUpsCount: number;
  todayDate: string;
}

interface DashboardViewProps {
  stats: DashboardStats | null;
  todayAppointments: Appointment[];
  activeAmbulanceRequests: AmbulanceRequest[];
  pendingBloodRequests: BloodRequest[];
  patients: Patient[];
  onOpenBookModal: () => void;
  onOpenPatientModal: () => void;
  onOpenAmbulanceModal: () => void;
  onOpenBloodModal: () => void;
  onSelectTab: (tab: string) => void;
  onRefreshData: () => void;
  onSelectPatient: (patientId: string) => void;
}

export default function DashboardView({
  stats,
  todayAppointments,
  activeAmbulanceRequests,
  pendingBloodRequests,
  patients,
  onOpenBookModal,
  onOpenPatientModal,
  onOpenAmbulanceModal,
  onOpenBloodModal,
  onSelectTab,
  onRefreshData,
  onSelectPatient,
}: DashboardViewProps) {
  const { showToast } = useToast();

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Status Updated', `Appointment marked as ${newStatus}`);
        onRefreshData();
      } else {
        showToast('error', 'Update Failed', data.error);
      }
    } catch {
      showToast('error', 'Update Error', 'Could not update appointment status');
    }
  };

  const dueFollowUpAppointments = todayAppointments.filter(
    (a) => a.hasFollowUp && a.followUpDate && a.followUpDate <= (stats?.todayDate || '')
  );

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner (Required Constraint: Administrative/Coordination ONLY) */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3 text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-semibold">Notice:</span> This platform is strictly an{' '}
          <span className="font-medium underline">administrative and emergency coordination tool</span>.
          It does not provide medical diagnosis, clinical decision support, or treatment recommendations.
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Appointments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Schedule
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats?.todayTotal ?? 0}
            </span>
            <span className="text-xs text-slate-500">appointments</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> {stats?.todayCompleted ?? 0} completed
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" /> {stats?.todayScheduled ?? 0} pending
            </span>
          </div>
        </div>

        {/* Card 2: Total Registered Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Patients
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats?.totalPatients ?? 0}
            </span>
            <span className="text-xs text-slate-500">active records</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Upcoming: {stats?.totalUpcoming ?? 0} visits</span>
            <button
              onClick={() => onSelectTab('patients')}
              className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              View list <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Ambulance Fleet Readiness */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ambulance Readiness
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ambulance className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {stats?.availableAmbulances ?? 0}
            </span>
            <span className="text-xs text-slate-500">
              of {stats?.totalAmbulances ?? 0} available
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {stats?.onDutyAmbulances ?? 0} on duty
            </span>
            <button
              onClick={() => onSelectTab('ambulances')}
              className="text-rose-600 font-semibold hover:underline inline-flex items-center gap-0.5 ml-auto"
            >
              Fleet board <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Active Emergency Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Emergencies
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Siren className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600">
              {(stats?.activeAmbulanceRequests ?? 0) + (stats?.pendingBloodRequests ?? 0)}
            </span>
            <span className="text-xs text-slate-500">live requests</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              <Ambulance className="w-3 h-3 text-rose-600" /> {stats?.activeAmbulanceRequests ?? 0} amb
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              <Droplet className="w-3 h-3 text-red-600" /> {stats?.pendingBloodRequests ?? 0} blood
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-linear-to-r from-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">Coordination Quick Actions</h2>
            <p className="text-xs text-teal-200/90 mt-0.5">
              Rapidly trigger common administrative and emergency workflows in one click.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onOpenPatientModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-colors border border-white/15"
            >
              <UserPlus className="w-4 h-4 text-teal-300" />
              <span>Register Patient</span>
            </button>
            <button
              onClick={onOpenBookModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-colors shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={onOpenAmbulanceModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors shadow-sm"
            >
              <Ambulance className="w-4 h-4" />
              <span>Request Ambulance</span>
            </button>
            <button
              onClick={onOpenBloodModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-red-700 hover:bg-red-600 text-white rounded-xl transition-colors shadow-sm"
            >
              <Droplet className="w-4 h-4" />
              <span>Search Blood</span>
            </button>
          </div>
        </div>
      </div>

      {/* Due Follow-up Reminders Banner (Phase 3 Requirement) */}
      {dueFollowUpAppointments.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">
                Follow-up Reminders Due Today ({dueFollowUpAppointments.length})
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-medium">Requires staff contact</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {dueFollowUpAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{apt.patientName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Reason: {apt.reason} • Doctor: {apt.doctorName}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                    {apt.patientPhone}
                  </div>
                </div>
                <button
                  onClick={() => {
                    showToast(
                      'info',
                      'Staff Action Logged',
                      `Simulated call to ${apt.patientName} (${apt.patientPhone}) for follow-up verification.`
                    );
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Patient</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Today's Appointments & Live Emergency Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Appointment Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage appointment arrivals and update consultation status
              </p>
            </div>
            <button
              onClick={() => onSelectTab('appointments')}
              className="text-xs font-semibold text-teal-600 hover:underline inline-flex items-center gap-1"
            >
              All Appointments <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">No appointments scheduled today</div>
              <p className="text-xs text-slate-400 mt-1">Book an appointment or reset to seed data.</p>
              <button
                onClick={onOpenBookModal}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" /> Book Now
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-11 rounded-lg bg-teal-50 border border-teal-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-teal-900 font-mono">{apt.time}</span>
                      <span className="text-[10px] text-teal-600 font-medium">Slot</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectPatient(apt.patientId)}
                          className="text-sm font-bold text-slate-900 hover:text-teal-600 hover:underline transition-colors text-left"
                        >
                          {apt.patientName}
                        </button>
                        {apt.hasFollowUp && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Follow-up
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        <span className="font-medium text-slate-700">{apt.reason}</span> • Assigned:{' '}
                        <span className="text-slate-700">{apt.doctorName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {apt.patientPhone}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown / Action */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        handleStatusChange(apt.id, e.target.value as AppointmentStatus)
                      }
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                        apt.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : apt.status === 'Scheduled'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : apt.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="No-show">No-show</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 span): Live Emergency Coordination Panel */}
        <div className="space-y-6">
          {/* Active Ambulance Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Ambulance className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Ambulance Calls</h3>
              </div>
              <button
                onClick={() => onSelectTab('ambulances')}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                View all
              </button>
            </div>

            {activeAmbulanceRequests.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                No active ambulance requests.
              </div>
            ) : (
              <div className="space-y-3">
                {activeAmbulanceRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{req.patientName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.urgency === 'Critical'
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </div>
                    <div className="text-slate-600 truncate">📍 {req.pickupLocation}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`font-semibold ${
                          req.status === 'Dispatched' ? 'text-indigo-600' : 'text-amber-600'
                        }`}
                      >
                        ● {req.status}
                        {req.assignedVehicleNumber && ` (${req.assignedVehicleNumber})`}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {req.patientPhone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Urgent Blood Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Urgent Blood Requests</h3>
              </div>
              <button
                onClick={() => onSelectTab('blood-bank')}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Inventory
              </button>
            </div>

            {pendingBloodRequests.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                No active blood requests pending.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBloodRequests.slice(0, 3).map((br) => (
                  <div
                    key={br.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                          {br.bloodGroup}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {br.unitsNeeded} {br.unitsNeeded === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        {br.status}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1 truncate">
                      Patient: <span className="font-medium text-slate-900">{br.patientName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Facility: {br.hospitalOrClinic}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
