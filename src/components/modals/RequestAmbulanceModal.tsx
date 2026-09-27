'use client';

import React, { useState } from 'react';
import { X, Siren, Ambulance, MapPin, Phone, User, AlertTriangle } from 'lucide-react';
import { Patient, Ambulance as AmbulanceType, UrgencyLevel } from '@/types';
import { useToast } from '../ToastContext';

interface RequestAmbulanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  ambulances: AmbulanceType[];
  onRequestCreated: () => void;
}

export default function RequestAmbulanceModal({
  isOpen,
  onClose,
  patients,
  ambulances,
  onRequestCreated,
}: RequestAmbulanceModalProps) {
  const { showToast } = useToast();
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Critical');
  const [assignedAmbulanceId, setAssignedAmbulanceId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const availableAmbulances = ambulances.filter((a) => a.status === 'Available');

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = patients.find((pat) => pat.id === e.target.value);
    if (p) {
      setPatientName(p.name);
      setPatientPhone(p.phone);
      if (p.address) setPickupLocation(p.address);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !pickupLocation.trim()) {
      showToast('error', 'Missing Information', 'Patient name, phone, and pickup location required');
      return;
    }

    const assignedAmbulance = ambulances.find((a) => a.id === assignedAmbulanceId);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ambulance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          patientPhone: patientPhone.trim(),
          pickupLocation: pickupLocation.trim(),
          urgency,
          assignedAmbulanceId: assignedAmbulance ? assignedAmbulance.id : undefined,
          assignedVehicleNumber: assignedAmbulance ? assignedAmbulance.vehicleNumber : undefined,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (assignedAmbulance) {
          showToast(
            'success',
            'Ambulance Dispatched!',
            `${assignedAmbulance.vehicleNumber} dispatched to ${pickupLocation}. Driver ${assignedAmbulance.driverName} notified via simulated SMS dispatch.`
          );
        } else {
          showToast(
            'success',
            'Emergency Call Logged',
            `Ambulance request for ${patientName} queued for immediate dispatch.`
          );
        }
        onRequestCreated();
        onClose();
      } else {
        showToast('error', 'Request Failed', data.error);
      }
    } catch {
      showToast('error', 'Error', 'Failed to submit ambulance request');
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
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Emergency Ambulance Request</h3>
              <p className="text-xs text-slate-500">
                Direct dispatch and patient pickup coordination
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
          {/* Quick autofill from registered patients */}
          {patients.length > 0 && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <label className="block font-semibold text-slate-600 mb-1">
                Autofill from Registered Patient (Optional):
              </label>
              <select
                onChange={handlePatientSelect}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="">-- Choose patient to autofill details --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone}) - {p.address}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Patient Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 98220 12345"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pickup Location / Address / Landmarks in Pune <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Flat 302, Rohan Tarang, Wakad, Pune (Near Datta Mandir Chowk)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Urgency Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Critical', 'Moderate', 'Standard'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUrgency(lvl)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    urgency === lvl
                      ? lvl === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : lvl === 'Moderate'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Immediate Unit Assignment (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Ambulance Unit (Optional / Dispatch immediately):
            </label>
            <select
              value={assignedAmbulanceId}
              onChange={(e) => setAssignedAmbulanceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs"
            >
              <option value="">-- Queue call for later dispatch --</option>
              {availableAmbulances.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  {amb.vehicleNumber} ({amb.callSign}) - {amb.currentArea} [Driver: {amb.driverName}]
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Coordination Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient on 2nd floor, elevator access available"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs"
            />
          </div>

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
              className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm shadow-rose-500/30 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Processing...'
                : assignedAmbulanceId
                ? 'Dispatch Now'
                : 'Queue Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
