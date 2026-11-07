import React, { useState } from 'react';
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '../utils/countryCodes';
import { ChevronDown, Check } from 'lucide-react';

export default function PhoneCountryInput({
  countryCode = '+91',
  onCountryChange,
  phone = '',
  onPhoneChange,
  required = true,
  disabled = false,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');

  const currentCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) || DEFAULT_COUNTRY;

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
      c.code.includes(searchCountry)
  );

  const handlePhoneInputChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    onPhoneChange(digitsOnly);
  };

  const isComplete = phone.length === 10;

  return (
    <div className="space-y-1.5">
      <div className="flex rounded-xl border border-[#334155] bg-[#0F172A] overflow-visible relative focus-within:border-amber-500/60 transition-all shadow-inner">
        
        {/* Country Code Picker Dropdown Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-[#13191C] border-r border-[#334155] text-xs font-semibold text-[#E4ECEC] hover:bg-[#182024] transition-colors cursor-pointer shrink-0 rounded-l-xl"
        >
          <span className="text-base">{currentCountry.flag}</span>
          <span className="font-mono">{currentCountry.code}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>

        {/* 10-Digit Phone Input Field */}
        <div className="relative flex-1 flex items-center">
          <input
            type="tel"
            required={required}
            disabled={disabled}
            value={phone}
            onChange={handlePhoneInputChange}
            placeholder="10-digit mobile number"
            className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono tracking-wider bg-[#0F172A] text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none rounded-r-xl"
          />
          {isComplete && (
            <span className="absolute right-3 text-slate-300">
              <Check className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Country Picker Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#13191C] rounded-2xl shadow-2xl border border-white/10 p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <input
              type="text"
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl mb-2 text-[#E0EBE9] placeholder-[#8E9EA2]/60 focus:outline-none focus:border-slate-400"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {filteredCountries.map((c) => (
                <button
                  key={`${c.name}-${c.code}`}
                  type="button"
                  onClick={() => {
                    onCountryChange(c.code);
                    setDropdownOpen(false);
                    setSearchCountry('');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                    countryCode === c.code
                      ? 'bg-white/15 text-white font-bold'
                      : 'hover:bg-white/[0.04] text-[#8E9EA2] hover:text-[#E0EBE9]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="truncate max-w-[120px]">{c.name}</span>
                  </div>
                  <span className="font-mono opacity-80">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Validation status badge */}
      <div className="flex items-center justify-between text-[11px] px-1 font-mono">
        <span className="text-[#8E9EA2]">Country: {currentCountry.name} ({currentCountry.code})</span>
        <span
          className={
            phone.length === 10
              ? 'text-slate-300 font-semibold flex items-center gap-1'
              : phone.length > 0
              ? 'text-[#F59E0B]'
              : 'text-[#8E9EA2]/60'
          }
        >
          {phone.length}/10 digits {phone.length === 10 ? '✓' : ''}
        </span>
      </div>
    </div>
  );
}
