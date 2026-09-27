'use client';

import React, { useState, useEffect } from 'react';
import { X, Droplet, Send, Building2, Phone, AlertCircle } from 'lucide-react';
import { Patient, NearbyFacility, BloodGroup } from '@/types';
import { useToast } from '../ToastContext';

interface EmergencyBloodRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  facilities: NearbyFacility[];
  preselectedGroup?: BloodGroup;
  onRequestCreated: () => void;
}

export default function EmergencyBloodRequestModal({
  isOpen,
  onClose,
  patients,
  facilities,
  preselectedGroup,
  onRequestCreated,
}: EmergencyBloodRequestModalProps) {
  const { showToast } = useToast();
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(preselectedGroup || 'O+');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgency, setUrgency] = useState<'Emergency' | 'Urgent' | 'Standard'>('Emergency');
  const [hospitalOrClinic, setHospitalOrClinic] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedGroup) {
      setBloodGroup(preselectedGroup);
    }
    if (facilities.length > 0 && !hospitalOrClinic) {
      setHospitalOrClinic(facilities[0].name);
      setContactPhone(facilities[0].contact);
    }
  }, [preselectedGroup, facilities, hospitalOrClinic]);

  if (!isOpen) return null;

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = patients.find((pat) => pat.id === e.target.value);
    if (p) {
      setPatientName(p.name);
      setBloodGroup(p.bloodGroup);
      setContactPhone(p.phone);
    }
  };

  const handleFacilitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fac = facilities.find((f) => f.name === e.target.value);
    if (fac) {
      setHospitalOrClinic(fac.name);
      setContactPhone(fac.emergencyLine || fac.contact);
    } else {
      setHospitalOrClinic(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !hospitalOrClinic.trim() || !contactPhone.trim()) {
      showToast('error', 'Missing Information', 'Please fill all required blood transfer details');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          bloodGroup,
          unitsNeeded: Number(unitsNeeded) || 1,
          urgency,
          hospitalOrClinic: hospitalOrClinic.trim(),
          contactPhone: contactPhone.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          'success',
          'Blood Transfer Requested',
          `${unitsNeeded} units of ${bloodGroup} requested for ${patientName} at ${hospitalOrClinic}. Regional blood network notified.`
        );
        onRequestCreated();
        onClose();
      } else {
        showToast('error', 'Request Failed', data.error);
      }
    } catch {
      showToast('error', 'Error', 'Failed to submit blood request');
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
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Droplet className="w-6 h-6 fill-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Emergency Blood Transfer Request</h3>
              <p className="text-xs text-slate-500">
                Direct requisition to accredited blood banks & regional depots
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
          {/* Quick patient autofill */}
          {patients.length > 0 && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <label className="block font-semibold text-slate-600 mb-1">
                Autofill from Registered Patient (Optional):
              </label>
              <select
                onChange={handlePatientSelect}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="">-- Choose patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - Blood Group: {p.bloodGroup}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Patient Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Full name of patient"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
            />
          </div>

          {/* Blood Group & Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Blood Group <span className="text-rose-500">*</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-extrabold text-red-700"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Units Needed <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-bold"
              />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requisition Urgency <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Emergency', 'Urgent', 'Standard'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUrgency(lvl)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    urgency === lvl
                      ? lvl === 'Emergency'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : lvl === 'Urgent'
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

          {/* Destination Hospital/Clinic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Hospital or Clinic <span className="text-rose-500">*</span>
            </label>
            <select
              value={hospitalOrClinic}
              onChange={handleFacilitySelect}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-xs"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.name}>
                  {fac.name} ({fac.area})
                </option>
              ))}
              <option value="Other Facility">Other Facility / Custom Address...</option>
            </select>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Coordination Hotline / Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-mono text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Urgent ER Bay 2 receiving dock"
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
              className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-500/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Dispatch Requisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
