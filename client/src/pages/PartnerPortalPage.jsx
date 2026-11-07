import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Phone,
  Lock,
  Compass,
  Layers,
  MapPin,
  Clock,
  Mic,
  Users,
} from 'lucide-react';
import PhoneCountryInput from '../components/PhoneCountryInput';
import StrongPasswordInput from '../components/StrongPasswordInput';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function PartnerPortalPage() {
  const { workerUser, loginWorkerUser, t, tr } = useApp();
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState('login'); // 'login' or 'quick-register'
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electrician');
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [error, setError] = useState('');

  const customerSiteUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5174` : 'http://localhost:5174';

  const handlePartnerAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (phone.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `${countryCode}${phone}`;
      
      if (activeMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone, password }),
        });
        const data = await res.json();
        if (data.success) {
          loginWorkerUser(data.data);
          navigate('/worker/dashboard');
        } else {
          setError(data.message || 'Login failed. If you are new, click Register below.');
        }
      } else {
        // Quick register
        if (!name.trim()) {
          setError('Please provide your name.');
          setLoading(false);
          return;
        }

        const catName = category === 'Create Your Own Service' ? (customCategory.trim() || 'Custom Artisan') : category;
        const res = await fetch('/api/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone: fullPhone,
            password,
            category: catName,
            locality: 'Kukatpally',
            state: 'Telangana',
            city: 'Hyderabad',
            serviceRadius: 5,
            isAvailable: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          loginWorkerUser(data.data);
          navigate('/worker/dashboard');
        } else {
          setError(data.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setError('Unable to reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1012] text-[#E0EBE9] flex flex-col justify-between selection:bg-white/20 selection:text-white">

      {/* Main Partner Hero & Onboarding Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center flex-1">
        
        {/* Left Side: Partner Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#F4A340]" />
            <span>{t.portal?.commissionRate ? `${t.portal.commissionRate} • ${tr('Direct Customer Earnings')}` : tr('5% Commission • Direct Customer Earnings')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {tr('The Dedicated Platform for')} <span className="text-[#F4A340]">{tr('Local Workers')}</span> & <span className="text-slate-200">{tr('Artisans')}</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {tr('Just like Blinkit Partner or Swiggy Partner apps, KaamSetu Partner is built specifically for technicians, skilled craftspeople, and vendors to manage their duty shifts, customer phone calls, and direct WhatsApp bookings.')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                <Clock className="w-4 h-4 text-[#F4A340]" />
                <span>{tr('Flexible Work Shifts')}</span>
              </div>
              <p className="text-xs text-slate-300">
                {tr('Choose 1-hr, 2-hr, 3-hr shifts, 9 AM – 8 PM, 9 AM – 10 PM, or custom hours.')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 text-[#F4A340] font-bold text-xs">
                <Mic className="w-4 h-4" />
                <span>{tr('Voice in Telugu & Hindi')}</span>
              </div>
              <p className="text-xs text-slate-300">
                {tr('Speak your services in Telugu, Hindi or English using speech typing.')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Partner Quick Sign-in / Registration Card */}
        <div className="lg:col-span-5 bg-[#13191C] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('login');
                  setError('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'login'
                    ? 'bg-[#E2E8F0] text-[#0B0F10] shadow-sm'
                    : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                }`}
              >
                {t.nav?.partnerLogin || tr('Partner Login')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('quick-register');
                  setError('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'quick-register'
                    ? 'bg-[#E2E8F0] text-[#0B0F10] shadow-sm'
                    : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
                }`}
              >
                {tr('New Partner Register')}
              </button>
            </div>
            <Link
              to="/worker/register"
              className="text-[11px] font-bold text-[#F59E0B] hover:underline"
            >
              {tr('Full Form →')}
            </Link>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handlePartnerAuth} className="space-y-4">
            {activeMode === 'quick-register' && (
              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                Mobile Number (10 Digits) *
              </label>
              <PhoneCountryInput
                countryCode={countryCode}
                onCountryChange={setCountryCode}
                phone={phone}
                onPhoneChange={setPhone}
                required={true}
              />
            </div>

            {activeMode === 'quick-register' && (
              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  Profession / Trade Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] focus:outline-none focus:border-amber-500/60 shadow-inner"
                >
                  <option value="Electrician" className="bg-[#13191C] text-[#E4ECEC]">Electrician</option>
                  <option value="Plumber" className="bg-[#13191C] text-[#E4ECEC]">Plumber</option>
                  <option value="Carpenter" className="bg-[#13191C] text-[#E4ECEC]">Carpenter</option>
                  <option value="Painter" className="bg-[#13191C] text-[#E4ECEC]">Painter</option>
                  <option value="Vegetable Seller" className="bg-[#13191C] text-[#E4ECEC]">Vegetable Seller</option>
                  <option value="Potter" className="bg-[#13191C] text-[#E4ECEC]">Potter</option>
                  <option value="Handloom Weaver" className="bg-[#13191C] text-[#E4ECEC]">Handloom Weaver</option>
                  <option value="Create Your Own Service" className="bg-[#13191C] text-[#E4ECEC]">Create Your Own Service</option>
                </select>

                {category === 'Create Your Own Service' && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter your custom trade..."
                    className="w-full mt-2 px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                  />
                )}
              </div>
            )}

            <StrongPasswordInput
              password={password}
              onPasswordChange={setPassword}
              required={activeMode === 'quick-register'}
              label={activeMode === 'login' ? 'Partner Password' : 'Create Strong Password *'}
              showChecker={activeMode === 'quick-register'}
            />

            {activeMode === 'login' && (
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#F59E0B] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Processing...' : activeMode === 'login' ? 'Sign In to Partner Portal' : 'Register & Launch Partner App'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick 1-Click Demo Login */}
            {activeMode === 'login' && (
              <button
                type="button"
                onClick={async () => {
                  setPhone('9876543210');
                  setPassword('Demo@12345');
                  setLoading(true);
                  try {
                    const res = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phone: '+919876543210', password: 'Demo@12345' }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      loginWorkerUser(data.data);
                      navigate('/worker/dashboard');
                    } else {
                      // Fallback to first worker
                      const wRes = await fetch('/api/workers?locality=Koti');
                      const wData = await wRes.json();
                      if (wData.success && wData.data?.length > 0) {
                        loginWorkerUser(wData.data[0]);
                        navigate('/worker/dashboard');
                      }
                    }
                  } catch (err) {
                    setError('Login error. Check connection.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#F59E0B] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>⚡ 1-Click Demo Partner Login (Venkat Rao - Electrician)</span>
              </button>
            )}
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Looking for hiring workers instead?{' '}
            <a href={customerSiteUrl} className="text-[#F4A340] font-bold hover:underline">
              Go to Customer App ↗
            </a>
          </div>
        </div>

      </main>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialAccountType="worker"
      />
    </div>
  );
}
