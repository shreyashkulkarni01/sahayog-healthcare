'use client';

import React, { useState } from 'react';
import {
  Droplet,
  Search,
  MapPin,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  Building2,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { BloodBank, BloodRequest, BloodGroup, BloodRequestStatus } from '@/types';
import { useToast } from './ToastContext';

interface BloodBankViewProps {
  bloodBanks: BloodBank[];
  bloodRequests: BloodRequest[];
  onRefreshData: () => void;
  onOpenNewBloodRequestModal: (preselectedGroup?: BloodGroup) => void;
}

const ALL_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodBankView({
  bloodBanks,
  bloodRequests,
  onRefreshData,
  onOpenNewBloodRequestModal,
}: BloodBankViewProps) {
  const { showToast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'All'>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('inventory');

  // Extract unique areas
  const areas = Array.from(new Set(bloodBanks.map((b) => b.area))).filter(Boolean);

  const handleUpdateRequestStatus = async (id: string, status: BloodRequestStatus) => {
    try {
      const res = await fetch('/api/blood-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Blood Request Updated', `Status changed to ${status}`);
        onRefreshData();
      } else {
        showToast('error', 'Update Failed', data.error);
      }
    } catch {
      showToast('error', 'Error', 'Failed to update blood request status');
    }
  };

  const filteredBanks = bloodBanks.filter((bank) => {
    if (selectedArea !== 'All' && !bank.area.toLowerCase().includes(selectedArea.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = bank.name.toLowerCase().includes(q);
      const matchAddr = bank.address.toLowerCase().includes(q);
      const matchArea = bank.area.toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchArea) return false;
    }
    return true;
  });

  const getStockBadge = (units: number) => {
    if (units === 0) {
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400">Out of Stock</span>;
    }
    if (units < 5) {
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 animate-pulse">Critical ({units})</span>;
    }
    if (units < 10) {
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">Low ({units})</span>;
    }
    return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">{units} units</span>;
  };

  // Compute total available units across all banks for selected group
  const totalUnitsForGroup = (group: BloodGroup) => {
    return bloodBanks.reduce((sum, bank) => sum + (bank.stock[group] || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header and Blood Request CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Blood Bank & Inventory Coordinator</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              Live Stock Search
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate emergency blood availability, donor center inventories, and urgent hospital transfers
          </p>
        </div>

        <button
          onClick={() =>
            onOpenNewBloodRequestModal(selectedGroup === 'All' ? undefined : selectedGroup)
          }
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors shadow-sm shadow-red-500/20"
        >
          <Droplet className="w-4 h-4 fill-white" />
          <span>Request Blood Transfer</span>
        </button>
      </div>

      {/* Blood Group Quick Matcher Selector (Must-have requirement) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
            1-Click Blood Group Matcher
          </span>
          <span className="text-xs text-slate-500">
            Click any blood type to filter matching banks instantly
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
          <button
            onClick={() => setSelectedGroup('All')}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
              selectedGroup === 'All'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>All Groups</span>
            <span className="text-[10px] opacity-75">Overview</span>
          </button>

          {ALL_BLOOD_GROUPS.map((group) => {
            const count = totalUnitsForGroup(group);
            const isSelected = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400'
                    : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-100'
                }`}
              >
                <span className="text-sm font-extrabold">{group}</span>
                <span className={`text-[10px] ${isSelected ? 'text-red-100' : 'text-red-700'}`}>
                  {count} units
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`text-xs sm:text-sm font-bold pb-1 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Blood Banks Directory ({filteredBanks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`text-xs sm:text-sm font-bold pb-1 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Urgent Blood Requests ({bloodRequests.length})</span>
          </button>
        </div>

        {activeTab === 'inventory' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blood banks..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="All">All Areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Blood Banks Directory */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBanks.map((bank) => (
            <div
              key={bank.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{bank.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{bank.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{bank.operatingHours}</span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 shrink-0">
                  {bank.area}
                </span>
              </div>

              {/* Stock breakdown */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Stock Inventory</span>
                  <span className="text-[11px] text-slate-400 lowercase font-normal">
                    Updated {bank.lastUpdated}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {ALL_BLOOD_GROUPS.map((group) => {
                    const units = bank.stock[group] || 0;
                    const isGroupHighlight = selectedGroup === group;
                    return (
                      <div
                        key={group}
                        className={`p-2 rounded-xl border transition-all ${
                          isGroupHighlight
                            ? 'bg-red-50 border-red-400 ring-2 ring-red-400/20'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div
                          className={`font-extrabold ${
                            isGroupHighlight ? 'text-red-700' : 'text-slate-800'
                          }`}
                        >
                          {group}
                        </div>
                        <div className="mt-1">{getStockBadge(units)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact Hotline & Request Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{bank.contact}</span>
                </div>

                <button
                  onClick={() =>
                    onOpenNewBloodRequestModal(selectedGroup === 'All' ? undefined : selectedGroup)
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Request Units</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Urgent Blood Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Patient & Contact</th>
                    <th className="py-3 px-4">Blood Group & Units</th>
                    <th className="py-3 px-4">Destination Facility</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bloodRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{req.patientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {req.contactPhone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs px-2.5 py-1 rounded-md bg-red-100 text-red-800 border border-red-200">
                            {req.bloodGroup}
                          </span>
                          <span className="font-bold text-slate-800">
                            {req.unitsNeeded} {req.unitsNeeded === 1 ? 'Unit' : 'Units'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">{req.hospitalOrClinic}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            req.urgency === 'Emergency'
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : req.urgency === 'Urgent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleUpdateRequestStatus(req.id, e.target.value as BloodRequestStatus)
                          }
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Fulfilled">Fulfilled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
