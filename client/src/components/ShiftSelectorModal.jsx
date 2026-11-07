import React, { useState, useEffect } from 'react';
import {
  Clock,
  Check,
  X,
  Sparkles,
  Zap,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { AVAILABLE_SHIFTS } from '../utils/shifts';

export default function ShiftSelectorModal({
  isOpen,
  onClose,
  activeShift,
  onSelectShift,
}) {
  const [selectedShiftId, setSelectedShiftId] = useState(
    activeShift?.id || 'shift_full_day_8pm'
  );
  const [filterType, setFilterType] = useState('all');
  const [customStart, setCustomStart] = useState('10:00 AM');
  const [customEnd, setCustomEnd] = useState('06:00 PM');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredShifts = AVAILABLE_SHIFTS.filter((s) => {
    if (filterType === 'all') return true;
    return s.category === filterType;
  });

  const handleConfirm = () => {
    if (showCustom) {
      const customShiftObj = {
        id: 'shift_custom',
        name: `Custom Shift (${customStart} – ${customEnd})`,
        startTime: customStart,
        endTime: customEnd,
        startedAt: new Date().toISOString(),
        durationHours: 8,
      };
      onSelectShift(customShiftObj);
      onClose();
      return;
    }

    const found = AVAILABLE_SHIFTS.find((s) => s.id === selectedShiftId);
    if (found) {
      const now = new Date();
      let endsAt = null;
      if (found.durationHours) {
        endsAt = new Date(now.getTime() + found.durationHours * 3600 * 1000).toISOString();
      }

      const shiftData = {
        id: found.id,
        name: found.name,
        startTime: found.startTime || 'Now',
        endTime: found.endTime || `+${found.durationHours}h`,
        durationHours: found.durationHours,
        startedAt: now.toISOString(),
        endsAt,
      };
      onSelectShift(shiftData);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[#13191C] rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative border border-white/10 flex flex-col max-h-[92vh] text-[#E0EBE9] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] text-slate-300 border border-white/[0.08] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#E0EBE9]">Select Work Shift</h3>
              <p className="text-xs text-[#8E9EA2]">
                Broadcast your duty schedule so nearby customers can contact you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8E9EA2] hover:text-white rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 my-3">
          <button
            type="button"
            onClick={() => {
              setFilterType('all');
              setShowCustom(false);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              filterType === 'all' && !showCustom
                ? 'bg-slate-200 text-[#0C1012] border-white shadow-sm'
                : 'bg-white/[0.04] text-[#8E9EA2] border-white/[0.08] hover:text-white'
            }`}
          >
            All Shifts ({AVAILABLE_SHIFTS.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType('hourly');
              setShowCustom(false);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              filterType === 'hourly' && !showCustom
                ? 'bg-slate-200 text-[#0C1012] border-white shadow-sm'
                : 'bg-white/[0.04] text-[#8E9EA2] border-white/[0.08] hover:text-white'
            }`}
          >
            ⚡ Quick Hourly (1h, 2h, 3h, 4h)
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType('daily');
              setShowCustom(false);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              filterType === 'daily' && !showCustom
                ? 'bg-slate-200 text-[#0C1012] border-white shadow-sm'
                : 'bg-white/[0.04] text-[#8E9EA2] border-white/[0.08] hover:text-white'
            }`}
          >
            ☀️ Daily (9am-8pm, 9am-10pm)
          </button>
        </div>

        {/* Scrollable Shift Cards */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 py-1">
          {filteredShifts.map((shift) => {
            const isSelected = selectedShiftId === shift.id && !showCustom;
            return (
              <div
                key={shift.id}
                onClick={() => {
                  setSelectedShiftId(shift.id);
                  setShowCustom(false);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-slate-400 bg-white/[0.08] shadow-lg shadow-black/40'
                    : 'border-white/[0.06] hover:border-white/15 bg-white/[0.03]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full border ${
                        shift.category === 'hourly'
                          ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                          : 'bg-white/[0.06] text-slate-300 border-white/10'
                      }`}
                    >
                      {shift.badge}
                    </span>
                    <h4 className="font-semibold text-xs sm:text-sm text-[#E0EBE9]">
                      {shift.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#8E9EA2] leading-tight">
                    {shift.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-white bg-slate-200 text-[#0C1012]'
                        : 'border-white/20'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[#0C1012]" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom Shift Option */}
          <div
            onClick={() => setShowCustom(true)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
              showCustom
                ? 'border-slate-400 bg-white/[0.08]'
                : 'border-white/[0.06] hover:border-white/15 bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#E0EBE9] border border-white/10">
                  Custom
                </span>
                <h4 className="font-semibold text-xs sm:text-sm text-[#E0EBE9]">
                  Custom Duty Window
                </h4>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  showCustom
                    ? 'border-white bg-slate-200 text-[#0C1012]'
                    : 'border-white/20'
                }`}
              >
                {showCustom && <Check className="w-3 h-3 text-[#0C1012]" />}
              </div>
            </div>

            {showCustom && (
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#8E9EA2] uppercase">Start Time</label>
                  <input
                    type="text"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-white/[0.04] border border-white/10 text-[#E0EBE9] focus:outline-none focus:border-white/30"
                    placeholder="e.g. 11:00 AM"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8E9EA2] uppercase">End Time</label>
                  <input
                    type="text"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-white/[0.04] border border-white/10 text-[#E0EBE9] focus:outline-none focus:border-white/30"
                    placeholder="e.g. 07:00 PM"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#8E9EA2] hover:text-white rounded-full cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-slate-200 hover:bg-white text-[#0C1012] text-xs font-bold rounded-full shadow-lg shadow-black/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm Shift</span>
          </button>
        </div>
      </div>
    </div>
  );
}
