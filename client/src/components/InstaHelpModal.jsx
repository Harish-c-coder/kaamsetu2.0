import React from 'react';
import {
  X,
  Zap,
  PhoneCall,
  MessageSquare,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function InstaHelpModal({ isOpen, onClose }) {
  const { tr, selectedLocality } = useApp();

  if (!isOpen) return null;

  const emergencyLoc = selectedLocality || 'Kukatpally, Hyderabad';
  const emergencyPhone = '+919876543227';
  const prefilledWhatsApp = encodeURIComponent(
    `🚨 [URGENT INSTAHELP EMERGENCY] I need emergency technician dispatch at ${emergencyLoc} immediately. Please send nearest available technician.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-[480px] bg-[#13191C] border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amber Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#F59E0B]">
              <Zap className="w-6 h-6 animate-pulse fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-[#E4ECEC]">InstaHelp™ Dispatch</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F59E0B] border border-amber-500/30 font-semibold uppercase">
                  ⚡ 20 Mins
                </span>
              </div>
              <p className="text-xs text-[#8E9EA2] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#F59E0B]" />
                <span>Coverage: {emergencyLoc}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#8E9EA2] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Emergency Scenarios */}
        <div className="my-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8E9EA2]">
            Select Emergency Type:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-colors">
              <span className="text-base block mb-1">⚡</span>
              <p className="font-bold text-[#E4ECEC]">Power Blackout</p>
              <p className="text-[11px] text-[#8E9EA2]">MCB trip, burnt fuse, sparking</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-colors">
              <span className="text-base block mb-1">🚿</span>
              <p className="font-bold text-[#E4ECEC]">Burst Pipe / Leak</p>
              <p className="text-[11px] text-[#8E9EA2]">Flooding, major drain blockage</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-colors">
              <span className="text-base block mb-1">🔒</span>
              <p className="font-bold text-[#E4ECEC]">Door Lockout</p>
              <p className="text-[11px] text-[#8E9EA2]">Locked out, jammed smart lock</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-colors">
              <span className="text-base block mb-1">❄️</span>
              <p className="font-bold text-[#E4ECEC]">AC Breakdown</p>
              <p className="text-[11px] text-[#8E9EA2]">Water leaking, cooling fail</p>
            </div>
          </div>
        </div>

        {/* Direct Action Triggers */}
        <div className="space-y-3">
          <a
            href={`https://wa.me/919876543227?text=${prefilledWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>1-Tap WhatsApp Emergency Dispatch</span>
          </a>

          <a
            href={`tel:${emergencyPhone}`}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <PhoneCall className="w-4 h-4 text-[#0B0F10]" />
            <span>Direct Call Dispatch Hotline: +91 98765 43227</span>
          </a>
        </div>

        {/* Guarantee footer */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8E9EA2]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            15–20 Min SLA in Hyderabad
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero Surge Pricing • Direct Rates
          </span>
        </div>
      </div>
    </div>
  );
}
