'use client';

import React, { useState } from 'react';
import {
  X,
  Siren,
  Ambulance,
  Droplet,
  MapPin,
  Phone,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Patient, Ambulance as AmbulanceType, BloodBank, BloodGroup } from '@/types';
import { useToast } from '../ToastContext';

interface RapidEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  ambulances: AmbulanceType[];
  bloodBanks: BloodBank[];
  onRefreshData: () => void;
  onSelectTab: (tab: string) => void;
}

export default function RapidEmergencyModal({
  isOpen,
  onClose,
  patients,
  ambulances,
  bloodBanks,
  onRefreshData,
  onSelectTab,
}: RapidEmergencyModalProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'ambulance' | 'blood'>('ambulance');

  // Ambulance form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [urgency, setUrgency] = useState<'Critical' | 'Moderate'>('Critical');
  const [selectedAmbId, setSelectedAmbId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Blood search state
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O-');

  if (!isOpen) return null;

  const availableAmbulances = ambulances.filter((a) => a.status === 'Available');

  const handlePatientAutofill = (patientId: string) => {
    const p = patients.find((pat) => pat.id === patientId);
    if (p) {
      setPatientName(p.name);
      setPatientPhone(p.phone);
      if (p.address) setPickupLocation(p.address);
    }
  };

  const handleAmbulanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !pickupLocation.trim()) {
      showToast('error', 'Missing Fields', 'Patient name, phone, and pickup location required');
      return;
    }

    const assignedAmb = ambulances.find((a) => a.id === selectedAmbId);

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
          assignedAmbulanceId: assignedAmb ? assignedAmb.id : undefined,
          assignedVehicleNumber: assignedAmb ? assignedAmb.vehicleNumber : undefined,
          notes: 'Fast 1-click emergency coordinator call',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          'success',
          'Emergency Action Dispatched!',
          assignedAmb
            ? `${assignedAmb.callSign} (${assignedAmb.vehicleNumber}) dispatched immediately to ${pickupLocation}. Driver alerted via mock SMS.`
            : `Ambulance request for ${patientName} queued with CRITICAL priority.`
        );
        onRefreshData();
        onClose();
      } else {
        showToast('error', 'Failed', data.error);
      }
    } catch {
      showToast('error', 'Error', 'Failed to dispatch');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find blood banks that have this blood group in stock
  const matchingBanks = bloodBanks
    .map((b) => ({
      ...b,
      units: b.stock[selectedBloodGroup] || 0,
    }))
    .sort((a, b) => b.units - a.units);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-rose-200 animate-in zoom-in-95 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Top Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Fast Emergency Action Coordinator
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Priority 1
                </span>
              </div>
              <p className="text-xs text-slate-500">
                1-click emergency response for ambulances and urgent blood supply
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Mode: Ambulance vs Blood */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setMode('ambulance')}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              mode === 'ambulance'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ambulance className="w-4 h-4" />
            <span>Ambulance Dispatch</span>
          </button>

          <button
            onClick={() => setMode('blood')}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              mode === 'blood'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-4 h-4 fill-current" />
            <span>Blood Group Finder</span>
          </button>
        </div>

        {/* Mode 1: Fast Ambulance Dispatch */}
        {mode === 'ambulance' && (
          <form onSubmit={handleAmbulanceSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Autofill option */}
            {patients.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Autofill from Registered Patient:
                </label>
                <select
                  onChange={(e) => handlePatientAutofill(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Choose patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone}) - {p.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                  placeholder="Patient Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Pickup Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Address or nearest intersection..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('Critical')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                      urgency === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Critical
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('Moderate')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                      urgency === 'Moderate'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Moderate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Ambulance:
                </label>
                <select
                  value={selectedAmbId}
                  onChange={(e) => setSelectedAmbId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                >
                  <option value="">-- Immediate Dispatch Queue --</option>
                  {availableAmbulances.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.vehicleNumber} ({a.callSign})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-md shadow-rose-600/30 disabled:opacity-50"
              >
                {isSubmitting ? 'Dispatching...' : 'Dispatch Emergency Ambulance'}
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Fast Blood Availability Finder */}
        {mode === 'blood' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Blood Group for Instant Availability Match:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedBloodGroup(g)}
                    className={`py-2 rounded-xl font-extrabold text-xs transition-all ${
                      selectedBloodGroup === g
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400'
                        : 'bg-red-50 text-red-900 border border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Certified Blood Banks with {selectedBloodGroup} Stock</span>
                <span>
                  Total:{' '}
                  <strong className="text-slate-900">
                    {matchingBanks.reduce((sum, b) => sum + b.units, 0)} units
                  </strong>
                </span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {matchingBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{bank.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        📍 {bank.area} • Hotline: {bank.contact}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                          bank.units < 5
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {bank.units} units
                      </span>

                      <button
                        onClick={() => {
                          showToast(
                            'info',
                            'Transfer Hotline Dialed',
                            `Connecting staff to ${bank.name} (${bank.contact}) for ${selectedBloodGroup} blood transfer request.`
                          );
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                      >
                        Call Bank
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectTab('blood-bank');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                <span>Open Full Blood Bank Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
