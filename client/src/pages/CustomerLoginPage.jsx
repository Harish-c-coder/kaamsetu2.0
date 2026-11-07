import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Mail,
  Phone,
  CalendarCheck,
} from 'lucide-react';
import PhoneCountryInput from '../components/PhoneCountryInput';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function CustomerLoginPage() {
  const { loginCustomerUser } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get('redirect');
  const isFromBookings = redirectParam === 'bookings';

  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    let identifierPayload = '';

    if (loginMethod === 'phone') {
      if (phone.length !== 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      identifierPayload = `${countryCode}${phone}`;
    } else {
      if (!emailOrUsername.trim()) {
        setError('Please enter your Gmail ID or Username.');
        return;
      }
      identifierPayload = emailOrUsername.trim();
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: identifierPayload,
          identifier: identifierPayload,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      loginCustomerUser(data.data);
      if (isFromBookings) {
        navigate('/customer/profile?tab=bookings');
      } else {
        navigate('/customer/home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl space-y-6 text-[#E0EBE9]">
        
        {/* User-Requested Alert: You must log in or sign in */}
        {isFromBookings && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-start gap-3 text-left shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0 mt-0.5">
              <CalendarCheck className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-[#F59E0B]">
                You must log in or sign in
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Please enter your login credentials below to view and manage your service bookings.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-slate-300 border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-[#E0EBE9]">
            {isFromBookings ? 'Sign In to View Bookings' : 'Customer Sign In'}
          </h1>
          <p className="text-xs text-[#8E9EA2]">
            {isFromBookings
              ? 'Enter your customer credentials below to access your active bookings'
              : 'Access your bookmarked providers, contact history, and neighborhood services'}
          </p>
        </div>

        {/* Login Method Toggle: Phone Number vs Gmail ID / Username */}
        <div className="flex p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('phone');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMethod === 'phone'
                ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                : 'text-[#8E9EA2] hover:text-[#E0EBE9]'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile Phone</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('email');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMethod === 'email'
                ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                : 'text-[#8E9EA2] hover:text-[#E0EBE9]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail / Username</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {loginMethod === 'phone' ? (
            <div>
              <label className="block text-xs font-semibold text-[#8E9EA2] uppercase mb-1">
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
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#8E9EA2] uppercase mb-1">
                Gmail ID or Username *
              </label>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="e.g. ananya@gmail.com or ananya"
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#8E9EA2] uppercase">
                Account Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-[#F59E0B] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-[#0F172A] border border-[#334155] rounded-xl text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-[#8E9EA2] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-sm rounded-full shadow-lg shadow-black/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{loading ? 'Signing In...' : 'Sign In as Customer'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#8E9EA2] border-t border-white/[0.06] flex flex-col gap-2">
          <div>
            <span>New customer? </span>
            <Link to="/customer/register" className="font-semibold text-slate-300 hover:underline">
              Create Customer Account
            </Link>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-center gap-1.5 text-[11px] text-[#8E9EA2]">
            <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Are you a service worker? </span>
            <Link to="/login" className="font-semibold text-[#E0EBE9] hover:text-white">
              Switch to Partner Login →
            </Link>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialAccountType="customer"
      />
    </div>
  );
}
