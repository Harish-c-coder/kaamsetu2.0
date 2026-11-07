import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Users,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import PhoneCountryInput from './PhoneCountryInput';
import StrongPasswordInput from './StrongPasswordInput';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  initialAccountType = 'customer',
  onSuccessRedirect,
}) {
  const [accountType, setAccountType] = useState(initialAccountType); // 'customer' | 'worker'
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP & New Password, 3: Success

  // Form states
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const getFullIdentifier = () => {
    if (accountType === 'customer' && email.trim() && !phone.trim()) {
      return email.trim();
    }
    return `${countryCode}${phone}`;
  };

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    const identifier = getFullIdentifier();
    if (!phone && !email) {
      setError('Please enter your registered phone number or email.');
      return;
    }

    if (phone && phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType, identifier }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setDemoOtp(data.demoOtp || '123456');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);

    try {
      const identifier = getFullIdentifier();
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType,
          identifier,
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccessMsg(data.message);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onClose();
    if (onSuccessRedirect) {
      onSuccessRedirect(accountType);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[#13191C] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-white/10 text-[#E4ECEC] cursor-default space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-[#8E9EA2] hover:text-white transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-[#F59E0B] border border-white/[0.08] flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E4ECEC]">
            Reset Your Password
          </h2>
          <p className="text-xs text-[#8E9EA2]">
            Verify your registered contact to regain access to your KaamSetu account
          </p>
        </div>

        {/* Account Type Selector (Step 1 only) */}
        {step === 1 && (
          <div className="flex p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAccountType('customer');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                accountType === 'customer'
                  ? 'bg-slate-200 text-[#0B0F10] shadow-sm'
                  : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType('worker');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                accountType === 'worker'
                  ? 'bg-slate-200 text-[#0B0F10] shadow-sm'
                  : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Partner Worker</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enter Phone / Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E9EA2] uppercase mb-1">
                Registered Mobile Number (10 Digits) *
              </label>
              <PhoneCountryInput
                countryCode={countryCode}
                onCountryChange={setCountryCode}
                phone={phone}
                onPhoneChange={setPhone}
                required={true}
              />
            </div>

            {accountType === 'customer' && (
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-[#8E9EA2]">Or registered Gmail ID:</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & Set New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Demo OTP Banner for instant testability */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>Verification code sent! (Demo OTP: <strong className="font-mono text-white underline">{demoOtp}</strong>)</span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(demoOtp)}
                className="text-[11px] font-bold text-[#F59E0B] hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E9EA2] uppercase mb-1">
                6-Digit Verification Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-2.5 font-mono text-base tracking-widest text-center bg-[#0F172A] border border-[#334155] rounded-xl text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
              />
            </div>

            <StrongPasswordInput
              password={newPassword}
              onPasswordChange={setNewPassword}
              label="New Strong Password *"
              required={true}
              showChecker={true}
            />

            <div>
              <label className="block text-xs font-semibold text-[#8E9EA2] uppercase mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your new password"
                className="w-full px-4 py-2.5 font-mono text-xs sm:text-sm bg-[#0F172A] border border-[#334155] rounded-xl text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-[#8E9EA2] hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password & Continue'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center space-y-4 py-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Password Updated!</h3>
              <p className="text-xs text-[#8E9EA2] mt-1 max-w-xs mx-auto">
                {successMsg || 'Your account password has been changed successfully. You can now log in securely.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
