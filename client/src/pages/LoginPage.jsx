import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LogIn,
  Lock,
  ArrowRight,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import PhoneCountryInput from '../components/PhoneCountryInput';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function LoginPage() {
  const { loginWorkerUser } = useApp();
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `${countryCode}${phone}`;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          password: password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        loginWorkerUser(data.data);
        navigate('/worker/dashboard');
      } else {
        setError(data.message || 'Login failed. Please verify your phone number and password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-[#E0EBE9]">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-[#F59E0B] border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-[#E0EBE9]">Worker Partner Login</h1>
          <p className="text-xs text-[#8E9EA2]">
            Access your duty dashboard, shift selector, and incoming client enquiries
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8E9EA2] uppercase mb-1">
              Registered Phone Number *
            </label>
            <PhoneCountryInput
              countryCode={countryCode}
              onCountryChange={setCountryCode}
              phone={phone}
              onPhoneChange={setPhone}
              required={true}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#8E9EA2] uppercase">
                Account Password *
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your partner password"
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
            className="w-full py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-sm rounded-full shadow-lg shadow-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{loading ? 'Logging In...' : 'Access Partner Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#8E9EA2] border-t border-white/[0.06] flex flex-col gap-2">
          <div>
            <span>New partner? </span>
            <Link to="/worker/register" className="font-semibold text-slate-200 hover:underline">
              Register as a Worker / Vendor
            </Link>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-center gap-1.5 text-[11px] text-[#8E9EA2]">
            <span>Are you a customer? </span>
            <Link to="/customer/login" className="font-semibold text-[#E0EBE9] hover:text-white">
              Switch to Customer Login →
            </Link>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialAccountType="worker"
      />
    </div>
  );
}
