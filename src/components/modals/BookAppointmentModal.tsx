'use client';

import React, { useState, useEffect } from 'react';
import { X, CalendarPlus, Search, User, Clock, BellRing, UserPlus } from 'lucide-react';
import { Patient, Appointment } from '@/types';
import { useToast } from '../ToastContext';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  preselectedPatient?: Patient | null;
  onAppointmentBooked: () => void;
  onOpenRegisterPatientModal: () => void;
}

const DEFAULT_DOCTORS = [
  'Dr. Aditi Joshi',
  'Dr. Rajesh Kulkarni',
  'Dr. Sneha Patil',
  'Dr. Vikram Shinde',
  'Sister Pooja Thorat',
];

const COMMON_REASONS = [
  'General Health Checkup',
  'Routine Consultation',
  'Follow-up Visit',
  'Seasonal Vaccination',
  'Blood Pressure & Vitals Check',
  'Workplace Physical Screening',
  'Annual Health Review',
  'Administrative Form Certification',
];

const TIME_SLOTS = [
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

export default function BookAppointmentModal({
  isOpen,
  onClose,
  patients,
  preselectedPatient,
  onAppointmentBooked,
  onOpenRegisterPatientModal,
}: BookAppointmentModalProps) {
  const { showToast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:30');
  const [reason, setReason] = useState(COMMON_REASONS[0]);
  const [doctorName, setDoctorName] = useState(DEFAULT_DOCTORS[0]);
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedPatient) {
      setSelectedPatientId(preselectedPatient.id);
    } else if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [preselectedPatient, patients, selectedPatientId]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const activeSelectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !activeSelectedPatient) {
      showToast('error', 'Select Patient', 'Please select a patient for the appointment');
      return;
    }
    if (!date || !time || !reason || !doctorName) {
      showToast('error', 'Missing Information', 'Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activeSelectedPatient.id,
          patientName: activeSelectedPatient.name,
          patientPhone: activeSelectedPatient.phone,
          date,
          time,
          reason,
          doctorName,
          status: 'Scheduled',
          hasFollowUp,
          followUpDate: hasFollowUp && followUpDate ? followUpDate : undefined,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          'success',
          'Appointment Booked!',
          `Scheduled for ${activeSelectedPatient.name} on ${date} at ${time} with ${doctorName}.`
        );
        onAppointmentBooked();
        onClose();
      } else {
        showToast('error', 'Booking Failed', data.error);
      }
    } catch {
      showToast('error', 'Error', 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Book Patient Appointment</h3>
              <p className="text-xs text-slate-500">
                Administrative scheduling & staff assignment (non-clinical)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Select Patient <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegisterPatientModal();
                }}
                className="text-xs text-teal-600 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> + New Patient
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Type to filter registered patients..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            {/* Patient dropdown */}
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs sm:text-sm font-medium"
            >
              <option value="">-- Choose a Patient --</option>
              {filteredPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone}) - {p.bloodGroup}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Slot <span className="text-rose-500">*</span>
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-mono text-xs"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctor & Staff Assignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Doctor / Staff <span className="text-rose-500">*</span>
            </label>
            <select
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
            >
              {DEFAULT_DOCTORS.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* Reason (Strictly non-diagnostic) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Visit (Administrative) <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs"
              >
                {COMMON_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="Custom">Custom Administrative Note...</option>
              </select>
              {reason === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter reason (e.g. Health certification review)"
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs"
                />
              )}
            </div>
          </div>

          {/* Follow-up Reminder Checkbox & Date */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={hasFollowUp}
                onChange={(e) => setHasFollowUp(e.target.checked)}
                className="rounded-sm text-teal-600 focus:ring-teal-500"
              />
              <span className="flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                Schedule Administrative Follow-up Reminder
              </span>
            </label>

            {hasFollowUp && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Follow-up Due Date:
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          {/* Administrative Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Administrative Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. First visit, requires insurance check, wheelchair access"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
