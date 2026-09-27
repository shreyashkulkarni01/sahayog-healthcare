'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Siren, RotateCcw, Clock, ShieldCheck, HeartPulse } from 'lucide-react';
import { useToast } from './ToastContext';

interface HeaderProps {
  onOpenEmergencyModal: () => void;
  onDataRefresh: () => void;
  activeEmergencyCount: number;
}

export default function Header({
  onOpenEmergencyModal,
  onDataRefresh,
  activeEmergencyCount,
}: HeaderProps) {
  const { showToast } = useToast();
  const [time, setTime] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Demo Data Reset', 'Platform restored to initial realistic dummy dataset');
        onDataRefresh();
      } else {
        showToast('error', 'Reset Failed', data.error);
      }
    } catch {
      showToast('error', 'Reset Error', 'Could not reset dataset');
    } finally {
      setIsResetting(false);
      setShowConfirmReset(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Care<span className="text-teal-600">Pulse</span>
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Coordination
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Unified Clinic Appointments & Emergency Ops • Pune Network
              </p>
            </div>
          </div>

          {/* Center Info Ticker */}
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5" />
              <span className="font-medium text-slate-700">Staff Console Active</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono font-medium">{time || '--:--:--'}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-[11px]">Admin/Coordination Only</span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reset Demo Data Button */}
            <button
              onClick={() => setShowConfirmReset(true)}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors border border-slate-200"
              title="Reset sample data back to 10+ patients, 15+ appointments, ambulances & blood banks"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Seed</span>
            </button>

            {/* Emergency Fast Action Button (1-click reachable) */}
            <button
              onClick={onOpenEmergencyModal}
              className="relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:from-rose-700 active:to-red-700 rounded-lg shadow-sm shadow-red-500/30 transition-all transform hover:scale-[1.02]"
            >
              <Siren className="w-4 h-4 animate-bounce" />
              <span>Emergency Action</span>
              {activeEmergencyCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold rounded-full bg-white text-rose-600 shadow-xs">
                  {activeEmergencyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Reset Dialog Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900">Reset Demo Database?</h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              This will reset the system back to the initial seeded dataset (~12 patients, ~16 appointments across past/today/future, 6 ambulances, 5 blood banks, and 5 facilities).
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                disabled={isResetting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
