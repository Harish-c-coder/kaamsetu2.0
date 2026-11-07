import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  X,
  Check,
  Compass,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { HYDERABAD_LOCALITIES, requestCurrentLocation } from '../utils/geoUtils';
export { HYDERABAD_LOCALITIES };

export default function LocalityMapModal({
  isOpen,
  onClose,
  onSelectLocality,
  currentLocality = 'Kukatpally',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [selectedLoc, setSelectedLoc] = useState(() => {
    return (
      HYDERABAD_LOCALITIES.find((l) => l.name === currentLocality) ||
      HYDERABAD_LOCALITIES[0]
    );
  });

  useEffect(() => {
    if (currentLocality) {
      const match = HYDERABAD_LOCALITIES.find((l) => l.name === currentLocality);
      if (match) setSelectedLoc(match);
    }
  }, [currentLocality]);

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

  const handleChooseCurrentLocation = async () => {
    setGpsLoading(true);
    setGpsStatus('Detecting precise coordinates...');
    try {
      const loc = await requestCurrentLocation();
      const matched =
        HYDERABAD_LOCALITIES.find((l) => l.name === loc.localityName) ||
        HYDERABAD_LOCALITIES[0];
      setSelectedLoc(matched);
      setGpsStatus(`📍 Detected: ${matched.name} (${matched.zone})`);
      onSelectLocality(matched.name, { lat: matched.lat, lng: matched.lng });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setGpsStatus('Location unavailable. Please pick from list.');
    } finally {
      setGpsLoading(false);
    }
  };

  const filteredLocalities = HYDERABAD_LOCALITIES.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedLoc) {
      onSelectLocality(selectedLoc.name, {
        lat: selectedLoc.lat,
        lng: selectedLoc.lng,
      });
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[#13191C] rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative border border-white/10 flex flex-col max-h-[92vh] text-[#E0EBE9] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#E0EBE9]">
                Select Locality on Map
              </h3>
              <p className="text-xs text-[#8E9EA2]">
                Greater Hyderabad coverage with GPS coordinates
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

        {/* Prominent Quick Action: Choose My Current Location */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleChooseCurrentLocation}
            disabled={gpsLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-amber-500/40 hover:border-amber-500 text-xs font-bold text-[#E4ECEC] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group active:scale-98"
          >
            <Navigation className={`w-4 h-4 text-[#F59E0B] ${gpsLoading ? 'animate-spin' : 'group-hover:scale-110'}`} />
            <span>{gpsLoading ? 'Detecting your GPS location...' : (gpsStatus || '📍 Choose My Current Location')}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="my-3 relative">
          <Search className="w-4 h-4 text-[#8E9EA2] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Hyderabad area (e.g. Gachibowli, Kondapur, Jubilee Hills...)"
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/[0.04] border border-white/[0.08] rounded-2xl text-[#E0EBE9] focus:outline-none focus:border-white/30"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-[#8E9EA2] hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Interactive Map Visual Simulator */}
        <div className="relative w-full h-44 sm:h-52 bg-[#0C1012] rounded-2xl border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center p-3 select-none">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Simulated Lake */}
          <div className="absolute w-24 h-24 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center pointer-events-none">
            <span className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest">
              Hussain Sagar
            </span>
          </div>

          {/* Interactive Locality Markers */}
          {HYDERABAD_LOCALITIES.slice(0, 18).map((loc) => {
            const isSelected = selectedLoc?.name === loc.name;
            const minLat = 17.33, maxLat = 17.52;
            const minLng = 78.33, maxLng = 78.58;
            const leftPct = Math.min(Math.max(((loc.lng - minLng) / (maxLng - minLng)) * 85 + 7, 5), 95);
            const topPct = Math.min(Math.max((1 - (loc.lat - minLat) / (maxLat - minLat)) * 80 + 10, 8), 92);

            return (
              <button
                key={loc.name}
                type="button"
                onClick={() => setSelectedLoc(loc)}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-200 text-[#0C1012] scale-110 z-20 shadow-lg shadow-black/50'
                    : 'bg-[#182124] text-[#8E9EA2] hover:text-[#E0EBE9] border border-white/10 z-10'
                }`}
              >
                <MapPin className={`w-2.5 h-2.5 ${isSelected ? 'text-[#0C1012]' : 'text-[#F59E0B]'}`} />
                <span>{loc.name}</span>
              </button>
            );
          })}

          {/* Center Coordinates Card */}
          <div className="absolute bottom-2 left-2 bg-[#13191C]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-mono text-[#8E9EA2]">
            Selected: <span className="font-bold text-slate-200">{selectedLoc?.name}</span> ({selectedLoc?.lat.toFixed(4)}, {selectedLoc?.lng.toFixed(4)})
          </div>
        </div>

        {/* Scrollable List of Localities */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-1.5">
          <div className="text-[11px] font-mono tracking-widest text-[#8E9EA2] uppercase px-1 pb-1">
            Available Localities ({filteredLocalities.length})
          </div>

          {filteredLocalities.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#8E9EA2]">
              No matching locality found in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {filteredLocalities.map((loc) => {
                const isSelected = selectedLoc?.name === loc.name;
                return (
                  <button
                    key={loc.name}
                    onClick={() => setSelectedLoc(loc)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-500 bg-white/[0.08] text-white'
                        : 'border-white/[0.06] hover:bg-white/[0.04] text-[#8E9EA2] hover:text-[#E0EBE9]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#8E9EA2]'}`} />
                      <div>
                        <div className="text-xs font-semibold">{loc.name}</div>
                        <div className="text-[10px] opacity-70">{loc.zone}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#8E9EA2] truncate">
            {selectedLoc ? (
              <span>Area: <strong className="text-[#E0EBE9]">{selectedLoc.name}</strong> ({selectedLoc.zone})</span>
            ) : (
              <span>Please pick an area</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#8E9EA2] hover:text-white rounded-full cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-slate-200 hover:bg-white text-[#0C1012] text-xs font-bold rounded-full shadow-lg shadow-black/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
