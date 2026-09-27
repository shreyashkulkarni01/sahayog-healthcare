'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MapPin,
  Droplet,
  Calendar,
  X,
  History,
  CalendarPlus,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Patient, Appointment, BloodGroup, Gender } from '@/types';
import { useToast } from './ToastContext';

interface PatientsViewProps {
  patients: Patient[];
  appointments: Appointment[];
  onRefreshData: () => void;
  onOpenRegisterModal: () => void;
  onOpenBookAppointmentForPatient: (patient: Patient) => void;
  selectedPatientId?: string | null;
  onClearSelectedPatient?: () => void;
}

export default function PatientsView({
  patients,
  appointments,
  onRefreshData,
  onOpenRegisterModal,
  onOpenBookAppointmentForPatient,
  selectedPatientId,
  onClearSelectedPatient,
}: PatientsViewProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodFilter, setSelectedBloodFilter] = useState<string>('All');
  const [activePatient, setActivePatient] = useState<Patient | null>(() => {
    if (selectedPatientId) {
      return patients.find((p) => p.id === selectedPatientId) || null;
    }
    return null;
  });

  // Sync if selectedPatientId changes from parent
  React.useEffect(() => {
    if (selectedPatientId) {
      const match = patients.find((p) => p.id === selectedPatientId);
      if (match) setActivePatient(match);
    }
  }, [selectedPatientId, patients]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBlood =
      selectedBloodFilter === 'All' || patient.bloodGroup === selectedBloodFilter;

    return matchesSearch && matchesBlood;
  });

  const getPatientAppointments = (patientId: string): Appointment[] => {
    return appointments
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  };

  const activeAppointments = activePatient ? getPatientAppointments(activePatient.id) : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative patient records, blood profiles, and appointment visit history
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Patient</span>
        </button>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients by name, phone number, address, or blood group..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Blood Group Filter Pill Selector */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 pl-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Blood:
          </span>
          {['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
            <button
              key={group}
              onClick={() => setSelectedBloodFilter(group)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                selectedBloodFilter === group
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-semibold text-slate-800">{filteredPatients.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{patients.length}</span> registered patients
        </span>
        {searchQuery && (
          <span className="text-teal-600 font-medium">Filtered by: "{searchQuery}"</span>
        )}
      </div>

      {/* Patient Table / Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No patients matched your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or blood group filter, or register a new patient.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBloodFilter('All');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 hidden md:table-cell">Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => {
                  const patientVisits = getPatientAppointments(patient.id);
                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => setActivePatient(patient)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-teal-500 to-emerald-400 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {patient.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                              {patient.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {patientVisits.length}{' '}
                              {patientVisits.length === 1 ? 'visit' : 'visits'} recorded
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-medium text-slate-800">{patient.age} yrs</span> •{' '}
                        <span>{patient.gender}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs">
                          <Droplet className="w-3 h-3 fill-red-500" />
                          {patient.bloodGroup}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-slate-700 font-medium">
                          {patient.phone}
                        </span>
                      </td>

                      <td className="py-3 px-4 hidden md:table-cell text-slate-500 text-xs max-w-xs truncate">
                        {patient.address || '—'}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenBookAppointmentForPatient(patient)}
                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Book appointment for this patient"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActivePatient(patient)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-teal-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <span>Profile</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Profile & Visit History Side Drawer (Phase 3 Requirement) */}
      {activePatient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                  {activePatient.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activePatient.name}</h3>
                  <p className="text-xs text-slate-500">Patient ID: {activePatient.id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivePatient(null);
                  if (onClearSelectedPatient) onClearSelectedPatient();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-6 flex-1">
              {/* Demographics Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Basic Patient Demographics
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Age:</span>
                    <span className="ml-1.5 font-bold text-slate-800">{activePatient.age} yrs</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Gender:</span>
                    <span className="ml-1.5 font-bold text-slate-800">{activePatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Blood Group:</span>
                    <span className="ml-1.5 inline-flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                      <Droplet className="w-3 h-3 fill-red-500" /> {activePatient.bloodGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <span className="ml-1.5 font-mono font-medium text-slate-800">
                      {activePatient.phone}
                    </span>
                  </div>
                </div>

                <div className="text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Address:</span>
                  <p className="mt-0.5 font-medium text-slate-800">
                    {activePatient.address || 'No address provided'}
                  </p>
                </div>
              </div>

              {/* Action: Book Appointment for this patient */}
              <button
                onClick={() => {
                  onOpenBookAppointmentForPatient(activePatient);
                  setActivePatient(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Book New Appointment for {activePatient.name}</span>
              </button>

              {/* Visit History Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Appointment Visit History ({activeAppointments.length})
                    </h4>
                  </div>
                </div>

                {activeAppointments.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
                    No visit records found for this patient yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{apt.date}</span>
                            <span className="font-mono text-slate-500">@{apt.time}</span>
                          </div>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                              apt.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : apt.status === 'Scheduled'
                                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                : apt.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <div className="text-slate-700">
                          <span className="font-medium text-slate-500">Reason:</span> {apt.reason}
                        </div>

                        <div className="text-slate-600 flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                          <span>Doctor: {apt.doctorName}</span>
                          {apt.hasFollowUp && (
                            <span className="text-amber-700 font-medium">
                              Follow-up: {apt.followUpDate || 'Due soon'}
                            </span>
                          )}
                        </div>

                        {apt.notes && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                            "{apt.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
