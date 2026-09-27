'use client';

import React, { useState } from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Search,
  Navigation,
  Siren,
  ShieldCheck,
  Tag,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { NearbyFacility } from '@/types';
import { useToast } from './ToastContext';

interface FacilitiesViewProps {
  facilities: NearbyFacility[];
  onOpenAmbulanceForFacility?: (facility: NearbyFacility) => void;
}

export default function FacilitiesView({
  facilities,
  onOpenAmbulanceForFacility,
}: FacilitiesViewProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  // Extract all unique specialties
  const allSpecialties = Array.from(
    new Set(facilities.flatMap((f) => f.specialties))
  ).sort();

  const filteredFacilities = facilities.filter((f) => {
    if (
      selectedSpecialty !== 'All' &&
      !f.specialties.some((s) => s.toLowerCase() === selectedSpecialty.toLowerCase())
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchArea = f.area.toLowerCase().includes(q);
      const matchAddr = f.address.toLowerCase().includes(q);
      const matchType = f.type.toLowerCase().includes(q);
      const matchSpec = f.specialties.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchArea && !matchAddr && !matchType && !matchSpec) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Nearby Hospitals & Clinics</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Emergency Network
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional healthcare facility network, emergency capacity, direct hotlines, and specialty services
          </p>
        </div>
      </div>

      {/* Search & Specialty Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals by name, area, or specialty..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Specialties</option>
            {allSpecialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {facility.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {facility.type}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      📍 {facility.distanceKm} km away
                    </span>
                  </div>
                </div>

                {/* Capacity Status */}
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                    facility.capacityStatus === 'Available'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : facility.capacityStatus === 'Busy'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                  }`}
                >
                  ● {facility.capacityStatus}
                </span>
              </div>

              {/* Address */}
              <div className="text-xs text-slate-500 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {facility.address} ({facility.area})
                </span>
              </div>

              {/* Specialty tags */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Departments & Capabilities
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {facility.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Hotlines */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Standard Desk:</span>
                <span className="font-mono text-slate-800">{facility.contact}</span>
              </div>

              {facility.emergencyServices && (
                <div className="flex items-center justify-between text-rose-700 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <span className="flex items-center gap-1">
                    <Siren className="w-3.5 h-3.5 text-rose-600" /> 24/7 Trauma Hotline:
                  </span>
                  <button
                    onClick={() => {
                      showToast(
                        'info',
                        'Hotline Connected',
                        `Simulated staff call to ${facility.name} emergency line: ${facility.emergencyLine}`
                      );
                    }}
                    className="font-mono underline hover:text-rose-900"
                  >
                    {facility.emergencyLine}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
