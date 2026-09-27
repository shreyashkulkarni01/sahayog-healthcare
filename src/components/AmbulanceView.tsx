'use client';

import React, { useState } from 'react';
import {
  Ambulance,
  Phone,
  MapPin,
  AlertTriangle,
  Siren,
  Clock,
  CheckCircle2,
  Navigation,
  Plus,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  Ambulance as AmbulanceType,
  AmbulanceRequest,
  AmbulanceStatus,
  AmbulanceRequestStatus,
  UrgencyLevel,
} from '@/types';
import { useToast } from './ToastContext';

interface AmbulanceViewProps {
  ambulances: AmbulanceType[];
  requests: AmbulanceRequest[];
  onRefreshData: () => void;
  onOpenNewRequestModal: () => void;
}

export default function AmbulanceView({
  ambulances,
  requests,
  onRefreshData,
  onOpenNewRequestModal,
}: AmbulanceViewProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'requests' | 'fleet'>('requests');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dispatchModalReq, setDispatchModalReq] = useState<AmbulanceRequest | null>(null);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>('');

  const availableAmbulances = ambulances.filter((a) => a.status === 'Available');

  const handleUpdateAmbulanceStatus = async (id: string, status: AmbulanceStatus) => {
    try {
      const res = await fetch('/api/ambulances', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('info', 'Ambulance Status Updated', `Unit status set to ${status}`);
        onRefreshData();
      } else {
        showToast('error', 'Update Failed', data.error);
      }
    } catch {
      showToast('error', 'Error', 'Failed to update ambulance status');
    }
  };

  const handleDispatch = async () => {
    if (!dispatchModalReq || !selectedAmbulanceId) return;

    const chosenAmb = ambulances.find((a) => a.id === selectedAmbulanceId);
    if (!chosenAmb) return;

    try {
      const res = await fetch('/api/ambulance-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dispatchModalReq.id,
          status: 'Dispatched',
          assignedAmbulanceId: chosenAmb.id,
          assignedVehicleNumber: chosenAmb.vehicleNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          'success',
          'Ambulance Dispatched!',
          `${chosenAmb.callSign} (${chosenAmb.vehicleNumber}) dispatched to ${dispatchModalReq.pickupLocation}. Driver ${chosenAmb.driverName} notified via simulated SMS dispatch.`
        );
        setDispatchModalReq(null);
        setSelectedAmbulanceId('');
        onRefreshData();
      } else {
        showToast('error', 'Dispatch Failed', data.error);
      }
    } catch {
      showToast('error', 'Error', 'Failed to dispatch ambulance');
    }
  };

  const handleUpdateRequestStatus = async (
    id: string,
    status: AmbulanceRequestStatus,
    patientName: string
  ) => {
    try {
      const res = await fetch('/api/ambulance-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          'success',
          'Request Updated',
          `Call for ${patientName} marked as ${status}. Vehicle status reconciled.`
        );
        onRefreshData();
      } else {
        showToast('error', 'Update Failed', data.error);
      }
    } catch {
      showToast('error', 'Error', 'Failed to update request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & New Request Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Ambulance Coordination Center</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Emergency Fast Response
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ambulance dispatching, fleet readiness tracking, and active transport coordination
          </p>
        </div>

        <button
          onClick={onOpenNewRequestModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-sm shadow-rose-500/20"
        >
          <Siren className="w-4 h-4" />
          <span>New Ambulance Request</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>Transport Requests</span>
            <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-100 text-slate-700 font-semibold">
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'fleet'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ambulance className="w-4 h-4" />
            <span>Fleet Readiness Board</span>
            <span className="px-2 py-0.5 text-[11px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              {availableAmbulances.length} Available
            </span>
          </button>
        </div>

        {activeTab === 'requests' && (
          <div className="flex items-center gap-1 pb-2">
            {['All', 'Requested', 'Dispatched', 'Completed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === s
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Ambulance Requests Board */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <Ambulance className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No ambulance requests found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No transport calls match the current status filter.
              </p>
              <button
                onClick={onOpenNewRequestModal}
                className="mt-4 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                Create Ambulance Call
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-3 ${
                    req.status === 'Requested'
                      ? 'border-rose-300 ring-2 ring-rose-500/10'
                      : req.status === 'Dispatched'
                      ? 'border-indigo-200 bg-indigo-50/10'
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">{req.patientName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            req.urgency === 'Critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : req.urgency === 'Moderate'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.patientPhone}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        req.status === 'Requested'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : req.status === 'Dispatched'
                          ? 'bg-indigo-100 text-indigo-800'
                          : req.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      ● {req.status}
                    </span>
                  </div>

                  {/* Pickup location */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Pickup Location:</span>{' '}
                      {req.pickupLocation}
                    </div>
                  </div>

                  {/* Notes / Assigned Vehicle */}
                  {req.assignedVehicleNumber && (
                    <div className="text-xs text-indigo-900 bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ambulance className="w-4 h-4 text-indigo-600" />
                        <span>
                          Assigned Vehicle:{' '}
                          <strong className="font-mono">{req.assignedVehicleNumber}</strong>
                        </span>
                      </div>
                      {req.dispatchedAt && (
                        <span className="text-[11px] text-indigo-700">
                          {new Date(req.dispatchedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  )}

                  {req.notes && (
                    <div className="text-xs text-slate-500 italic">"{req.notes}"</div>
                  )}

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {req.status === 'Requested' && (
                      <button
                        onClick={() => {
                          setDispatchModalReq(req);
                          setSelectedAmbulanceId(availableAmbulances[0]?.id || '');
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
                      >
                        <Siren className="w-3.5 h-3.5" />
                        <span>Dispatch Available Ambulance</span>
                      </button>
                    )}

                    {req.status === 'Dispatched' && (
                      <button
                        onClick={() =>
                          handleUpdateRequestStatus(req.id, 'Completed', req.patientName)
                        }
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Transport Completed</span>
                      </button>
                    )}

                    {req.status === 'Completed' && (
                      <div className="w-full text-center text-xs text-emerald-700 font-medium py-1">
                        ✓ Transport Completed {req.completedAt ? `at ${new Date(req.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Fleet Readiness Grid */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambulances.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {unit.vehicleNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{unit.callSign}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-1 block">
                    {unit.type}
                  </span>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    unit.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : unit.status === 'On Duty'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  ● {unit.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{unit.currentArea}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Driver:</span>
                  <span className="font-semibold text-slate-800">{unit.driverName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{unit.contactPhone}</span>
                </div>
              </div>

              {/* Status Toggle Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Active: {unit.lastActive}</span>
                <select
                  value={unit.status}
                  onChange={(e) =>
                    handleUpdateAmbulanceStatus(unit.id, e.target.value as AmbulanceStatus)
                  }
                  className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="On Duty">On Duty</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Siren className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Dispatch Ambulance Unit</h3>
                <p className="text-xs text-slate-500">Assign an available unit to patient</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>
                <strong className="text-slate-900">Patient:</strong> {dispatchModalReq.patientName} (
                {dispatchModalReq.patientPhone})
              </div>
              <div>
                <strong className="text-slate-900">Location:</strong>{' '}
                {dispatchModalReq.pickupLocation}
              </div>
              <div>
                <strong className="text-slate-900">Urgency:</strong>{' '}
                <span className="text-rose-600 font-bold">{dispatchModalReq.urgency}</span>
              </div>
            </div>

            {availableAmbulances.length === 0 ? (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs border border-rose-200">
                Warning: No ambulances are currently marked as "Available". Please set a unit to
                Available in Fleet board first.
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Unit for Dispatch:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableAmbulances.map((amb) => (
                    <label
                      key={amb.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors text-xs ${
                        selectedAmbulanceId === amb.id
                          ? 'border-rose-500 bg-rose-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="assignedAmbulance"
                          value={amb.id}
                          checked={selectedAmbulanceId === amb.id}
                          onChange={() => setSelectedAmbulanceId(amb.id)}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">
                            {amb.vehicleNumber} • {amb.callSign}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {amb.type} • Driver: {amb.driverName}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Available
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDispatchModalReq(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispatch}
                disabled={!selectedAmbulanceId}
                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
