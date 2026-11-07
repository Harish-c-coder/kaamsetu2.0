import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search,
  MapPin,
  Compass,
  ArrowRight,
  Zap,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Clock,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Filter,
  Mic,
  Star,
  Layers,
  Percent,
  SlidersHorizontal,
  ChevronDown,
  Navigation,
  Users,
} from 'lucide-react';
import LocalityMapModal from '../components/LocalityMapModal';
import LocationPromptModal from '../components/LocationPromptModal';
import CategoryDetailModal from '../components/CategoryDetailModal';
import InstaHelpModal from '../components/InstaHelpModal';
import VoiceInput from '../components/VoiceInput';
import { SERVICE_CATEGORIES } from '../utils/categoriesData';

export default function LandingPage() {
  const {
    t,
    tr,
    language,
    userLocation,
    detectLocation,
    customerUser,
    workerUser,
    selectedLocality,
    setSelectedLocality,
  } = useApp();

  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryModal, setSelectedCategoryModal] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showInstaHelpModal, setShowInstaHelpModal] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);

  useEffect(() => {
    // Auto-prompt location on first visit if not selected
    const hasSeenPrompt = sessionStorage.getItem('hlc_prompted_locality');
    const existingLoc = selectedLocality || customerUser?.locality || workerUser?.locality;
    if (!existingLoc && !hasSeenPrompt) {
      setShowLocationPrompt(true);
      sessionStorage.setItem('hlc_prompted_locality', 'true');
    }
  }, [selectedLocality]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedLocality) params.set('locality', selectedLocality);
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    navigate(`/customer/home?${params.toString()}`);
  };

  const handleVoiceTranscript = (text) => {
    if (text) {
      setSearchTerm(text);
      setShowVoiceSearch(false);
      navigate(`/customer/home?q=${encodeURIComponent(text)}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* ========================================================================= */}
      {/* 1. MONUMENTAL ARCHITECTURAL HERO SECTION                                  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden min-h-[560px] sm:min-h-[640px] flex flex-col justify-between border-b border-white/[0.08] bg-[#0B0F10]">
        
        {/* Subtle Architectural Lighting */}
        <div className="absolute inset-0 bg-light-beam pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[650px] h-[650px] diagonal-beam pointer-events-none rotate-12 blur-2xl opacity-60" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Sub-Nav Information Bar */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-8 flex items-center justify-between text-xs tracking-wider uppercase text-[#8E9EA2] z-10">
          <div className="flex items-center gap-6 hidden sm:flex">
            <span className="text-[#E4ECEC] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              {tr('Direct-Connect Network')}
            </span>
            <span className="text-[#8E9EA2]">•</span>
            <span className="text-[#34D399] font-mono font-semibold">{tr('Zero Middleman Markup')}</span>
            <span className="text-[#8E9EA2]">•</span>
            <span>{tr('Hyderabad Pilot')}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-[#E0EBE9] font-mono text-[11px] lowercase tracking-wide">kaamsetu.in</span>
          </div>
        </div>

        {/* Hero Core Content */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 my-auto py-12 z-10">
          <div className="max-w-4xl space-y-6">
            
            {/* Monumental Headline */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-heading font-extrabold tracking-tight text-[#E0EBE9] leading-none drop-shadow-sm">
                KaamSetu
              </h1>
              <span className="text-xs sm:text-lg md:text-xl font-mono text-[#8E9EA2] tracking-widest uppercase">
                (SERVICES)
              </span>
            </div>

            <p className="text-sm sm:text-lg text-[#8E9EA2] max-w-2xl font-light leading-relaxed">
              {tr('A decentralized direct-connect marketplace uniting local electricians, beauticians, cleaners, AC technicians, plumbers, and artisans with their neighborhood. 100% direct customer booking. Zero middleman markup.')}
            </p>

            {/* Horizontal Executive Search Console */}
            <div className="pt-2 max-w-3xl">
              <form
                onSubmit={handleSearchSubmit}
                className="p-2 sm:p-2.5 rounded-2xl sm:rounded-full bg-[#13191C]/90 border border-white/[0.12] backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                {/* Locality Selector */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl sm:rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs text-[#E4ECEC] border border-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="font-semibold truncate max-w-[130px]">
                        {selectedLocality ? `📍 ${selectedLocality}` : '📍 Kukatpally, Hyd'}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-[#8E9EA2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-location-gate'))}
                    className="p-2.5 rounded-xl sm:rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#F59E0B] border border-amber-500/30 hover:border-amber-500 transition-colors cursor-pointer"
                    title="Location Permission & Detection (GPS / Hyderabad)"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search Text Input */}
                <div className="flex-1 relative flex items-center min-w-0">
                  <Search className="absolute left-3.5 w-4 h-4 text-[#8E9EA2] pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={tr('Search electricians, salon, AC repair, painters...')}
                    className="w-full bg-transparent pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none"
                  />
                  {/* Voice Mic Button */}
                  <button
                    type="button"
                    onClick={() => setShowVoiceSearch(!showVoiceSearch)}
                    title="Voice Search (Speak in Telugu / Hindi / English)"
                    className={`absolute right-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                      showVoiceSearch
                        ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                        : 'bg-white/[0.05] border-white/10 text-[#8E9EA2] hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Search Submit Button */}
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl sm:rounded-full bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <span>{tr('Find Services')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0B0F10]" />
                </button>
              </form>

              {/* Voice Search Inline Box */}
              {showVoiceSearch && (
                <div className="mt-3 p-4 rounded-2xl bg-[#182024] border border-amber-500/30 shadow-2xl animate-fade-in space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8E9EA2]">
                    <span className="font-semibold text-[#E4ECEC]">🎙️ Speak Your Request (Telugu / Hindi / English)</span>
                    <button
                      type="button"
                      onClick={() => setShowVoiceSearch(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <VoiceInput
                    initialLanguage={language}
                    onTranscript={handleVoiceTranscript}
                  />
                </div>
              )}
            </div>

            {/* Quick Action Capsules */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/customer/home"
                className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-[#E0EBE9] font-semibold text-xs tracking-wide transition-all flex items-center gap-2"
              >
                <span>{tr('Browse All Services')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8E9EA2]" />
              </Link>

              <button
                type="button"
                onClick={() => setShowInstaHelpModal(true)}
                className="px-5 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#F59E0B] font-bold text-xs tracking-wide transition-all flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#F59E0B] fill-amber-400 animate-pulse" />
                <span>{tr('⚡ 20-Min InstaHelp Emergency')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PILLARS OF TRUST & FAIR PRICING                                        */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#13191C] border border-white/[0.08] space-y-1.5 shadow-sm">
            <span className="text-xl sm:text-2xl block mb-2">💰</span>
            <h4 className="font-heading font-bold text-sm text-[#E4ECEC]">Direct & Fair Pricing</h4>
            <p className="text-xs text-[#8E9EA2] leading-relaxed">
              Direct connection with local technicians. Zero hidden broker markups.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#13191C] border border-white/[0.08] space-y-1.5 shadow-sm">
            <span className="text-xl sm:text-2xl block mb-2">💬</span>
            <h4 className="font-heading font-bold text-sm text-[#E4ECEC]">Direct WhatsApp & Call</h4>
            <p className="text-xs text-[#8E9EA2] leading-relaxed">
              Direct peer-to-peer connection with zero middleman interference.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#13191C] border border-white/[0.08] space-y-1.5 shadow-sm">
            <span className="text-xl sm:text-2xl block mb-2">⚡</span>
            <h4 className="font-heading font-bold text-sm text-[#E4ECEC]">20-Min InstaHelp</h4>
            <p className="text-xs text-[#8E9EA2] leading-relaxed">
              Emergency technician dispatch for burst pipes, blackouts & lockouts.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#13191C] border border-white/[0.08] space-y-1.5 shadow-sm">
            <span className="text-xl sm:text-2xl block mb-2">🛡️</span>
            <h4 className="font-heading font-bold text-sm text-[#E4ECEC]">Verified Local Pros</h4>
            <p className="text-xs text-[#8E9EA2] leading-relaxed">
              Background & skill verified technicians in your neighborhood.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRANSPARENT 5% COMMISSION VS 30% AGGREGATORS COMPARISON                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-[#13191C] border border-white/[0.08] shadow-2xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B] font-bold">
              Economic Empowerment
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#E0EBE9]">
              {tr('Why KaamSetu is Fairer than Aggregators')}
            </h3>
            <p className="text-xs sm:text-sm text-[#8E9EA2] leading-relaxed">
              Traditional aggregator giants trap technicians with high cuts and mask direct contacts. KaamSetu creates honest local connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-red-400 font-bold uppercase">
                  Traditional Aggregators (Urban Company, etc.)
                </span>
                <span className="text-xl font-black text-red-400">20% – 35% CUT</span>
              </div>
              <ul className="text-xs text-[#8E9EA2] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Heavy commissions deducted from worker's hard-earned fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Customer numbers are masked to prevent direct contact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Arbitrary penalties and compulsory kit purchases</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                  KaamSetu Direct Marketplace
                </span>
                <span className="text-xl font-black text-emerald-400">DIRECT PRICING</span>
              </div>
              <ul className="text-xs text-[#8E9EA2] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Pay technicians directly via UPI or Cash with zero broker markup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Direct WhatsApp and direct phone calls with zero middleman</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Flexible on-demand shifts (1h, 2h, half-day, or full-day)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <LocalityMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        selectedLocality={selectedLocality}
        onSelectLocality={(loc) => {
          setSelectedLocality(loc);
          setShowMapModal(false);
        }}
      />

      <LocationPromptModal
        isOpen={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
        onSelectLocality={(loc) => {
          setSelectedLocality(loc);
          setShowLocationPrompt(false);
        }}
      />

      <CategoryDetailModal
        category={selectedCategoryModal}
        isOpen={!!selectedCategoryModal}
        onClose={() => setSelectedCategoryModal(null)}
      />

      <InstaHelpModal
        isOpen={showInstaHelpModal}
        onClose={() => setShowInstaHelpModal(false)}
      />
    </div>
  );
}
