import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search,
  MapPin,
  Filter,
  Grid,
  List,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Compass,
  Navigation,
  ArrowUpDown,
  Smartphone,
  Briefcase,
  Bookmark,
  Map,
  PlusCircle,
  Zap,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';
import ProviderCard from '../components/ProviderCard';
import CreateServiceModal from '../components/CreateServiceModal';
import LocalityMapModal from '../components/LocalityMapModal';
import LocationPromptModal from '../components/LocationPromptModal';
import InstaHelpModal from '../components/InstaHelpModal';

const CATEGORIES = [
  'All',
  'Beauty, Styling & Wellness',
  'Home Cleaning & Hygiene',
  'Home Improvement, Painting & Decor',
  'Appliance, AC & Electronics Repair',
  'General Handyman & Utility Services',
  'Smart Home & Product Installation',
  'Rapid Response & Customer Support',
  'Artisans & Informal Guilds',
  'Create Your Own Service',
];

const LOCALITIES = [
  { value: '', label: 'All of Hyderabad' },
  { value: 'Koti', label: 'Koti / Sultan Bazar' },
  { value: 'Abids', label: 'Abids' },
  { value: 'Kukatpally', label: 'Kukatpally' },
  { value: 'Ameerpet', label: 'Ameerpet' },
  { value: 'Banjara Hills', label: 'Banjara Hills' },
  { value: 'Hitec City', label: 'Hitec City / Madhapur' },
  { value: 'Mehdipatnam', label: 'Mehdipatnam' },
  { value: 'Charminar', label: 'Charminar / Old City' },
  { value: 'Secunderabad', label: 'Secunderabad' },
  { value: 'Dilsukhnagar', label: 'Dilsukhnagar' },
  { value: 'Begumpet', label: 'Begumpet' },
];

export default function CustomerHomePage() {
  const {
    t,
    userLocation,
    detectLocation,
    customerUser,
    logoutCustomerUser,
    selectedLocality: contextLocality,
    setSelectedLocality: setContextLocality,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [selectedLocality, setSelectedLocality] = useState(
    searchParams.get('locality') || contextLocality || customerUser?.locality || ''
  );
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxDistance, setMaxDistance] = useState('');
  const [sortBy, setSortBy] = useState('nearest');
  const [viewMode, setViewMode] = useState('grid');

  // Data state
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showInstaHelpModal, setShowInstaHelpModal] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    const loc = searchParams.get('locality');
    if (q !== null) setSearchTerm(q);
    if (cat !== null) setSelectedCategory(cat);
    if (loc !== null) {
      setSelectedLocality(loc);
    } else if (contextLocality) {
      setSelectedLocality(contextLocality);
    } else if (customerUser?.locality) {
      setSelectedLocality(customerUser.locality);
    }
  }, [searchParams, contextLocality, customerUser]);

  const handleLocalitySelect = (loc) => {
    setSelectedLocality(loc);
    if (setContextLocality) setContextLocality(loc);
    const newParams = new URLSearchParams(searchParams);
    if (loc) {
      newParams.set('locality', loc);
    } else {
      newParams.delete('locality');
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, selectedLocality, onlyAvailable, maxDistance, sortBy, userLocation.hasGps]);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedLocality.trim()) params.append('locality', selectedLocality.trim());
      if (onlyAvailable) params.append('isAvailable', 'true');
      if (sortBy) params.append('sort', sortBy);

      if (userLocation.hasGps && userLocation.lat && userLocation.lng) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        if (maxDistance) {
          params.append('maxDistance', maxDistance);
        }
      }

      const res = await fetch(`/api/workers?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setWorkers(data.data);
      } else {
        setError(data.message || 'Failed to load providers');
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocality('');
    setOnlyAvailable(false);
    setMaxDistance('');
    setSortBy('nearest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-slate-300 text-xs font-semibold mb-2 border border-white/[0.08]">
            <Compass className="w-3.5 h-3.5" />
            <span>Direct Local Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#E0EBE9]">
            Find Trusted People Near You
          </h1>
          <p className="text-xs sm:text-sm text-[#8E9EA2] mt-1">
            Verified local availability, direct contact, and honest rates.
          </p>
        </div>

        {/* GPS location pill */}
        <div className="glass-panel px-4 py-2.5 rounded-2xl flex flex-wrap items-center gap-3 border border-white/[0.08]">
          <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-[#E0EBE9]">
              {selectedLocality ? `📍 ${selectedLocality}` : 'All of Hyderabad'}
            </p>
            <p className="text-[#8E9EA2] text-[10px]">
              {userLocation.hasGps ? `GPS Active (${userLocation.localityName})` : 'Choose your neighborhood'}
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              const loc = await detectLocation();
              if (loc?.localityName) {
                setSelectedLocality(loc.localityName);
                if (!loc.isWithinHyderabad || !loc.isGps) {
                  setShowMapModal(true);
                }
              }
            }}
            disabled={userLocation.loading}
            className="ml-auto px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-amber-500/40 text-xs font-bold text-[#E4ECEC] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Navigation className={`w-3.5 h-3.5 text-[#F59E0B] ${userLocation.loading ? 'animate-spin' : ''}`} />
            <span>{userLocation.loading ? 'Detecting...' : 'Choose My Current Location'}</span>
          </button>
        </div>
      </div>

      {/* Location warning if permission denied */}
      {userLocation.error && (
        <div className="glass-panel border-amber-500/30 text-amber-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{userLocation.error}</span>
          </div>
          <button
            onClick={() => setSelectedLocality('Kukatpally')}
            className="text-amber-300 font-bold underline ml-2 cursor-pointer"
          >
            Select Kukatpally
          </button>
        </div>
      )}

      {/* Main Filter & Search Control Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-4">
        
        {/* Row 1: Search Input & Locality */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-[#8E9EA2] absolute left-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search service, craft, or worker name..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-[#E0EBE9] placeholder-[#8E9EA2]/70 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="md:col-span-5 relative flex items-center gap-1.5">
            <div className="relative flex-1 flex items-center">
              <MapPin className="w-4 h-4 text-[#F59E0B] absolute left-4" />
              <select
                value={selectedLocality}
                onChange={(e) => {
                  if (e.target.value === 'MAP_MODAL') {
                    setShowMapModal(true);
                  } else if (e.target.value === 'CURRENT_LOCATION') {
                    window.dispatchEvent(new CustomEvent('open-location-gate'));
                  } else {
                    setSelectedLocality(e.target.value);
                  }
                }}
                className="w-full pl-11 pr-8 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs sm:text-sm text-[#E0EBE9] focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="CURRENT_LOCATION" className="bg-[#13191C] text-[#F59E0B] font-bold">
                  📍 Choose My Current Location
                </option>
                {LOCALITIES.map((loc) => (
                  <option key={loc.value} value={loc.value} className="bg-[#13191C] text-[#E0EBE9]">
                    {loc.label}
                  </option>
                ))}
                {selectedLocality && !LOCALITIES.some((l) => l.value === selectedLocality) && (
                  <option value={selectedLocality} className="bg-[#13191C] text-[#E0EBE9]">📍 {selectedLocality}</option>
                )}
                <option value="MAP_MODAL" className="bg-[#13191C] text-slate-300">🗺️ Select on Map...</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-location-gate'))}
              className="p-3 rounded-2xl border border-amber-500/40 hover:border-amber-500 bg-white/[0.04] hover:bg-white/[0.08] text-[#F59E0B] transition-all cursor-pointer shrink-0"
              title="Location Permission & Detection (GPS / Hyderabad)"
            >
              <Navigation className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="p-3 rounded-2xl border border-white/[0.08] hover:border-white/30 bg-white/[0.04] hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              title="Pick Locality on Map"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-sm rounded-2xl shadow-lg shadow-black/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Row 2: Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isCreateOwn = cat === 'Create Your Own Service';
            return (
              <button
                key={cat}
                onClick={() => {
                  if (isCreateOwn) {
                    setShowCreateServiceModal(true);
                  } else {
                    setSelectedCategory(cat);
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#E0EBE9] text-[#0B0F10] border-white shadow-md'
                    : isCreateOwn
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                    : 'bg-white/[0.04] text-[#8E9EA2] border-white/[0.08] hover:text-[#E0EBE9] hover:bg-white/[0.08]'
                }`}
              >
                {isCreateOwn && <PlusCircle className="w-3.5 h-3.5 text-rose-400" />}
                <span>{cat === 'All' ? t.categories.all : cat}</span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Secondary Filters */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Available Now Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-3.5 h-3.5 accent-slate-400 rounded"
              />
              <span className="font-medium text-[#E0EBE9]">
                Available Now
              </span>
            </label>

            {/* Distance Filter */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
              <span className="text-[#8E9EA2] font-medium">Distance:</span>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="bg-transparent font-semibold text-[#E0EBE9] focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#13191C] text-[#E0EBE9]">All Distances</option>
                <option value="1" className="bg-[#13191C] text-[#E0EBE9]">Within 1 km</option>
                <option value="2" className="bg-[#13191C] text-[#E0EBE9]">Within 2 km</option>
                <option value="5" className="bg-[#13191C] text-[#E0EBE9]">Within 5 km</option>
                <option value="10" className="bg-[#13191C] text-[#E0EBE9]">Within 10 km</option>
              </select>
            </div>

            {/* Reset */}
            {(selectedCategory !== 'All' || selectedLocality || onlyAvailable || maxDistance || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[#8E9EA2] hover:text-red-400 font-medium px-2 py-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8E9EA2]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-[#E0EBE9] focus:outline-none cursor-pointer"
              >
                <option value="nearest" className="bg-[#13191C] text-[#E0EBE9]">Nearest First</option>
                <option value="price_asc" className="bg-[#13191C] text-[#E0EBE9]">Price: Low to High</option>
                <option value="price_desc" className="bg-[#13191C] text-[#E0EBE9]">Price: High to Low</option>
                <option value="views" className="bg-[#13191C] text-[#E0EBE9]">Most Viewed</option>
                <option value="newest" className="bg-[#13191C] text-[#E0EBE9]">Newest Registered</option>
              </select>
            </div>

            {/* List / Grid Toggle */}
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded-full border border-white/[0.08]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-white/15 text-[#E0EBE9]' : 'text-[#8E9EA2] hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-white/15 text-[#E0EBE9]' : 'text-[#8E9EA2] hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Status */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm text-[#8E9EA2]">
          Showing <span className="font-bold text-[#E0EBE9]">{workers.length}</span> local providers
          {selectedCategory !== 'All' && <span> in <strong className="text-[#E0EBE9]">{selectedCategory}</strong></span>}
          {selectedLocality && <span> near <strong className="text-[#E0EBE9]">{selectedLocality}</strong></span>}
        </p>
      </div>

      {/* Providers Grid / List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 glass-panel rounded-2xl animate-pulse p-5 border border-white/[0.06]" />
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-red-500/20">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#E0EBE9]">{error}</h3>
          <button
            onClick={fetchProviders}
            className="px-6 py-2.5 bg-white/[0.08] hover:bg-white/[0.14] text-[#E0EBE9] font-bold rounded-full text-xs"
          >
            Retry Search
          </button>
        </div>
      ) : workers.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/[0.08]">
          <Compass className="w-12 h-12 text-[#8E9EA2] mx-auto" />
          <h3 className="text-xl font-heading font-bold text-[#E0EBE9]">
            No matching workers in this area
          </h3>
          <p className="text-xs sm:text-sm text-[#8E9EA2] max-w-md mx-auto">
            Try expanding your distance filter, clearing category selection, or choosing another locality in Hyderabad.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-slate-200 hover:bg-white text-[#0C1012] font-bold text-xs rounded-full cursor-pointer transition-all"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
          {workers.map((w) => (
            <ProviderCard key={w._id} worker={w} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTAHELP 20-MINUTE EMERGENCY DISPATCH BANNER                              */}
      {/* ========================================================================= */}
      <section className="pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#182024] to-[#13191C] border border-amber-500/30 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#F59E0B]">
                  <Zap className="w-5 h-5 fill-amber-400 animate-pulse" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                  InstaHelp™ Emergency Dispatch
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-[#F59E0B] font-bold uppercase">
                  ⚡ 20 Mins
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#E0EBE9]">
                Power Blackout, Pipe Burst, or Door Lockout?
              </h3>

              <p className="text-xs sm:text-sm text-[#8E9EA2] leading-relaxed">
                Emergency rapid technicians dispatched directly to your Hyderabad home in 15–20 minutes. Zero surge pricing, transparent direct rates.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowInstaHelpModal(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>1-Tap WhatsApp Emergency</span>
              </button>

              <a
                href="tel:+919876543227"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <PhoneCall className="w-4 h-4 text-[#0B0F10]" />
                <span>Direct Hotline</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <CreateServiceModal
        isOpen={showCreateServiceModal}
        onClose={() => setShowCreateServiceModal(false)}
      />

      <LocalityMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        currentLocality={selectedLocality}
        onSelectLocality={(locName) => {
          handleLocalitySelect(locName);
        }}
      />

      <LocationPromptModal
        isOpen={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
        currentLocality={selectedLocality}
        onSelectLocality={(locName) => {
          handleLocalitySelect(locName);
        }}
        detectLocation={detectLocation}
        userLocation={userLocation}
      />

      <InstaHelpModal
        isOpen={showInstaHelpModal}
        onClose={() => setShowInstaHelpModal(false)}
      />
    </div>
  );
}
