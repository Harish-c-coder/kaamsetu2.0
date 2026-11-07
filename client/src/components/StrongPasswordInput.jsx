import React, { useState } from 'react';
import { checkPasswordStrength, generateStrongPassword } from '../utils/passwordStrength';
import { Eye, EyeOff, Check, X, Sparkles, ShieldCheck } from 'lucide-react';

export default function StrongPasswordInput({
  password,
  onPasswordChange,
  required = true,
  label = 'Password',
  showChecker = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = checkPasswordStrength(password);

  const handleGenerate = () => {
    const generated = generateStrongPassword();
    onPasswordChange(generated);
    setShowPassword(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#8E9EA2] uppercase">
          {label} {required && '*'}
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:underline cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
          <span>Generate Strong Password</span>
        </button>
      </div>

      {/* Input Field with Show/Hide toggle */}
      <div className="relative flex items-center">
        <input
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Create a strong password"
          className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm font-mono tracking-wider bg-[#0F172A] border border-[#334155] rounded-xl text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner transition-colors"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 p-1 text-[#8E9EA2] hover:text-[#E4ECEC] cursor-pointer"
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Interactive Strong Password Checker */}
      {showChecker && password.length > 0 && (
        <div className="p-3 bg-[#0F172A]/70 rounded-xl border border-[#334155] space-y-2 animate-in fade-in">
          
          {/* Strength Bar */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#8E9EA2]">
              Password Strength:
            </span>
            <span className={`font-semibold ${strength.textColor}`}>
              {strength.label}
            </span>
          </div>

          <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            />
          </div>

          {/* Interactive Checklist */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
            <div className={`flex items-center gap-1.5 ${strength.checks.length ? 'text-slate-200 font-medium' : 'text-[#8E9EA2]/60'}`}>
              {strength.checks.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>8+ Characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${strength.checks.uppercase ? 'text-slate-200 font-medium' : 'text-[#8E9EA2]/60'}`}>
              {strength.checks.uppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>Uppercase (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${strength.checks.lowercase ? 'text-slate-200 font-medium' : 'text-[#8E9EA2]/60'}`}>
              {strength.checks.lowercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>Lowercase (a-z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${strength.checks.number ? 'text-slate-200 font-medium' : 'text-[#8E9EA2]/60'}`}>
              {strength.checks.number ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>Number (0-9)</span>
            </div>
            <div className={`col-span-2 flex items-center gap-1.5 ${strength.checks.special ? 'text-slate-200 font-medium' : 'text-[#8E9EA2]/60'}`}>
              {strength.checks.special ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>Special Symbol (!@#$%...)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
