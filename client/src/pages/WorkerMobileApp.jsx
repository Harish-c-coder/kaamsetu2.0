import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  User,
  Package,
  MessageSquare,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Send,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Wifi,
  Battery,
  Signal,
  Mic,
  Smartphone,
  Maximize2,
  Minimize2,
  ChevronRight,
  ArrowLeft,
  Compass,
  Briefcase,
  KeyRound,
  Check,
  Globe,
  ChevronDown,
} from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import ShiftSelectorModal from '../components/ShiftSelectorModal';
import PhoneCountryInput from '../components/PhoneCountryInput';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { SUPPORTED_LANGUAGES } from '../utils/fullPageTranslator';

export default function WorkerMobileApp() {
  const {
    t,
    language,
    setLanguage,
    workerUser,
    loginWorkerUser,
    logoutWorkerUser,
    updateWorkerAvailability,
    updateWorkerShift,
  } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'catalog', 'enquiries', 'profile'
  const [frameMode, setFrameMode] = useState(true); // true = smartphone bezel frame, false = full viewport
  const [dashboardData, setDashboardData] = useState(null);
  const [listings, setListings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const customerSiteUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5174/app` : 'http://localhost:5174/app';

  // In-app partner login state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginCountryCode, setLoginCountryCode] = useState('+91');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // New listing modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    category: workerUser?.category || 'Electrician',
    description: '',
    price: '',
    listingType: 'service',
  });

  // Edit profile form
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    locality: '',
    startingPrice: '',
    description: '',
  });
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (workerUser?._id) {
      loadData();
    }
  }, [workerUser]);

  const loadData = async () => {
    if (!workerUser?._id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workers/${workerUser._id}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
        setEditForm({
          name: data.data.worker.name,
          phone: data.data.worker.phone,
          locality: data.data.worker.locality,
          startingPrice: data.data.worker.startingPrice || '',
          description: data.data.worker.description || '',
        });
      }

      const lRes = await fetch(`/api/listings/worker/${workerUser._id}`);
      const lData = await lRes.json();
      if (lData.success) setListings(lData.data);

      const eRes = await fetch(`/api/enquiries/worker/${workerUser._id}`);
      const eData = await eRes.json();
      if (eData.success) setEnquiries(eData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    if (loginPhone.length !== 10) {
      setLoginError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoginLoading(true);
    try {
      const fullPhone = `${loginCountryCode}${loginPhone}`;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        loginWorkerUser(data.data);
      } else {
        setLoginError(data.message || 'Login failed. Check phone and password.');
      }
    } catch (err) {
      setLoginError('Could not reach server. Check connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleDemoWorkerLogin = async (demoName, demoPhone) => {
    setLoginPhone(demoPhone);
    setLoginPassword('Demo@12345');
    setLoginLoading(true);
    setLoginError('');
    try {
      const fullPhone = `+91${demoPhone}`;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, password: 'Demo@12345' }),
      });
      const data = await res.json();
      if (data.success) {
        loginWorkerUser(data.data);
      } else {
        // Fallback: search for this worker
        const wRes = await fetch(`/api/workers?search=${encodeURIComponent(demoName)}`);
        const wData = await wRes.json();
        if (wData.success && wData.data?.length > 0) {
          loginWorkerUser(wData.data[0]);
        } else {
          setLoginError(`Could not auto-login as ${demoName}.`);
        }
      }
    } catch (err) {
      setLoginError('Auto-login error. Try manual login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleToggle = async () => {
    const nextStatus = !workerUser?.isAvailable;
    await updateWorkerAvailability(nextStatus);
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        worker: { ...dashboardData.worker, isAvailable: nextStatus },
      });
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!newListing.title) return;
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newListing,
          workerId: workerUser._id,
          locality: workerUser.locality,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setListings([data.data, ...listings]);
        setShowAddModal(false);
        setNewListing({
          title: '',
          category: workerUser.category,
          description: '',
          price: '',
          listingType: 'service',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!confirm('Remove this service listing?')) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setListings(listings.filter((l) => l._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveMsg('');
    try {
      const res = await fetch(`/api/workers/${workerUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg('Profile updated!');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      setSaveMsg('Failed to update.');
    }
  };

  const worker = dashboardData?.worker || workerUser;
  const isAvailable = worker?.isAvailable ?? true;
  const unreadCount = enquiries.filter((e) => !e.isRead).length;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    worker?.name || 'Worker'
  )}&background=182024&color=E4ECEC&size=200&bold=true`;

  return (
    <div className="py-6 px-3 flex flex-col items-center min-h-[90vh] bg-[#0C1012] text-[#E4ECEC] selection:bg-amber-500/20 selection:text-white">
      
      {/* Top Controls Toolbar */}
      <div className="w-full max-w-sm flex items-center justify-between gap-2 mb-4 bg-[#13191C] p-2.5 rounded-2xl border border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#E4ECEC]">
          <Smartphone className="w-4 h-4 text-[#F59E0B]" />
          <span>Worker Partner Phone App</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFrameMode(!frameMode)}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#E4ECEC] border border-white/10 transition-colors cursor-pointer"
            title="Toggle Smartphone Bezel"
          >
            {frameMode ? 'Hide Frame' : 'Show Frame'}
          </button>
          
          <a
            href={customerSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F59E0B] border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
            title="Switch to Customer Discovery App"
          >
            <Compass className="w-3 h-3 text-[#F59E0B]" />
            <span>Customer App ↗</span>
          </a>
        </div>
      </div>

      {/* Smartphone Container */}
      <div
        className={`w-full max-w-[390px] bg-black rounded-[44px] p-3 shadow-2xl relative transition-all duration-300 ${
          frameMode
            ? 'border-[10px] border-[#182024] ring-1 ring-white/10'
            : 'border-0 p-0 rounded-2xl max-w-md'
        }`}
      >
        {/* Smartphone Screen Inner */}
        <div className="bg-[#0C1012] w-full rounded-[36px] overflow-hidden flex flex-col h-[750px] relative text-[#E4ECEC] shadow-2xl border border-white/[0.04]">
          
          {/* Top Mobile Status Bar */}
          <div className="bg-[#0B0F10] text-[#E4ECEC] px-5 pt-3 pb-2 flex items-center justify-between text-[11px] font-medium shrink-0 border-b border-white/[0.04]">
            <span className="font-mono text-[10px]">12:35</span>
            {/* Front Camera Punch Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-tight text-[#34D399]">Jio 5G</span>
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>

          {!workerUser ? (
            /* Unauthenticated State: In-App Partner Login */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-4 pt-1">
                {/* Top Bar with Language Selector on Right */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8E9EA2] font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>KaamSetu Partner</span>
                  </div>

                  {/* Language Selector Dropdown on Top Right */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLangMenuOpen(!langMenuOpen)}
                      className="h-7.5 px-2.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/15 text-[11px] font-semibold text-[#E4ECEC] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Select Language"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.short || 'EN'}</span>
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>

                    {langMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
                          onClick={() => setLangMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-1 w-36 max-h-56 overflow-y-auto bg-[#13191C] border border-white/15 rounded-xl shadow-2xl p-1 z-50 animate-in zoom-in-95">
                          {SUPPORTED_LANGUAGES.map((langItem) => (
                            <button
                              key={langItem.code}
                              type="button"
                              onClick={() => {
                                setLanguage(langItem.code);
                                setLangMenuOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 text-left rounded-lg text-[11px] font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                                language === langItem.code
                                  ? 'bg-amber-500/20 text-[#F59E0B]'
                                  : 'text-[#8E9EA2] hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <span>{langItem.native}</span>
                              {language === langItem.code && <span className="text-[#F59E0B]">✓</span>}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-[#F59E0B] border border-white/[0.08] flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-[#E4ECEC]">
                    Worker Partner Portal
                  </h3>
                  <p className="text-[11px] text-[#8E9EA2]">
                    Login to manage your shift, customer calls, and artisan services.
                  </p>
                </div>

                {loginError && (
                  <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handlePartnerLogin} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E9EA2] uppercase mb-1">
                      Mobile Number (10 Digits) *
                    </label>
                    <PhoneCountryInput
                      countryCode={loginCountryCode}
                      onCountryChange={setLoginCountryCode}
                      phone={loginPhone}
                      onPhoneChange={setLoginPhone}
                      required={true}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-[#8E9EA2] uppercase">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[10px] font-bold text-[#F59E0B] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        className="w-full px-3 py-2 pr-9 bg-[#0F172A] border border-[#334155] rounded-xl text-xs font-mono text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 text-[#8E9EA2] hover:text-[#E4ECEC] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-2.5 bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{loginLoading ? 'Logging In...' : 'Launch Partner App →'}</span>
                  </button>
                </form>

                {/* 1-Click Demo Profiles */}
                <div className="pt-2 border-t border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-[#8E9EA2] uppercase block text-center">
                    Quick Demo Partner Sign-in
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoWorkerLogin('Ramesh Kumar', '9876543210')}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-left cursor-pointer transition-colors"
                    >
                      <span className="font-bold text-[11px] text-[#E4ECEC] block truncate">Ramesh Kumar</span>
                      <span className="text-[9px] text-[#F59E0B] block">Electrician</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoWorkerLogin('Siva', '919381721515')}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-left cursor-pointer transition-colors"
                    >
                      <span className="font-bold text-[11px] text-[#E4ECEC] block truncate">Siva Krishna</span>
                      <span className="text-[9px] text-[#F59E0B] block">Painter</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] text-center space-y-1.5 pb-2">
                <Link
                  to="/worker/register"
                  className="text-xs font-bold text-[#E4ECEC] hover:text-[#F59E0B] transition-colors block"
                >
                  New to KaamSetu? Register as Partner →
                </Link>
                <Link
                  to="/customer/app"
                  className="text-[11px] text-[#8E9EA2] hover:underline block"
                >
                  Switch to Customer Marketplace
                </Link>
              </div>
            </div>
          ) : (
            /* Authenticated Worker Portal */
            <>
              {/* App Header */}
              <div className="bg-[#13191C] px-3.5 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <img
                    src={worker?.profileImage || defaultAvatar}
                    alt="Worker"
                    className="w-9 h-9 rounded-xl object-cover border border-[#F59E0B]/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xs text-[#E4ECEC] truncate">
                      {worker?.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-[#F59E0B] block truncate">
                      {worker?.category}
                    </span>
                  </div>
                </div>

                {/* Right Top Header Actions: Language Icon & Availability Switch */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Language Selector Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLangMenuOpen(!langMenuOpen)}
                      className="h-7.5 px-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-[#E4ECEC] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      title="Select Language"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.short || 'EN'}</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    </button>

                    {langMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
                          onClick={() => setLangMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-1 w-36 max-h-56 overflow-y-auto bg-[#13191C] border border-white/15 rounded-xl shadow-2xl p-1 z-50 animate-in zoom-in-95">
                          {SUPPORTED_LANGUAGES.map((langItem) => (
                            <button
                              key={langItem.code}
                              type="button"
                              onClick={() => {
                                setLanguage(langItem.code);
                                setLangMenuOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 text-left rounded-lg text-[11px] font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                                language === langItem.code
                                  ? 'bg-amber-500/20 text-[#F59E0B]'
                                  : 'text-[#8E9EA2] hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <span>{langItem.native}</span>
                              {language === langItem.code && <span className="text-[#F59E0B]">✓</span>}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Shift Availability Switch Button */}
                  <button
                    onClick={handleToggle}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 border ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-[#34D399] border-emerald-500/30 animate-pulse'
                        : 'bg-white/[0.06] text-[#8E9EA2] border-white/10'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#34D399]' : 'bg-[#64748B]'}`} />
                    <span>{isAvailable ? 'AVAILABLE' : 'OFF DUTY'}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Mobile Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
                
                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                  <>
                    {/* Status Hero Card */}
                    <div className="rounded-2xl p-4 bg-[#182024] border border-white/[0.08] shadow-sm relative overflow-hidden space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-[#F59E0B]">
                            Duty Status
                          </span>
                          <h4 className="text-base font-extrabold text-[#E4ECEC] mt-0.5 flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-[#34D399]' : 'bg-slate-500'}`} />
                            {isAvailable ? 'Open for Customer Calls' : 'Shift Inactive (Offline)'}
                          </h4>
                          <p className="text-xs text-[#8E9EA2] mt-1 leading-relaxed">
                            {isAvailable
                              ? 'Customers in your area can call or WhatsApp you directly.'
                              : 'You will not appear in immediate customer searches.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="text-[#8E9EA2] text-[11px]">Locality: <strong className="text-[#E4ECEC]">{worker?.locality || 'Hyderabad'}</strong></span>
                        <button
                          onClick={handleToggle}
                          className="px-3 py-1 bg-white hover:bg-slate-200 text-[#0B0F10] rounded-xl font-bold text-[11px] shadow-sm cursor-pointer active:scale-95 transition-all"
                        >
                          {isAvailable ? 'Go Offline' : 'Go Online'}
                        </button>
                      </div>
                    </div>

                    {/* Active Shift Selector Card on Mobile */}
                    <div className="bg-[#13191C] p-3 rounded-2xl border border-white/[0.08] shadow-sm flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-[#F59E0B] flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-[#F59E0B]" />
                        </div>
                        <div className="text-xs">
                          <span className="text-[10px] text-[#8E9EA2] font-bold block">Assigned Shift:</span>
                          <span className="font-bold text-[#E4ECEC] text-[11px] block truncate max-w-[140px]">
                            {worker?.activeShift?.name || 'Full Day (9 AM – 8 PM)'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowShiftModal(true)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-[#E4ECEC] border border-white/10 cursor-pointer transition-colors"
                      >
                        Change Shift
                      </button>
                    </div>

                    {/* Quick Metric Cards */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#13191C] p-2.5 rounded-2xl border border-white/[0.08] text-center shadow-sm">
                        <span className="text-[10px] text-[#8E9EA2] font-semibold block">Views</span>
                        <span className="text-base font-extrabold text-[#E4ECEC]">
                          {dashboardData?.stats?.profileViews ?? 0}
                        </span>
                      </div>
                      <div className="bg-[#13191C] p-2.5 rounded-2xl border border-white/[0.08] text-center shadow-sm">
                        <span className="text-[10px] text-[#8E9EA2] font-semibold block">Calls</span>
                        <span className="text-base font-extrabold text-[#34D399]">
                          {dashboardData?.stats?.enquiriesCount ?? enquiries.length}
                        </span>
                      </div>
                      <div className="bg-[#13191C] p-2.5 rounded-2xl border border-white/[0.08] text-center shadow-sm">
                        <span className="text-[10px] text-[#8E9EA2] font-semibold block">Services</span>
                        <span className="text-base font-extrabold text-[#F59E0B]">
                          {listings.length}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action: Voice Notes */}
                    <div className="bg-[#13191C] rounded-2xl p-3.5 border border-white/[0.08] shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#E4ECEC] flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-[#F59E0B]" />
                          Voice Bio Description
                        </span>
                        <span className="text-[10px] text-[#8E9EA2]">Telugu / Hindi / Eng</span>
                      </div>
                      <VoiceInput
                        initialLanguage="en"
                        onTranscript={(txt) => {
                          setEditForm((prev) => ({
                            ...prev,
                            description: prev.description ? `${prev.description} ${txt}` : txt,
                          }));
                        }}
                      />
                      <p className="text-[10px] text-[#8E9EA2] leading-tight">
                        Speak in Telugu, Hindi or English to update your bio and service tags.
                      </p>
                    </div>

                    {/* Recent Customer Contacts */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs px-1">
                        <span className="font-extrabold text-[#E4ECEC]">Recent Customer Calls</span>
                        <span className="text-[10px] text-[#8E9EA2]">{enquiries.length} total</span>
                      </div>

                      {enquiries.length === 0 ? (
                        <div className="bg-[#13191C] rounded-2xl p-6 text-center text-xs text-[#8E9EA2] border border-white/[0.08]">
                          No customer enquiries yet. Keep your status set to Available!
                        </div>
                      ) : (
                        enquiries.slice(0, 3).map((enq) => (
                          <div
                            key={enq._id}
                            className="p-3 rounded-2xl bg-[#182024] border border-white/[0.08] text-xs space-y-1.5"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#E4ECEC]">
                                {enq.customerName || 'Customer'}
                              </span>
                              <span className="text-[10px] text-[#8E9EA2]">
                                {new Date(enq.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8E9EA2] line-clamp-2">
                              "{enq.message}"
                            </p>
                            {enq.customerPhone && (
                              <div className="pt-1 flex gap-2">
                                <a
                                  href={`tel:${enq.customerPhone}`}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-200 text-[#0B0F10] rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                                >
                                  <Phone className="w-2.5 h-2.5" /> Call Back
                                </a>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {/* TAB: CATALOG / SERVICES */}
                {activeTab === 'catalog' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="font-extrabold text-xs text-[#E4ECEC]">
                        My Services & Products ({listings.length})
                      </span>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-2.5 py-1 bg-[#E2E8F0] hover:bg-white text-[#0B0F10] rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    {listings.length === 0 ? (
                      <div className="bg-[#13191C] rounded-2xl p-6 text-center text-xs text-[#8E9EA2] border border-white/[0.08] space-y-2">
                        <Package className="w-8 h-8 text-[#8E9EA2]/50 mx-auto" />
                        <p>No listings added yet.</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-3.5 py-1.5 bg-[#E2E8F0] hover:bg-white text-[#0B0F10] rounded-xl text-xs font-bold"
                        >
                          Add First Service
                        </button>
                      </div>
                    ) : (
                      listings.map((l) => (
                        <div
                          key={l._id}
                          className="bg-[#13191C] p-3 rounded-2xl border border-white/[0.08] flex items-center justify-between gap-2 shadow-sm"
                        >
                          <div>
                            <h5 className="font-bold text-xs text-[#E4ECEC]">{l.title}</h5>
                            <div className="text-[10px] text-[#8E9EA2] flex items-center gap-2 mt-0.5">
                              <span>{l.category}</span>
                              {l.price && <span className="font-bold text-[#F59E0B]">₹{l.price}</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteListing(l._id)}
                            className="p-1.5 text-[#8E9EA2] hover:text-red-400 cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB: ENQUIRIES */}
                {activeTab === 'enquiries' && (
                  <div className="space-y-3">
                    <span className="font-extrabold text-xs text-[#E4ECEC] block px-1">
                      Customer Enquiries ({enquiries.length})
                    </span>
                    {enquiries.length === 0 ? (
                      <div className="bg-[#13191C] rounded-2xl p-6 text-center text-xs text-[#8E9EA2] border border-white/[0.08]">
                        No enquiries recorded yet.
                      </div>
                    ) : (
                      enquiries.map((enq) => (
                        <div
                          key={enq._id}
                          className="bg-[#13191C] p-3 rounded-2xl border border-white/[0.08] space-y-2 text-xs shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <strong className="text-[#E4ECEC]">{enq.customerName || 'Customer'}</strong>
                            <span className="text-[10px] text-[#8E9EA2]">
                              {new Date(enq.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8E9EA2]">
                            {enq.message}
                          </p>
                          {enq.customerPhone && (
                            <div className="flex gap-2 pt-1">
                              <a
                                href={`tel:${enq.customerPhone}`}
                                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-[#0B0F10] rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <Phone className="w-3 h-3" /> Call {enq.customerPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB: PROFILE */}
                {activeTab === 'profile' && (
                  <div className="bg-[#13191C] p-3.5 rounded-2xl border border-white/[0.08] space-y-3 text-xs shadow-sm">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/[0.08]">
                      <img
                        src={worker?.profileImage || defaultAvatar}
                        alt="Worker"
                        className="w-12 h-12 rounded-xl object-cover border border-[#F59E0B]/40"
                      />
                      <div>
                        <h4 className="font-bold text-[#E4ECEC]">{worker?.name}</h4>
                        <span className="text-[11px] text-[#F59E0B] font-semibold">{worker?.category}</span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-[#8E9EA2] uppercase block mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#E4ECEC] focus:outline-none focus:border-amber-500/60 shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#8E9EA2] uppercase block mb-1">
                          Starting Price (₹)
                        </label>
                        <input
                          type="number"
                          value={editForm.startingPrice}
                          onChange={(e) =>
                            setEditForm({ ...editForm, startingPrice: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#E4ECEC] focus:outline-none focus:border-amber-500/60 shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#8E9EA2] uppercase block mb-1">
                          Locality
                        </label>
                        <input
                          type="text"
                          value={editForm.locality}
                          onChange={(e) => setEditForm({ ...editForm, locality: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#E4ECEC] focus:outline-none focus:border-amber-500/60 shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#8E9EA2] uppercase block mb-1">
                          Short Bio / Description
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#E4ECEC] focus:outline-none focus:border-amber-500/60 shadow-inner"
                        />
                      </div>

                      {saveMsg && (
                        <div className="text-[11px] font-bold text-[#34D399] text-center">
                          {saveMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </form>

                    <div className="pt-2 border-t border-white/[0.08]">
                      <button
                        onClick={() => {
                          logoutWorkerUser();
                        }}
                        className="w-full py-1.5 text-center text-red-400 hover:text-red-300 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Logout from Device
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Native Mobile Bottom Navigation Bar */}
              <div className="bg-[#13191C] border-t border-white/[0.08] px-3 py-2 flex items-center justify-around shrink-0 shadow-lg">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                    activeTab === 'overview' ? 'text-[#F59E0B]' : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Duty</span>
                </button>

                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                    activeTab === 'catalog' ? 'text-[#F59E0B]' : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Catalog</span>
                </button>

                <button
                  onClick={() => setActiveTab('enquiries')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative cursor-pointer transition-colors ${
                    activeTab === 'enquiries' ? 'text-[#F59E0B]' : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquiries</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                    activeTab === 'profile' ? 'text-[#F59E0B]' : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="bg-[#13191C] pb-1.5 pt-0.5 flex justify-center shrink-0">
                <div className="w-28 h-1 rounded-full bg-[#334155]" />
              </div>
            </>
          )}

        </div>
      </div>

      {/* Modal: Add Service on Mobile */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#182024] rounded-3xl max-w-xs w-full p-5 space-y-3 cursor-default border border-white/10 shadow-2xl text-[#E4ECEC]"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-heading font-extrabold text-sm text-[#E4ECEC]">Add Service / Item</h4>
            <form onSubmit={handleCreateListing} className="space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Title (e.g. Fan Repair)"
                value={newListing.title}
                onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                className="w-full px-3 py-2 border border-[#334155] rounded-xl bg-[#0F172A] text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                required
              />
              <input
                type="number"
                placeholder="Price ₹"
                value={newListing.price}
                onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                className="w-full px-3 py-2 border border-[#334155] rounded-xl bg-[#0F172A] text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-[#8E9EA2] hover:text-[#E4ECEC] bg-white/[0.04] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold rounded-xl text-xs shadow-sm cursor-pointer transition-colors"
                >
                  Add Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Shift Selector for Mobile */}
      <ShiftSelectorModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        activeShift={worker?.activeShift}
        onSelectShift={async (shiftData) => {
          await updateWorkerShift(shiftData);
          if (dashboardData) {
            setDashboardData({
              ...dashboardData,
              worker: {
                ...dashboardData.worker,
                activeShift: shiftData,
                isAvailable: true,
              },
            });
          }
        }}
      />

      {/* Modal: Forgot Password */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultRole="worker"
        initialPhone={loginPhone}
      />
    </div>
  );
}
