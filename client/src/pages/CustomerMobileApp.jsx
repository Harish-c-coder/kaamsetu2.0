import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Wifi,
  Battery,
  Signal,
  Smartphone,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Compass,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Map as MapIcon,
  Mic,
  X,
  Layers,
  Star,
  Users,
  Briefcase,
  Navigation,
} from 'lucide-react';
import LocalityMapModal from '../components/LocalityMapModal';
import CreateServiceModal from '../components/CreateServiceModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { SERVICE_CATEGORIES } from '../utils/categoriesData';
import { requestCurrentLocation, HYDERABAD_LOCALITIES } from '../utils/geoUtils';

export default function CustomerMobileApp() {
  const {
    t,
    tr,
    customerUser,
    selectedLocality: contextLocality,
    setSelectedLocality: setContextLocality,
  } = useApp();
  const navigate = useNavigate();

  const [frameMode, setFrameMode] = useState(true); // Phone frame bezel toggle
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'categories', 'map', 'connect'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocality, setSelectedLocality] = useState(() => {
    return localStorage.getItem('hlc_user_locality') || contextLocality || 'Koti';
  });
  const [availableOnly, setAvailableOnly] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [searchLocalityQuery, setSearchLocalityQuery] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Fetch workers from backend API
  useEffect(() => {
    fetchWorkers();
  }, [selectedCategory, selectedLocality, availableOnly]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      let url = `/api/workers?locality=${encodeURIComponent(selectedLocality)}`;
      if (selectedCategory && selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (availableOnly) {
        url += `&available=true`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setWorkers(data.data);
      }
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocality = (locName) => {
    setSelectedLocality(locName);
    if (setContextLocality) setContextLocality(locName);
    localStorage.setItem('hlc_user_locality', locName);
    setShowLocationSheet(false);
    setShowMapModal(false);
    setLocationNotice({
      text: locName ? `📍 Location set to ${locName}` : `📍 Showing All of Hyderabad`,
      type: 'success',
    });
    setTimeout(() => setLocationNotice(null), 4000);
  };

  const handleChooseCurrentLocation = async () => {
    setGpsLoading(true);
    setLocationNotice({
      text: 'Detecting your device coordinates...',
      type: 'loading',
    });
    try {
      const loc = await requestCurrentLocation();
      if (loc?.localityName) {
        if (loc.isWithinHyderabad && loc.isGps) {
          handleSelectLocality(loc.localityName);
          setLocationNotice({
            text: `📍 GPS Live: ${loc.localityName} (${loc.distanceKm} km away)`,
            type: 'success',
          });
          setTimeout(() => setLocationNotice(null), 4500);
        } else {
          // Approximate network location or outside Hyderabad
          setSelectedLocality(loc.localityName);
          if (setContextLocality) setContextLocality(loc.localityName);
          setShowLocationSheet(true); // Open sheet so user can confirm or pick in 1 tap!
          setLocationNotice({
            text: loc.isWithinHyderabad
              ? `📍 Network placed you near ${loc.localityName}. Tap to change if needed.`
              : `📍 Carrier network is in ${loc.city || 'AP/Telangana'}. Please tap your Hyderabad neighborhood below:`,
            type: 'error',
          });
        }
      }
    } catch (err) {
      console.warn('GPS error in mobile view:', err);
      setShowLocationSheet(true);
      setLocationNotice({
        text: '📍 GPS unavailable. Tap your Hyderabad area below:',
        type: 'error',
      });
    } finally {
      setGpsLoading(false);
    }
  };

  // Filtered workers by client search
  const filteredWorkers = workers.filter((w) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      (w.description && w.description.toLowerCase().includes(q))
    );
  });

  const handleWhatsApp = (worker) => {
    const text = encodeURIComponent(
      `Hello ${worker.name}, I found your ${worker.category} profile on KaamSetu in ${selectedLocality}. Are you currently available for service?`
    );
    const clean = (worker.phone || '').replace(/[^\d]/g, '');
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  const handleCall = (worker) => {
    window.location.href = `tel:${worker.phone}`;
  };

  return (
    <div className="min-h-screen bg-[#0C1012] text-[#E4ECEC] flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-sm flex items-center justify-between gap-2 mb-3 bg-[#13191C] p-2.5 rounded-2xl border border-white/[0.08] shadow-lg">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#E4ECEC]">
          <Smartphone className="w-4 h-4 text-[#F59E0B]" />
          <span>KaamSetu Mobile Customer App</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFrameMode(!frameMode)}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#E4ECEC] transition-colors cursor-pointer border border-white/10"
            title="Toggle Smartphone Bezel"
          >
            {frameMode ? 'Hide Bezel' : 'Show Bezel'}
          </button>
          
          <Link
            to="/worker/app"
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#E2E8F0] text-[#0B0F10] hover:bg-white transition-colors flex items-center gap-1"
            title="Switch to Worker App View"
          >
            <Briefcase className="w-3 h-3 text-[#0B0F10]" />
            <span>Worker App ↗</span>
          </Link>
        </div>
      </div>

      {/* Smartphone Container */}
      <div
        className={`w-full max-w-[390px] bg-black rounded-[44px] p-2.5 shadow-2xl relative transition-all duration-300 ${
          frameMode
            ? 'border-[10px] border-[#182024] ring-1 ring-white/10'
            : 'border-0 p-0 rounded-2xl max-w-md'
        }`}
      >
        {/* Smartphone Screen Inner */}
        <div className="bg-[#0C1012] w-full rounded-[36px] overflow-hidden flex flex-col h-[750px] relative text-[#E4ECEC] shadow-inner border border-white/[0.06]">
          
          {/* Status Bar */}
          <div className="bg-[#13191C] pt-2 px-6 pb-1.5 flex items-center justify-between text-[11px] font-bold tracking-tight text-[#8E9EA2] shrink-0 select-none border-b border-white/[0.04]">
            <span>10:24</span>
            
            {/* Dynamic Island / Speaker Pill */}
            <div className="w-20 h-4 bg-black rounded-full mx-auto border border-white/[0.08]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-300">5G</span>
              <Signal className="w-3.5 h-3.5 text-slate-300" />
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <Battery className="w-4 h-4 text-[#34D399]" />
            </div>
          </div>

          {/* App Header */}
          <div className="bg-[#13191C] px-3.5 py-2.5 border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#F59E0B]">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-[#E4ECEC] leading-none">
                  KaamSetu<span className="text-[#F59E0B]">•</span>
                </h1>
                <span className="text-[10px] text-[#8E9EA2] font-medium">Hyperlocal Services</span>
              </div>
            </div>

            {/* Locality Pill & Quick GPS Button */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowLocationSheet(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-[#E4ECEC] border border-white/10 rounded-full text-xs font-bold transition-all cursor-pointer"
                title="Choose Your Locality"
              >
                <MapPin className="w-3 h-3 text-[#F59E0B] shrink-0" />
                <span className="truncate max-w-[80px]">{selectedLocality || 'Hyderabad'}</span>
              </button>

              <button
                onClick={handleChooseCurrentLocation}
                disabled={gpsLoading}
                className="p-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#F59E0B] border border-amber-500/30 cursor-pointer"
                title="Choose My Current Location (GPS / Network)"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Real-time Location Feedback Banner */}
          {locationNotice && (
            <div
              onClick={() => setShowLocationSheet(true)}
              className={`px-3 py-2 text-[11px] font-bold flex items-center justify-between shrink-0 cursor-pointer transition-all border-b ${
                locationNotice.type === 'loading'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 animate-pulse'
                  : locationNotice.type === 'error'
                  ? 'bg-red-500/15 border-red-500/30 text-red-200'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Navigation
                  className={`w-3.5 h-3.5 shrink-0 ${
                    locationNotice.type === 'loading' ? 'animate-spin text-[#F59E0B]' : 'text-[#34D399]'
                  }`}
                />
                <span className="truncate">{locationNotice.text}</span>
              </div>
              <span className="text-[10px] underline ml-2 shrink-0 opacity-80">
                Change Area
              </span>
            </div>
          )}

          {/* Scrollable Main App Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin">
            
            {/* TAB 1: DISCOVER / FIND SERVICES */}
            {activeTab === 'discover' && (
              <>
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8E9EA2] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search electrician, salon, AC, cleaner..."
                    className="w-full pl-9 pr-9 py-2 bg-[#0F172A] border border-[#334155] rounded-2xl text-xs font-medium text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-[#8E9EA2] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Locality Switcher Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <span className="text-[10px] text-[#8E9EA2] shrink-0 font-medium">Quick Area:</span>
                  {['Koti', 'Abids', 'Mehdipatnam', 'Charminar', 'Banjara Hills', 'Ameerpet', 'Kukatpally', 'Hitec City'].map((loc) => {
                    const isSelected = selectedLocality === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleSelectLocality(loc)}
                        className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#F59E0B] text-[#0B0F10] border-amber-400 font-bold shadow-sm'
                            : 'bg-white/[0.04] text-[#8E9EA2] border-white/[0.08] hover:text-[#E4ECEC] hover:bg-white/[0.08]'
                        }`}
                      >
                        {isSelected ? `📍 ${loc}` : loc}
                      </button>
                    );
                  })}
                </div>

                {/* Direct Connect Quick Banner */}
                <div className="bg-[#182024] p-3 rounded-2xl shadow-sm space-y-1 border border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#34D399] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#34D399]" />
                      Direct Local Connect
                    </span>
                    <span className="text-[9px] bg-white/[0.08] text-slate-200 px-1.5 py-0.5 rounded-full border border-white/10">Direct Pricing</span>
                  </div>
                  <p className="text-xs text-[#8E9EA2]">
                    Connect directly with local verified pros in Hyderabad. Zero hidden markups.
                  </p>
                </div>

                {/* Category Horizontal Carousel */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-extrabold text-[#E4ECEC]">Popular Categories</span>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="text-[11px] text-[#F59E0B] font-bold hover:underline"
                    >
                      View All ({SERVICE_CATEGORIES.length}) →
                    </button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        selectedCategory === 'All'
                          ? 'bg-[#E2E8F0] text-[#0B0F10] shadow-sm'
                          : 'bg-[#13191C] text-[#8E9EA2] border border-white/[0.08] hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {SERVICE_CATEGORIES.map((cat) => {
                      const isSel = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSel
                              ? 'bg-[#E2E8F0] text-[#0B0F10] font-bold shadow-sm'
                              : 'bg-[#13191C] text-[#8E9EA2] border border-white/[0.08] hover:text-white'
                          }`}
                        >
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div className="bg-[#13191C] p-2.5 rounded-2xl border border-white/[0.08] shadow-xs flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[#E4ECEC]">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                      className="accent-amber-500 w-3.5 h-3.5 rounded"
                    />
                    <span>Available Now Only</span>
                  </label>

                  <button
                    onClick={() => setShowMapModal(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] hover:underline cursor-pointer"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>Map View</span>
                  </button>
                </div>

                {/* Nearby Providers List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-extrabold text-[#E4ECEC]">
                      Nearby in {selectedLocality}
                    </span>
                    <span className="text-[11px] text-[#8E9EA2] font-medium">
                      {filteredWorkers.length} found
                    </span>
                  </div>

                  {loading ? (
                    <div className="py-12 text-center text-xs text-[#8E9EA2]">
                      Searching verified workers in {selectedLocality}...
                    </div>
                  ) : filteredWorkers.length === 0 ? (
                    <div className="bg-[#13191C] rounded-2xl p-6 text-center border border-white/[0.08] space-y-2.5">
                      <div className="w-12 h-12 bg-white/[0.04] rounded-full flex items-center justify-center text-amber-500 mx-auto text-xl border border-white/[0.08]">
                        🔍
                      </div>
                      <h4 className="font-bold text-xs text-[#E4ECEC]">
                        No workers found in {selectedLocality} for "{selectedCategory}"
                      </h4>
                      <p className="text-[11px] text-[#8E9EA2]">
                        Pick another area on the map or detect your current GPS location.
                      </p>
                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          onClick={handleChooseCurrentLocation}
                          className="w-full py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-amber-500/40 text-[#E4ECEC] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Choose My Current Location</span>
                        </button>
                        <button
                          onClick={() => setShowMapModal(true)}
                          className="w-full py-2 bg-[#E2E8F0] hover:bg-white text-[#0B0F10] text-xs font-bold rounded-xl"
                        >
                          🗺️ Select Another Area on Map
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredWorkers.map((worker) => (
                      <div
                        key={worker._id}
                        className="bg-[#13191C] rounded-2xl p-3 border border-white/[0.08] shadow-xs hover:border-white/20 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                worker.profileImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  worker.name
                                )}&background=182024&color=E4ECEC&size=100`
                              }
                              alt={worker.name}
                              className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-xs text-[#E4ECEC]">
                                  {worker.name}
                                </h4>
                                <span className="inline-block w-2 h-2 rounded-full bg-[#34D399]" title="Verified Worker" />
                              </div>
                              <span className="inline-block px-2 py-0.5 bg-white/[0.05] text-[#F59E0B] rounded-md text-[10px] font-bold border border-white/[0.06]">
                                {worker.category}
                              </span>
                              <div className="text-[10px] text-[#8E9EA2] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-[#F59E0B]" />
                                <span>{worker.locality || selectedLocality}</span>
                                {worker.startingPrice && (
                                  <span>• Starts ₹{worker.startingPrice}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Availability badge */}
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                              worker.isAvailable
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {worker.isAvailable ? 'Available' : 'Busy'}
                          </span>
                        </div>

                        {worker.description && (
                          <p className="text-[11px] text-[#8E9EA2] line-clamp-2 bg-[#0F172A] p-2 rounded-xl border border-[#334155]">
                            {worker.description}
                          </p>
                        )}

                        {/* Direct Action Buttons: WhatsApp & Call */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleWhatsApp(worker)}
                            className="py-2 px-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleCall(worker)}
                            className="py-2 px-2.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Now</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* TAB 2: CATEGORIES VIEW */}
            {activeTab === 'categories' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#E4ECEC]">All Service Categories</h3>
                  <span className="text-[11px] text-[#8E9EA2]">7 Hubs & Artisans</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setActiveTab('discover');
                      }}
                      className="bg-[#13191C] p-3 rounded-2xl border border-white/[0.08] hover:border-amber-500/50 cursor-pointer transition-all flex items-center gap-3 group"
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-[#E4ECEC] truncate">{cat.name}</h4>
                          <span className="text-[10px] text-[#F59E0B] font-bold">Starts ₹{cat.startingPrice}</span>
                        </div>
                        <p className="text-[11px] text-[#8E9EA2] line-clamp-1 mt-0.5">{cat.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8E9EA2] group-hover:text-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: HYDERABAD MAP RADAR */}
            {activeTab === 'map' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#E4ECEC]">Hyderabad Radar</h3>
                    <p className="text-[11px] text-[#8E9EA2]">
                      Active in {selectedLocality}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="px-2.5 py-1 bg-[#E2E8F0] hover:bg-white text-[#0B0F10] text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Open Map Modal
                  </button>
                </div>

                <div className="bg-[#13191C] p-3 rounded-2xl border border-white/[0.08] space-y-3">
                  <div className="w-full h-44 bg-[#0C1012] rounded-xl relative border border-white/[0.08] flex items-center justify-center p-2 overflow-hidden">
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:14px_14px]" />
                    
                    {/* Active Locality Pin */}
                    <div className="relative z-10 text-center animate-bounce">
                      <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#0B0F10] flex items-center justify-center shadow-lg mx-auto font-bold">
                        <MapPin className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-[#182024] text-[#E4ECEC] border border-white/10 text-[10px] font-bold">
                        {selectedLocality}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-[#13191C]/90 px-2 py-0.5 rounded border border-white/10 text-[#8E9EA2]">
                      Radar: {selectedLocality}, Hyd
                    </div>
                  </div>

                  <button
                    onClick={handleChooseCurrentLocation}
                    disabled={gpsLoading}
                    className="w-full py-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-amber-500/40 text-[#E4ECEC] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className={`w-4 h-4 text-[#F59E0B] ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>{gpsLoading ? 'Detecting...' : 'Choose My Current Location'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: DIRECT CONNECT & CUSTOMER PROFILE */}
            {activeTab === 'connect' && (
              <div className="space-y-3">
                {customerUser ? (
                  <div className="bg-[#13191C] rounded-2xl p-3.5 border border-white/[0.08] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-[#F59E0B] font-bold flex items-center justify-center text-xs border border-white/10">
                          {customerUser.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-[#E4ECEC]">{customerUser.name}</h4>
                          <span className="text-[10px] text-[#8E9EA2]">{customerUser.locality}, Hyderabad</span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                        Customer
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06] text-xs">
                      <Link
                        to="/customer/profile"
                        className="py-1.5 bg-[#E2E8F0] text-[#0B0F10] text-center font-bold rounded-lg text-[11px]"
                      >
                        ⭐ Saved ({customerUser.savedWorkers?.length || 0})
                      </Link>
                      <Link
                        to="/customer/profile"
                        className="py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#E4ECEC] text-center font-bold rounded-lg text-[11px] border border-white/10"
                      >
                        Full Profile
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#13191C] rounded-2xl p-3.5 border border-white/[0.08] shadow-xs space-y-2 text-center">
                    <h4 className="font-bold text-xs text-[#E4ECEC]">Sign in to Save Local Workers</h4>
                    <p className="text-[10px] text-[#8E9EA2]">
                      Keep a handy list of your favorite electricians, plumbers, and artisans
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        to="/customer/login"
                        className="py-2 bg-white/[0.06] border border-white/10 text-[#E4ECEC] font-bold text-xs rounded-xl"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/customer/register"
                        className="py-2 bg-[#E2E8F0] text-[#0B0F10] font-bold text-xs rounded-xl"
                      >
                        Sign Up
                      </Link>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] font-semibold text-[#F59E0B] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-[#13191C] rounded-2xl p-4 border border-white/[0.08] space-y-2">
                  <h3 className="font-extrabold text-xs text-[#E4ECEC] uppercase tracking-wider">
                    Direct Local Marketplace
                  </h3>
                  <p className="text-xs text-[#8E9EA2] leading-relaxed">
                    Connect directly with verified local pros across Hyderabad with transparent pricing, zero middleman markup, and rapid 20-min emergency response.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Bottom App Navigation Bar (4 Tabs) */}
          <div className="bg-[#13191C] border-t border-white/[0.08] px-3 py-2 flex items-center justify-around shrink-0">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                activeTab === 'discover'
                  ? 'text-white font-extrabold'
                  : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeTab === 'discover' ? 'text-[#F59E0B]' : ''}`} />
              <span className="text-[10px]">Discover</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                activeTab === 'categories'
                  ? 'text-white font-extrabold'
                  : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'categories' ? 'text-[#F59E0B]' : ''}`} />
              <span className="text-[10px]">Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                activeTab === 'map'
                  ? 'text-white font-extrabold'
                  : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
              }`}
            >
              <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#F59E0B]' : ''}`} />
              <span className="text-[10px]">Map Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('connect')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                activeTab === 'connect'
                  ? 'text-white font-extrabold'
                  : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === 'connect' ? 'text-[#F59E0B]' : ''}`} />
              <span className="text-[10px]">Connect</span>
            </button>
          </div>

          {/* Home Indicator Bar */}
          <div className="bg-[#13191C] pb-1.5 pt-0.5 flex justify-center shrink-0">
            <div className="w-28 h-1 rounded-full bg-white/20" />
          </div>

          {/* Native In-App Mobile Location Bottom Sheet */}
          {showLocationSheet && (
            <div
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in"
              onClick={() => setShowLocationSheet(false)}
            >
              <div
                className="bg-[#13191C] rounded-t-3xl border-t border-white/15 p-4 max-h-[82%] flex flex-col space-y-3 shadow-2xl cursor-default animate-in slide-in-from-bottom duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag pill handle */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto" />

                {/* Sheet Title & Close */}
                <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-[#E4ECEC]">
                      Choose Your Hyderabad Area
                    </h3>
                    <p className="text-[10px] text-[#8E9EA2]">
                      1-Tap to view verified workers in your neighborhood
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLocationSheet(false)}
                    className="p-1 rounded-full bg-white/[0.04] text-[#8E9EA2] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 1-Click Detect GPS Button */}
                <button
                  type="button"
                  onClick={handleChooseCurrentLocation}
                  disabled={gpsLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-amber-500/40 text-xs font-bold text-[#E4ECEC] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <Navigation className={`w-4 h-4 text-[#F59E0B] ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{gpsLoading ? 'Scanning Coordinates...' : '📍 Auto-Detect Device GPS'}</span>
                </button>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8E9EA2] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchLocalityQuery}
                    onChange={(e) => setSearchLocalityQuery(e.target.value)}
                    placeholder="Search area (e.g. Kukatpally, Madhapur, Ameerpet...)"
                    className="w-full pl-8 pr-3 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60"
                  />
                  {searchLocalityQuery && (
                    <button
                      onClick={() => setSearchLocalityQuery('')}
                      className="absolute right-2.5 top-2 text-[#8E9EA2] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick 1-Tap Neighborhood List */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-72 scrollbar-thin">
                  {/* Option: All of Hyderabad */}
                  <button
                    type="button"
                    onClick={() => handleSelectLocality('')}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer border ${
                      !selectedLocality
                        ? 'bg-white/15 border-white/20 text-[#E4ECEC] font-bold'
                        : 'bg-white/[0.03] border-white/[0.04] text-[#8E9EA2] hover:text-[#E4ECEC] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="text-xs">All of Hyderabad (Browse All)</span>
                    </div>
                    {!selectedLocality && <Check className="w-3.5 h-3.5 text-[#34D399]" />}
                  </button>

                  {/* Neighborhoods list */}
                  {HYDERABAD_LOCALITIES.filter((loc) =>
                    loc.name.toLowerCase().includes(searchLocalityQuery.toLowerCase()) ||
                    loc.zone.toLowerCase().includes(searchLocalityQuery.toLowerCase())
                  ).map((loc) => {
                    const isSel = selectedLocality === loc.name;
                    return (
                      <button
                        key={loc.name}
                        type="button"
                        onClick={() => handleSelectLocality(loc.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer border ${
                          isSel
                            ? 'bg-amber-500/15 border-amber-500/40 text-[#E4ECEC] font-bold'
                            : 'bg-white/[0.02] border-white/[0.04] text-[#8E9EA2] hover:text-[#E4ECEC] hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${isSel ? 'text-[#F59E0B]' : 'text-[#8E9EA2]'}`} />
                          <div>
                            <span className="text-xs font-semibold block text-[#E4ECEC]">{loc.name}</span>
                            <span className="text-[9px] text-[#8E9EA2] block">{loc.zone}</span>
                          </div>
                        </div>
                        {isSel && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Locality Map Modal */}
      <LocalityMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        currentLocality={selectedLocality}
        onSelectLocality={(locName) => {
          setSelectedLocality(locName);
          if (setContextLocality) setContextLocality(locName);
          setLocationNotice({
            text: `📍 Locality set to ${locName}`,
            type: 'success',
          });
          setTimeout(() => setLocationNotice(null), 4000);
          setShowMapModal(false);
        }}
      />

      {/* Create Custom Service Modal */}
      <CreateServiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialAccountType="customer"
      />
    </div>
  );
}
