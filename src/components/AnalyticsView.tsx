'use client';

import React from 'react';
import {
  BarChart3,
  Calendar,
  Ambulance as AmbulanceIcon,
  Droplet,
  CheckCircle2,
  Users,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { Appointment, Ambulance, BloodBank, AmbulanceRequest, BloodRequest, BloodGroup } from '@/types';

interface AnalyticsViewProps {
  appointments: Appointment[];
  ambulances: Ambulance[];
  bloodBanks: BloodBank[];
  ambulanceRequests: AmbulanceRequest[];
  bloodRequests: BloodRequest[];
}

export default function AnalyticsView({
  appointments,
  ambulances,
  bloodBanks,
  ambulanceRequests,
  bloodRequests,
}: AnalyticsViewProps) {
  // Appointment status counts
  const totalApts = appointments.length || 1;
  const completedApts = appointments.filter((a) => a.status === 'Completed').length;
  const scheduledApts = appointments.filter((a) => a.status === 'Scheduled').length;
  const cancelledApts = appointments.filter((a) => a.status === 'Cancelled').length;
  const noshowApts = appointments.filter((a) => a.status === 'No-show').length;

  const completedPct = Math.round((completedApts / totalApts) * 100);
  const scheduledPct = Math.round((scheduledApts / totalApts) * 100);
  const cancelledPct = Math.round((cancelledApts / totalApts) * 100);
  const noshowPct = Math.round((noshowApts / totalApts) * 100);

  // Ambulance fleet counts
  const totalFleet = ambulances.length || 1;
  const availAmb = ambulances.filter((a) => a.status === 'Available').length;
  const dutyAmb = ambulances.filter((a) => a.status === 'On Duty').length;
  const maintAmb = ambulances.filter((a) => a.status === 'Maintenance').length;

  // Aggregate Blood Stock across all banks
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const aggregateStock: Record<BloodGroup, number> = {
    'A+': 0,
    'A-': 0,
    'B+': 0,
    'B-': 0,
    'AB+': 0,
    'AB-': 0,
    'O+': 0,
    'O-': 0,
  };

  bloodBanks.forEach((b) => {
    bloodGroups.forEach((g) => {
      aggregateStock[g] += b.stock[g] || 0;
    });
  });

  const maxBlood = Math.max(...Object.values(aggregateStock), 1);

  // Emergency request pipeline
  const totalAmbCalls = ambulanceRequests.length || 1;
  const reqCalls = ambulanceRequests.filter((r) => r.status === 'Requested').length;
  const dispCalls = ambulanceRequests.filter((r) => r.status === 'Dispatched').length;
  const compCalls = ambulanceRequests.filter((r) => r.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Operations & Coordination Statistics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics, appointment completion rates, ambulance readiness, and blood bank stock levels
        </p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{completedPct}%</div>
          <p className="text-xs text-slate-500 mt-1">
            {completedApts} of {totalApts} visits completed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Fleet Availability</span>
            <AmbulanceIcon className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">
            {Math.round((availAmb / totalFleet) * 100)}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {availAmb} of {totalFleet} ambulances ready
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Total Blood Units</span>
            <Droplet className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {Object.values(aggregateStock).reduce((a, b) => a + b, 0)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across {bloodBanks.length} certified banks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Ambulance Dispatches</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">
            {dispCalls + compCalls}
          </div>
          <p className="text-xs text-slate-500 mt-1">{reqCalls} calls awaiting unit</p>
        </div>
      </div>

      {/* Grid of Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Appointment Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Appointment Status Distribution</h3>
            <span className="text-xs text-slate-500">Total: {appointments.length}</span>
          </div>

          {/* Progress Stack Bar */}
          <div className="h-4 rounded-full overflow-hidden flex bg-slate-100">
            <div
              style={{ width: `${completedPct}%` }}
              className="bg-emerald-500 transition-all"
              title={`Completed: ${completedPct}%`}
            />
            <div
              style={{ width: `${scheduledPct}%` }}
              className="bg-sky-500 transition-all"
              title={`Scheduled: ${scheduledPct}%`}
            />
            <div
              style={{ width: `${cancelledPct}%` }}
              className="bg-rose-500 transition-all"
              title={`Cancelled: ${cancelledPct}%`}
            />
            <div
              style={{ width: `${noshowPct}%` }}
              className="bg-amber-500 transition-all"
              title={`No-show: ${noshowPct}%`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
              <div className="font-bold text-emerald-800">{completedApts} ({completedPct}%)</div>
              <div className="text-[11px] text-emerald-600">Completed</div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-900 border border-sky-100">
              <div className="font-bold text-sky-800">{scheduledApts} ({scheduledPct}%)</div>
              <div className="text-[11px] text-sky-600">Scheduled</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-100">
              <div className="font-bold text-rose-800">{cancelledApts} ({cancelledPct}%)</div>
              <div className="text-[11px] text-rose-600">Cancelled</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-100">
              <div className="font-bold text-amber-800">{noshowApts} ({noshowPct}%)</div>
              <div className="text-[11px] text-amber-600">No-show</div>
            </div>
          </div>
        </div>

        {/* Widget 2: Ambulance Fleet Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Ambulance Fleet Readiness</h3>
            <span className="text-xs text-slate-500">Fleet: {ambulances.length} Units</span>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700">Available for Dispatch</span>
                <span>
                  {availAmb} units ({Math.round((availAmb / totalFleet) * 100)}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${(availAmb / totalFleet) * 100}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700">Active On Duty</span>
                <span>
                  {dutyAmb} units ({Math.round((dutyAmb / totalFleet) * 100)}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${(dutyAmb / totalFleet) * 100}%` }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Maintenance</span>
                <span>
                  {maintAmb} units ({Math.round((maintAmb / totalFleet) * 100)}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${(maintAmb / totalFleet) * 100}%` }}
                  className="h-full bg-slate-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget 3: Regional Blood Stock Levels Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Regional Blood Reserves by Group (Across all 5 Banks)
            </h3>
            <p className="text-xs text-slate-500">Aggregated inventory units</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            🩸 Universal Donor O- : {aggregateStock['O-']} units
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {bloodGroups.map((group) => {
            const units = aggregateStock[group];
            const heightPct = Math.max(15, Math.round((units / maxBlood) * 100));
            const isCritical = units < 25;
            return (
              <div
                key={group}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col items-center justify-between h-40 text-center"
              >
                <span className="text-xs font-extrabold text-slate-900">{group}</span>

                {/* Vertical bar visual */}
                <div className="w-8 bg-slate-200 rounded-lg flex flex-col justify-end h-20 overflow-hidden p-0.5">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-md transition-all ${
                      isCritical ? 'bg-rose-500' : 'bg-red-600'
                    }`}
                  />
                </div>

                <div className="text-xs">
                  <div className="font-bold text-slate-900">{units}</div>
                  <div className="text-[10px] text-slate-400">units</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
