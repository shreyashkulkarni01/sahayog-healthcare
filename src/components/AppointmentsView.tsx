'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Phone,
  BellRing,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Appointment, Patient, AppointmentStatus } from '@/types';
import { useToast } from './ToastContext';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onRefreshData: () => void;
  onOpenBookModal: () => void;
  onSelectPatient: (patientId: string) => void;
}

export default function AppointmentsView({
  appointments,
  patients,
  onRefreshData,
  onOpenBookModal,
  onSelectPatient,
}: AppointmentsViewProps) {
  const { showToast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Past'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('All');

  // Extract unique doctors
  const doctors = Array.from(new Set(appointments.map((a) => a.doctorName))).filter(Boolean);

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

  const filteredAppointments = appointments.filter((apt) => {
    // Time filter
    if (timeFilter === 'Today' && apt.date !== today) return false;
    if (timeFilter === 'Upcoming' && apt.date <= today) return false;
    if (timeFilter === 'Past' && apt.date >= today) return false;

    // Status filter
    if (statusFilter !== 'All' && apt.status !== statusFilter) return false;

    // Doctor filter
    if (selectedDoctor !== 'All' && apt.doctorName !== selectedDoctor) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPatient = apt.patientName.toLowerCase().includes(q);
      const matchDoctor = apt.doctorName.toLowerCase().includes(q);
      const matchReason = apt.reason.toLowerCase().includes(q);
      const matchPhone = apt.patientPhone.toLowerCase().includes(q);
      if (!matchPatient && !matchDoctor && !matchReason && !matchPhone) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Booking CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Appointment Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate patient visits, schedules, status transitions, and follow-up reminders
          </p>
        </div>

        <button
          onClick={onOpenBookModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition-colors shadow-sm"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, doctor, reason, or phone..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Doctor Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="All">All Staff / Doctors</option>
              {doctors.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Tabs & Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Time range tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['All', 'Today', 'Upcoming', 'Past'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                  timeFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 text-xs font-medium">Status:</span>
            {['All', 'Scheduled', 'Completed', 'Cancelled', 'No-show'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 font-semibold rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-semibold text-slate-800">{filteredAppointments.length}</span>{' '}
          appointments
        </span>
        {timeFilter !== 'All' && (
          <span className="text-teal-600 font-medium">Scope: {timeFilter}</span>
        )}
      </div>

      {/* Appointments List / Table */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No appointments match your chosen filter criteria. Try adjusting the filters or book a new
            appointment.
          </p>
          <button
            onClick={onOpenBookModal}
            className="mt-4 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-4 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const isToday = apt.date === today;
                  return (
                    <tr
                      key={apt.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isToday ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-12 h-11 rounded-lg flex flex-col items-center justify-center font-mono shrink-0 border ${
                              isToday
                                ? 'bg-teal-50 text-teal-900 border-teal-200 font-bold'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="text-xs">{apt.time}</span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-500">
                              {isToday ? 'Today' : apt.date.slice(5)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{apt.date}</div>
                            {isToday && (
                              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                                Today
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onSelectPatient(apt.patientId)}
                          className="font-bold text-slate-900 hover:text-teal-600 hover:underline transition-colors text-left"
                        >
                          {apt.patientName}
                        </button>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {apt.patientPhone}
                        </div>
                      </td>

                      {/* Reason & Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800">{apt.reason}</div>
                        {apt.notes && (
                          <div className="text-[11px] text-slate-500 truncate mt-0.5 italic">
                            "{apt.notes}"
                          </div>
                        )}
                      </td>

                      {/* Assigned Staff */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {apt.doctorName}
                      </td>

                      {/* Follow-up flag */}
                      <td className="py-3.5 px-4">
                        {apt.hasFollowUp ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <BellRing className="w-3 h-3 text-amber-600" />
                            <span>{apt.followUpDate || 'Due'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Status Selector Dropdown */}
                      <td className="py-3.5 px-4 text-right">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
