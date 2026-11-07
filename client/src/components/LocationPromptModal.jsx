import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Map, X, Check, ArrowRight } from 'lucide-react';
import LocalityMapModal from './LocalityMapModal';
import { useApp } from '../context/AppContext';

const HYDERABAD_LOCALITIES = [
  'Kukatpally',
  'Ameerpet',
  'Banjara Hills',
  'Hitec City',
  'Gachibowli',
  'Jubilee Hills',
  'Secunderabad',
  'Charminar',
  'Begumpet',
  'Dilsukhnagar',
  'Kondapur',
  'Madhapur',
  'Manikonda',
  'Miyapur',
];

export default function LocationPromptModal({
  isOpen,
  onClose,
  currentLocality,
  onSelectLocality,
  detectLocation,
  userLocation,
}) {
  const { tr } = useApp();
  const [selected, setSelected] = useState(currentLocality || '');
  const [showMapModal, setShowMapModal] = useState(false);

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

  const handleConfirm = () => {
    onSelectLocality(selected);
    onClose();
  };

  const handleUseGps = async () => {
    if (detectLocation) {
      const loc = await detectLocation();
      if (loc && loc.localityName) {
        setSelected(loc.localityName);
        onSelectLocality(loc.localityName);
        setTimeout(() => onClose(), 600);
        return;
      }
    }
    if (userLocation?.localityName && userLocation.localityName !== 'Hyderabad') {
      setSelected(userLocation.localityName);
      onSelectLocality(userLocation.localityName);
      onClose();
    } else {
      setSelected('Kukatpally');
      onSelectLocality('Kukatpally');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-white/[0.12] shadow-2xl relative space-y-6 text-[#E0EBE9] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-[#8E9EA2] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{tr('KaamSetu Local Coverage')}</span>
          </div>
          <h3 className="text-2xl font-heading font-extrabold text-[#E0EBE9]">
            {tr('Select Your Location')}
          </h3>
          <p className="text-xs sm:text-sm text-[#8E9EA2] leading-relaxed">
            {tr('Choose your neighborhood to see verified service professionals near you or set your partner work radius.')}
          </p>
        </div>

        {/* GPS Quick Button & Interactive Map Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={userLocation?.loading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/[0.06] hover:bg-white/[0.12] border border-amber-500/40 hover:border-amber-500 rounded-2xl text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <Navigation className={`w-4 h-4 text-[#F59E0B] ${userLocation?.loading ? 'animate-spin' : ''}`} />
            <span>{userLocation?.loading ? 'Detecting Location...' : tr('📍 Choose My Current Location')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-2xl text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            <Map className="w-4 h-4 text-slate-300" />
            <span>{tr('Pick on Map 🗺️')}</span>
          </button>
        </div>

        {/* Quick Locality Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#8E9EA2] uppercase">
            {tr('Neighborhoods in Hyderabad')}
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {HYDERABAD_LOCALITIES.map((loc) => {
              const isSelected = selected === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelected(loc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                      : 'bg-white/[0.04] text-[#8E9EA2] hover:text-[#E0EBE9] hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{tr(loc)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Display & Confirm */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-[#8E9EA2] block text-[11px]">{tr('Selected:')}</span>
            <span className="font-bold text-[#E0EBE9] truncate max-w-[180px] block">
              {selected ? `📍 ${tr(selected)}, ${tr('Hyderabad')}` : tr('All Hyderabad')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectLocality('');
                onClose();
              }}
              className="px-3 py-2 text-xs text-[#8E9EA2] hover:text-white transition-colors cursor-pointer"
            >
              {tr('Skip')}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-xs rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{tr('Confirm Location')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modal: Interactive Map */}
      <LocalityMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        currentLocality={selected || currentLocality}
        onSelectLocality={(locName) => {
          setSelected(locName);
          setShowMapModal(false);
        }}
      />
    </div>
  );
}
