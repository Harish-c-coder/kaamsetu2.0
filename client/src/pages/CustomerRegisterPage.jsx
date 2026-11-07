import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import PhoneCountryInput from '../components/PhoneCountryInput';
import StrongPasswordInput from '../components/StrongPasswordInput';
import { checkPasswordStrength } from '../utils/passwordStrength';

export default function CustomerRegisterPage() {
  const { loginCustomerUser, selectedLocality } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full name / username.');
      return;
    }

    if (phone.length !== 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (password) {
      const strength = checkPasswordStrength(password);
      if (!strength.isStrong) {
        setError('Please choose a strong password matching the checklist requirements.');
        return;
      }
    }

    setLoading(true);

    try {
      const fullPhone = `${countryCode}${phone}`;
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: fullPhone,
          email: email.trim(),
          password,
          locality: selectedLocality || 'Kukatpally',
          city: 'Hyderabad',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create customer account');
      }

      loginCustomerUser(data.data);
      navigate('/customer/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl space-y-6 text-[#E0EBE9]">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-slate-300 border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-[#E0EBE9]">Create Customer Account</h1>
          <p className="text-xs text-[#8E9EA2]">
            Discover and directly connect with verified neighborhood professionals
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8E9EA2] uppercase mb-1">
              Full Name / Username *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Rao"
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E9EA2] uppercase mb-1">
              Gmail / Email ID (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ananya@gmail.com"
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
            />
          </div>

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

          {/* Strong Password Input */}
          <StrongPasswordInput
            password={password}
            onPasswordChange={setPassword}
            label="Account Password"
            required={true}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-sm rounded-full shadow-lg shadow-black/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-[#0B0F10]" />
            <span>{loading ? 'Creating Account...' : 'Complete Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#8E9EA2] border-t border-white/[0.06] flex flex-col gap-2">
          <div>
            <span>Already have a customer account? </span>
            <Link to="/customer/login" className="font-semibold text-slate-300 hover:underline">
              Sign In Here
            </Link>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-center gap-1.5 text-[11px] text-[#8E9EA2]">
            <span>Are you a service worker? </span>
            <Link to="/worker/register" className="font-semibold text-[#E0EBE9] hover:text-white">
              Register as a Worker Partner →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
