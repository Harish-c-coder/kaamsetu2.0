import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../utils/fullPageTranslator';
import {
  Briefcase,
  Users,
  Globe,
  Menu,
  X,
  ChevronDown,
  Home,
  User,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  PhoneCall,
  Mic,
  CalendarCheck,
  Zap,
  Compass,
  LogOut,
  Plus,
  Search,
  Power,
  Wrench,
  Scissors,
  Sparkles,
  PaintBucket,
  ShieldCheck,
  LayoutGrid,
} from 'lucide-react';

export default function Navbar({ onOpenAbout, onOpenContact, onOpenVoice }) {
  const {
    t,
    language,
    setLanguage,
    workerUser,
    logoutWorkerUser,
    customerUser,
    logoutCustomerUser,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountRef = useRef(null);
  const langRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine App Environment: Customer Site (5174) vs Partner Site (5175)
  const isPartnerSite = import.meta.env.VITE_APP_TYPE === 'partner';
  const customerSiteUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5174` : 'http://localhost:5174';
  const partnerSiteUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5175` : 'http://localhost:5175';

  // Close popups/dropdowns on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setAccountDropdownOpen(false);
        setLangDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    if (accountDropdownOpen || langDropdownOpen || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountDropdownOpen, langDropdownOpen, mobileMenuOpen]);

  // Voice Command Event Listener: Open Account Pop-up directly
  useEffect(() => {
    const handleVoiceAccount = () => {
      setAccountDropdownOpen(true);
    };
    const handleVoiceMenu = () => {
      setMobileMenuOpen(true);
    };
    window.addEventListener('comsity:voice:account', handleVoiceAccount);
    window.addEventListener('comsity:voice:menu', handleVoiceMenu);
    return () => {
      window.removeEventListener('comsity:voice:account', handleVoiceAccount);
      window.removeEventListener('comsity:voice:menu', handleVoiceMenu);
    };
  }, []);

  const isCustomerHome = location.pathname === '/' && (!location.hash || location.hash === '#top');
  const isCustomerServices = location.pathname.startsWith('/customer/home') || location.pathname.startsWith('/services') || location.hash === '#services';
  const isCustomerCategories = location.pathname.startsWith('/customer/categories') || location.pathname.startsWith('/categories');
  const isCustomerBookings = (location.pathname === '/customer/profile' && location.search.includes('bookings')) || (location.pathname === '/customer/login' && location.search.includes('redirect=bookings'));

  // Partner navigation active states
  const isPartnerOverview = location.pathname === '/' || (location.pathname === '/worker/dashboard' && (!location.search || location.search.includes('tab=overview')));
  const isPartnerShifts = location.pathname.includes('/worker/dashboard') && location.search.includes('tab=shifts');
  const isPartnerListings = location.pathname.includes('/worker/dashboard') && location.search.includes('tab=listings');
  const isPartnerEnquiries = location.pathname.includes('/worker/dashboard') && location.search.includes('tab=enquiries');

  const navigateToSection = (sectionId, fallbackPath) => {
    if (sectionId === 'categories') {
      navigate('/customer/categories');
      setMobileMenuOpen(false);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${sectionId}`);
    } else if (fallbackPath) {
      navigate(fallbackPath);
    }
    setMobileMenuOpen(false);
  };

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    }
    setMobileMenuOpen(false);
  };

  const isHome = location.pathname === '/';

  const handlePartnerLogout = () => {
    logoutWorkerUser();
    navigate('/');
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  };

  const handleCustomerLogout = () => {
    logoutCustomerUser();
    navigate('/');
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0C1012]/85 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link
            to={isPartnerSite && workerUser ? "/worker/dashboard" : "/"}
            className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
          >
            <div className="flex items-center gap-1">
              <span className={`w-3.5 h-3.5 rounded-full ${isPartnerSite ? 'bg-[#F59E0B]' : 'bg-[#E4ECEC]'} group-hover:scale-110 transition-transform`} />
              <span className={`w-3.5 h-3.5 rounded-full border-2 ${isPartnerSite ? 'border-[#F59E0B]' : 'border-[#E4ECEC]'} border-r-transparent`} />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#E4ECEC] group-hover:text-white transition-colors">
                KaamSetu
              </span>
              {isPartnerSite && (
                <span className="text-[9px] sm:text-[11px] font-mono tracking-widest uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/15 text-[#F59E0B] border border-amber-500/30">
                  PARTNER
                </span>
              )}
            </div>
          </Link>

          {/* UNIFIED DESKTOP NAVIGATION & CONTROLS: Exactly identical gap-2.5 between all icons & buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* 1. Primary Nav Capsule */}
            <div className="h-9 flex items-center gap-1 px-1 bg-white/[0.04] rounded-full border border-white/[0.08] shrink-0">
              {isPartnerSite ? (
                /* PARTNER SITE NAVIGATION */
                <>
                  {/* Partner Overview (Hidden after log in / sign up) */}
                  {!workerUser && (
                    <Link
                      to="/"
                      onClick={handleHomeClick}
                      className={`h-7.5 inline-flex items-center gap-2 px-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isPartnerOverview && location.pathname === '/'
                          ? 'bg-white/15 text-[#E4ECEC] shadow-inner border border-white/15'
                          : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Partner Overview</span>
                    </Link>
                  )}

                  {/* Work Shifts */}
                  <Link
                    to="/worker/dashboard?tab=shifts"
                    onClick={(e) => {
                      if (!workerUser) {
                        e.preventDefault();
                        setAccountDropdownOpen(true);
                      }
                    }}
                    className={`h-7.5 inline-flex items-center gap-2 px-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isPartnerShifts
                        ? 'bg-white/15 text-[#E4ECEC] shadow-inner border border-white/15'
                        : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Work Shifts</span>
                    {workerUser?.activeShift && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                    )}
                  </Link>

                  {/* My Services */}
                  <Link
                    to="/worker/dashboard?tab=listings"
                    className={`h-7.5 inline-flex items-center gap-2 px-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isPartnerListings
                        ? 'bg-white/15 text-[#E4ECEC] shadow-inner border border-white/15'
                        : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-300" />
                    <span>My Services</span>
                  </Link>

                  {/* Leads & Calls */}
                  <Link
                    to="/worker/dashboard?tab=enquiries"
                    className={`h-7.5 inline-flex items-center gap-2 px-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isPartnerEnquiries
                        ? 'bg-white/15 text-[#E4ECEC] shadow-inner border border-white/15'
                        : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                    <span>Leads & Calls</span>
                  </Link>
                </>
              ) : (
                /* CUSTOMER SITE NAVIGATION (STRICTLY CUSTOMER ONLY) */
                <>
                  {/* Home */}
                  <Link
                    to="/"
                    onClick={handleHomeClick}
                    className={`h-7.5 inline-flex items-center gap-2 px-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isCustomerHome
                        ? 'bg-white/15 text-[#E4ECEC] shadow-inner border border-white/15'
                        : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5 text-slate-300" />
                    <span>{t.nav?.home || 'Home'}</span>
                  </Link>

                  {/* Find Services */}
                  <Link
                    to="/customer/home"
                    className={`h-7.5 inline-flex items-center gap-2 px-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isCustomerServices
                        ? 'bg-white/15 text-[#E4ECEC] shadow-inner border border-white/15'
                        : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-slate-300" />
                    <span>Find Services</span>
                  </Link>

                  {/* Categories */}
                  <Link
                    to="/customer/categories"
                    className={`h-7.5 inline-flex items-center gap-2 px-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isCustomerCategories
                        ? 'bg-white/15 text-[#E4ECEC] shadow-inner border border-white/15'
                        : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-300" />
                    <span>Categories</span>
                  </Link>
                </>
              )}
            </div>

            {/* 2 & 3. Partner Voice Mic & Switch to Customer App (Partner Site Only) */}
            {isPartnerSite && (
              <>
                <button
                  type="button"
                  onClick={onOpenVoice}
                  className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-[#F59E0B] hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                  title="Partner Voice AI Assistant (Telugu / Hindi / English)"
                >
                  <Mic className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse shrink-0" />
                  <span>Mic</span>
                </button>

                <a
                  href={customerSiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-[#F59E0B] hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm shrink-0"
                  title="Switch to Customer Website"
                >
                  <Users className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                  <span>Customer App</span>
                  <ExternalLink className="w-3 h-3 text-[#F59E0B] shrink-0" />
                </a>
              </>
            )}

            {/* 4. Language Selector Dropdown: All 8 Languages */}
            <div className="relative shrink-0">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="h-9 inline-flex items-center gap-1.5 px-3 rounded-full border border-white/[0.1] text-xs font-medium text-[#E4ECEC] hover:border-white/25 bg-white/[0.04] transition-all cursor-pointer shrink-0"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>
                  {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.short || 'EN'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent cursor-pointer"
                    onClick={() => setLangDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    ref={langRef}
                    className="absolute right-0 mt-2 w-44 max-h-72 overflow-y-auto bg-[#13191C] rounded-2xl shadow-2xl border border-white/10 py-1.5 z-50 backdrop-blur-xl"
                    onClick={() => setLangDropdownOpen(false)}
                  >
                    {SUPPORTED_LANGUAGES.map((langItem) => (
                      <button
                        key={langItem.code}
                        onClick={() => setLanguage(langItem.code)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                          language === langItem.code
                            ? 'text-white bg-white/[0.1] font-bold'
                            : 'text-[#8E9EA2] hover:text-[#E4ECEC] hover:bg-white/[0.04]'
                        }`}
                      >
                        <span>{langItem.native}</span>
                        {language === langItem.code && (
                          <span className="text-[#34D399] text-xs font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 5. SEPARATE ACCOUNT CAPSULE BUTTON */}
            <div className="relative shrink-0">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="h-9 inline-flex items-center gap-2 px-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.14] text-xs font-semibold text-[#E4ECEC] transition-all cursor-pointer shadow-xs shrink-0"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 text-slate-300 flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <span>
                  {isPartnerSite
                    ? workerUser
                      ? 'Partner Account'
                      : 'Account'
                    : customerUser
                    ? `Cust: ${customerUser.name.split(' ')[0]}`
                    : 'Account'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </div>

            {/* 6. Desktop Start Menu Launcher (2-box icon) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] active:scale-95 border border-white/10 text-[#E4ECEC] hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center group shrink-0"
              title="Start Menu"
              aria-label="Open Start Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-sky-400 group-hover:bg-amber-400 transition-colors" />
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-500 group-hover:bg-amber-400 transition-colors" />
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-600 group-hover:bg-amber-400 transition-colors" />
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-sky-300 group-hover:bg-amber-400 transition-colors" />
                </div>
              )}
            </button>
          </div>

          {/* Mobile menu trigger: Only menu launcher on mobile top header */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] active:scale-95 border border-white/10 text-[#E4ECEC] hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center group"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-sky-400 group-hover:bg-amber-400 transition-colors" />
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-500 group-hover:bg-amber-400 transition-colors" />
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-600 group-hover:bg-amber-400 transition-colors" />
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-sky-300 group-hover:bg-amber-400 transition-colors" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Pop-out Account Card (Visible directly on both Desktop and Mobile when "profile" or Account is triggered) */}
      {accountDropdownOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-end p-4 pt-16 pointer-events-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer animate-in fade-in"
            onClick={() => setAccountDropdownOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={accountRef}
            className="relative w-80 max-w-[92vw] bg-[#13191C] rounded-2xl shadow-2xl border border-white/10 p-3.5 z-50 space-y-3 backdrop-blur-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E4ECEC]">
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span>{isPartnerSite ? 'Worker Partner Access' : 'Customer Account Access'}</span>
              </div>
              <button
                onClick={() => setAccountDropdownOpen(false)}
                className="p-1 rounded-lg text-[#8E9EA2] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Close pop-up"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isPartnerSite ? (
              /* ONLY PARTNER ACCOUNT DETAILS ON PARTNER SITE */
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#E4ECEC]">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Partner Profile</span>
                  </div>
                  {workerUser && (
                    <span className="text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded-full font-mono">
                      On Duty
                    </span>
                  )}
                </div>

                {workerUser ? (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-semibold text-[#E4ECEC] truncate">
                      {workerUser.name} ({workerUser.category})
                    </p>
                    {workerUser.activeShift && (
                      <div className="text-[11px] text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F59E0B]" />
                        <span>Shift: {workerUser.activeShift.name || 'Active'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to="/worker/dashboard"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex-1 py-1.5 bg-[#F59E0B] hover:bg-[#fbbf24] text-[#0C1012] text-center text-xs font-bold rounded-lg transition-colors"
                      >
                        Partner Dashboard
                      </Link>
                      <button
                        onClick={handlePartnerLogout}
                        className="px-2.5 py-1.5 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-amber-400 font-medium">
                      Login to your account first
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Link
                        to="/login"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="py-1.5 bg-white/[0.05] border border-white/[0.1] text-[#E4ECEC] text-center text-xs font-semibold rounded-lg hover:bg-white/[0.1] transition-colors"
                      >
                        Partner Login
                      </Link>
                      <Link
                        to="/worker/register"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="py-1.5 bg-[#F59E0B] text-[#0C1012] text-center text-xs font-bold rounded-lg hover:bg-[#fbbf24] transition-colors"
                      >
                        Join As Partner
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ONLY CUSTOMER ACCOUNT DETAILS ON CUSTOMER SITE */
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#E4ECEC]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-300" />
                    <span>Customer Profile</span>
                  </div>
                  {customerUser && (
                    <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      Active
                    </span>
                  )}
                </div>

                {customerUser ? (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-semibold text-[#E4ECEC] truncate">
                      {customerUser.name} ({customerUser.locality || 'Hyderabad'})
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to="/customer/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex-1 py-1.5 bg-slate-200 hover:bg-white text-[#0C1012] text-center text-xs font-bold rounded-lg transition-colors"
                      >
                        My Bookings & Saved
                      </Link>
                      <button
                        onClick={handleCustomerLogout}
                        className="px-2.5 py-1.5 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Link
                      to="/customer/login"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="py-1.5 bg-white/[0.05] border border-white/[0.1] text-[#E4ECEC] text-center text-xs font-semibold rounded-lg hover:bg-white/[0.1] transition-colors"
                    >
                      Customer Sign In
                    </Link>
                    <Link
                      to="/customer/register"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="py-1.5 bg-slate-200 hover:bg-white text-[#0C1012] text-center text-xs font-bold rounded-lg transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Quick Shortcuts */}
            <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8E9EA2] px-1">
              <button
                onClick={() => {
                  onOpenAbout();
                  setAccountDropdownOpen(false);
                }}
                className="hover:text-[#E4ECEC] cursor-pointer"
              >
                About Platform
              </button>
              <button
                onClick={() => {
                  onOpenContact();
                  setAccountDropdownOpen(false);
                }}
                className="hover:text-[#E4ECEC] cursor-pointer"
              >
                Help & Support
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAccountDropdownOpen(false)}
              className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#8E9EA2] hover:text-white text-xs font-semibold rounded-xl text-center transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Windows 11 Style Start Menu / Slide-Out Drawer (Slides Left-to-Right on both Laptop and Mobile) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 cursor-pointer animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Left-to-Right Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-[101] w-[88vw] sm:w-[420px] max-w-[430px] h-screen h-[100dvh] bg-[#0D1215] border-r border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden animate-slide-in-left"
          >
            {/* Top: Windows Start Menu Header & Search Bar */}
            <div className="p-4 pb-3 border-b border-white/[0.08] space-y-3 bg-white/[0.02]">
              {/* Header Title Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Windows 4-color tile icon */}
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-sky-400" />
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-500" />
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-600" />
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-sky-300" />
                  </div>
                  <div>
                    <span className="font-heading font-extrabold text-sm text-[#E4ECEC]">KaamSetu</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-[#8E9EA2] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Menu"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Windows 11 Search Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!menuSearch.trim()) return;
                  setMobileMenuOpen(false);
                  if (isPartnerSite) {
                    navigate(`/worker/dashboard?search=${encodeURIComponent(menuSearch.trim())}`);
                  } else {
                    navigate(`/customer/home?search=${encodeURIComponent(menuSearch.trim())}`);
                  }
                }}
                className="relative"
              >
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder={isPartnerSite ? "Search shifts, services, leads..." : "Search for services, trades, bookings..."}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08] transition-all"
                />
                {menuSearch && (
                  <button
                    type="button"
                    onClick={() => setMenuSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Middle: Scrollable Windows Start Menu Items & Categories */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* SECTION 1: PINNED APPS (Windows 11 Start Menu Style) */}
              <div>
                <div className="flex items-center justify-between pb-2 text-[11px] font-bold text-[#8E9EA2] tracking-wider uppercase">
                  <span>Pinned</span>
                  <span className="text-[10px] text-slate-400 lowercase">quick access</span>
                </div>

                {isPartnerSite ? (
                  /* PARTNER PINNED APPS */
                  <div className="grid grid-cols-3 gap-2">
                    {!workerUser && (
                      <Link
                        to="/"
                        onClick={handleHomeClick}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/30 transition-all text-center group ${
                          isPartnerOverview && location.pathname === '/' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'text-[#8E9EA2]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <Briefcase className="w-4 h-4 text-[#F59E0B]" />
                        </div>
                        <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">Overview</span>
                      </Link>
                    )}

                    <Link
                      to="/worker/dashboard?tab=shifts"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (!workerUser) {
                          e.preventDefault();
                          setAccountDropdownOpen(true);
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-emerald-500/30 transition-all text-center group ${
                        isPartnerShifts ? 'bg-emerald-500/10 border-emerald-500/40' : 'text-[#8E9EA2]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Clock className="w-4 h-4 text-[#34D399]" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">Work Shifts</span>
                    </Link>

                    <Link
                      to="/worker/dashboard?tab=listings"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-slate-400/30 transition-all text-center group ${
                        isPartnerListings ? 'bg-white/10 border-white/20' : 'text-[#8E9EA2]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-500/15 border border-slate-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Layers className="w-4 h-4 text-slate-300" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">My Services</span>
                    </Link>

                    <Link
                      to="/worker/dashboard?tab=enquiries"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-blue-500/30 transition-all text-center group ${
                        isPartnerEnquiries ? 'bg-blue-500/10 border-blue-500/40' : 'text-[#8E9EA2]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <PhoneCall className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">Leads & Calls</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenVoice) onOpenVoice();
                      }}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-center group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Mic className="w-4 h-4 text-[#F59E0B] animate-pulse" />
                      </div>
                      <span className="text-[11px] font-bold text-[#F59E0B]">Partner Mic</span>
                    </button>

                    <a
                      href={customerSiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/30 transition-all text-center group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <ExternalLink className="w-4 h-4 text-[#F59E0B]" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#F59E0B]">Customer App</span>
                    </a>
                  </div>
                ) : (
                  /* CUSTOMER PINNED APPS */
                  <div className="grid grid-cols-3 gap-2">
                    {/* 1. Home */}
                    <Link
                      to="/"
                      onClick={handleHomeClick}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/30 transition-all text-center group ${
                        isCustomerHome ? 'bg-amber-500/10 border-amber-500/40' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Home className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">Home</span>
                    </Link>

                    {/* 2. Find Services */}
                    <Link
                      to="/customer/home"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-blue-500/30 transition-all text-center group ${
                        isCustomerServices && !location.hash.includes('categories') ? 'bg-blue-500/10 border-blue-500/40' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Compass className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">Find Services</span>
                    </Link>

                    {/* 3. My Bookings */}
                    <Link
                      to={customerUser ? "/customer/profile?tab=bookings" : "/customer/login?redirect=bookings"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-emerald-500/30 transition-all text-center group ${
                        isCustomerBookings ? 'bg-emerald-500/10 border-emerald-500/40' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <CalendarCheck className="w-4 h-4 text-[#34D399]" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">My Bookings</span>
                    </Link>

                    {/* 4. InstaHelp 20-Min Emergency */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/customer/home');
                      }}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-center group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                      </div>
                      <span className="text-[11px] font-bold text-amber-400">InstaHelp 20m</span>
                    </button>

                    {/* 5. All Categories */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/customer/categories');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-500/30 transition-all text-center group cursor-pointer ${
                        isCustomerCategories ? 'bg-purple-500/10 border-purple-500/40' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Layers className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">Categories</span>
                    </button>

                    {/* 6. Customer Profile */}
                    <Link
                      to={customerUser ? "/customer/profile" : "/customer/login"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-teal-500/30 transition-all text-center group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <User className="w-4 h-4 text-teal-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#E4ECEC] group-hover:text-white">
                        {customerUser ? "Profile" : "Sign In"}
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* SECTION 2: ALL SERVICES GRID (Windows 11 All Apps Grid) */}
              {!isPartnerSite && (
                <div>
                  <div className="flex items-center justify-between pb-2 text-[11px] font-bold text-[#8E9EA2] tracking-wider uppercase">
                    <span>Popular Services</span>
                    <span className="text-[10px] text-slate-400">0% Commission</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Electrician', category: 'Electrician', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
                      { name: 'Plumber', category: 'Plumber', icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
                      { name: 'Salon & Beauty', category: 'Salon & Beautician', icon: Scissors, color: 'text-pink-400', bg: 'bg-pink-500/15 border-pink-500/30' },
                      { name: 'AC & Appliance', category: 'AC Repair & Appliance', icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
                      { name: 'Carpentry', category: 'Carpenter & Woodwork', icon: Briefcase, color: 'text-yellow-500', bg: 'bg-yellow-500/15 border-yellow-500/30' },
                      { name: 'Deep Cleaning', category: 'Cleaning & Maid', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
                      { name: 'Painting', category: 'Painter', icon: PaintBucket, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' },
                      { name: 'All Services', category: '', icon: LayoutGrid, color: 'text-slate-300', bg: 'bg-slate-500/15 border-slate-500/30' },
                    ]
                      .filter(item => !menuSearch.trim() || item.name.toLowerCase().includes(menuSearch.toLowerCase()) || item.category.toLowerCase().includes(menuSearch.toLowerCase()))
                      .map((item) => {
                        const IconComp = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.category ? `/customer/home?category=${encodeURIComponent(item.category)}` : '/customer/home'}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/20 transition-all group"
                          >
                            <div className={`w-7 h-7 rounded-lg ${item.bg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                              <IconComp className={`w-3.5 h-3.5 ${item.color}`} />
                            </div>
                            <span className="text-xs font-semibold text-[#E4ECEC] group-hover:text-white truncate">
                              {item.name}
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* SECTION 3: SYSTEM INFO & HELP SHORTCUTS */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8E9EA2] px-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAbout();
                    setMobileMenuOpen(false);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Platform
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenContact();
                    setMobileMenuOpen(false);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact & Help
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLangDropdownOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lang: {language.toUpperCase()}
                </button>
              </div>
            </div>

            {/* Bottom Bar: Exact Windows 11 Start Menu Bottom Profile & Power Row */}
            <div className="p-3.5 bg-[#080B0D] border-t border-white/[0.08] flex items-center justify-between">
              {isPartnerSite ? (
                workerUser ? (
                  <div className="flex items-center justify-between w-full">
                    <Link
                      to="/worker/dashboard?tab=profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 min-w-0 p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors flex-1"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-[#0C1012] font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                        {workerUser.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-[#E4ECEC] truncate">{workerUser.name}</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{workerUser.category || 'Partner'} • Online</span>
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={handlePartnerLogout}
                      className="p-2.5 rounded-xl hover:bg-red-500/15 text-[#8E9EA2] hover:text-red-400 transition-colors cursor-pointer group"
                      title="Log Out (Power)"
                      aria-label="Log Out"
                    >
                      <Power className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 p-1">
                      <div className="w-8 h-8 rounded-full bg-white/10 text-slate-400 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">Partner Guest</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/worker/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#F59E0B] hover:bg-[#fbbf24] text-[#0C1012] transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )
              ) : (
                customerUser ? (
                  <div className="flex items-center justify-between w-full">
                    <Link
                      to="/customer/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 min-w-0 p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors flex-1"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-[#0C1012] font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                        {customerUser.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-[#E4ECEC] truncate">{customerUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {customerUser.locality || 'Customer'} • {customerUser.phone || 'Verified'}
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={handleCustomerLogout}
                      className="p-2.5 rounded-xl hover:bg-red-500/15 text-[#8E9EA2] hover:text-red-400 transition-colors cursor-pointer group"
                      title="Log Out (Power)"
                      aria-label="Log Out"
                    >
                      <Power className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 p-1">
                      <div className="w-8 h-8 rounded-full bg-white/10 text-slate-400 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">Guest Visitor</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to="/customer/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/customer/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 hover:bg-white text-[#0B0F10] transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
