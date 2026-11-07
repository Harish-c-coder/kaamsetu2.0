import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Sparkles,
  MapPin,
  Compass,
} from 'lucide-react';
import LocationPromptModal from '../components/LocationPromptModal';

export default function ChooseRolePage() {
  const {
    t,
    tr,
    customerUser,
    logoutCustomerUser,
    workerUser,
    logoutWorkerUser,
    selectedLocality,
    setSelectedLocality,
    detectLocation,
    userLocation,
  } = useApp();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-slate-300 text-xs font-semibold mb-3 border border-white/[0.08]">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{tr('Dual Architecture')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#E0EBE9]">
          {tr('Select Your Portal')}
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-[#8E9EA2]">
          {tr('Dedicated interfaces for neighborhood customers and certified field partners.')}
        </p>
      </div>

      {/* Location Status Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-white/[0.1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-[#F59E0B] shrink-0 border border-white/10">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#8E9EA2] block text-[10px] font-mono uppercase tracking-wider">
              {tr('Selected Location (Hyderabad)')}
            </span>
            <span className="font-bold text-[#E0EBE9] text-sm">
              {selectedLocality
                ? `📍 ${selectedLocality}, Hyderabad`
                : customerUser?.locality
                ? `📍 ${customerUser.locality}, Hyderabad`
                : tr('Location not set — click to choose neighborhood')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={detectLocation}
            className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8E9EA2] hover:text-[#E0EBE9] border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{userLocation.loading ? tr('Detecting...') : tr('Detect GPS')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLocationPrompt(true)}
            className="px-4 py-1.5 rounded-full bg-slate-200 hover:bg-white text-[#0B0F10] font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{selectedLocality ? tr('Change Location') : tr('Set Location 📍')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* App 1: Customer Discovery App */}
        <div className="glass-panel rounded-3xl p-8 border border-white/[0.1] hover:border-white/20 shadow-2xl transition-all flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                customerUser
                  ? 'bg-slate-200 text-[#0B0F10] font-bold border-white/20'
                  : 'bg-white/[0.04] text-[#8E9EA2] border-white/10'
              }`}>
                {customerUser ? '● Account Logged In' : '○ Not Logged In'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                {t.portal?.customerMarketplace || tr('Customer Marketplace')}
              </span>
              <h2 className="text-2xl font-heading font-bold text-[#E0EBE9] mt-1">
                {t.portal?.findingServiceApp || tr('Finding Service App')}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#8E9EA2] leading-relaxed">
              {t.portal?.customerDesc || tr('Find neighborhood electricians, plumbers, carpenters, painters, vegetables, pots, or handloom crafts with an affordable 5% commission.')}
            </p>

            {customerUser ? (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9EA2]">{t.portal?.accountName || tr('Account Name:')}</span>
                  <span className="font-bold text-[#E0EBE9]">{customerUser.name}</span>
                </div>
                <div className="flex items-center justify-between text-[#8E9EA2]">
                  <span>{t.portal?.phone || tr('Phone:')}</span>
                  <span className="font-mono text-slate-300">{customerUser.phone}</span>
                </div>
                {customerUser.email && (
                  <div className="flex items-center justify-between text-[#8E9EA2]">
                    <span>{t.portal?.gmail || tr('Gmail / Email:')}</span>
                    <span className="font-mono text-slate-300">{customerUser.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#8E9EA2] pt-1 border-t border-white/[0.04]">
                  <span>{t.portal?.savedArea || tr('Saved Area:')}</span>
                  <span className="text-[#E0EBE9]">📍 {customerUser.locality || selectedLocality || 'Hyderabad'}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#8E9EA2] space-y-1">
                <p className="font-semibold text-slate-300">{tr('Sign in with Phone or Gmail ID')}</p>
                <p className="text-[11px] leading-relaxed">
                  {tr('Log in to access your direct WhatsApp inquiries, saved craftsmen, and nearby results.')}
                </p>
              </div>
            )}

            <ul className="space-y-2 text-xs text-[#8E9EA2] pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-300" />
                <span>{tr('Low 5% commission — fair, direct worker earnings')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-300" />
                <span>{tr('Locality map search & nearby filters')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-300" />
                <span>{tr('Direct WhatsApp Click-to-Chat & Phone')}</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-2.5">
            {customerUser ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const loc = selectedLocality || customerUser?.locality || '';
                    navigate(`/customer/home${loc ? `?locality=${encodeURIComponent(loc)}` : ''}`);
                  }}
                  className="flex-1 py-3.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold rounded-full text-center shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t.portal?.openFindingApp || tr('Open Service App & View Nearby')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={logoutCustomerUser}
                  className="px-4 py-3 bg-white/[0.04] hover:bg-white/[0.1] text-red-300 text-xs font-semibold rounded-full border border-white/10 transition-colors cursor-pointer"
                >
                  {t.nav?.logout || tr('Logout')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/customer/login')}
                  className="w-full py-3.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold rounded-full text-center shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t.portal?.signInPhoneGmail || tr('Customer Sign In (Phone / Gmail)')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/customer/register')}
                    className="flex-1 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] font-semibold rounded-full text-xs transition-colors cursor-pointer text-center"
                  >
                    {t.portal?.createCustomerAccount || tr('Register Account')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const loc = selectedLocality || '';
                      navigate(`/customer/home${loc ? `?locality=${encodeURIComponent(loc)}` : ''}`);
                    }}
                    className="flex-1 py-2 bg-white/[0.02] hover:bg-white/[0.06] text-[#8E9EA2] hover:text-[#E0EBE9] border border-white/[0.06] rounded-full text-xs transition-colors cursor-pointer text-center"
                  >
                    {tr('Guest Browse →')}
                  </button>
                </div>
              </div>
            )}

            <Link
              to="/customer/app"
              className="w-full py-2 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] font-medium rounded-full text-center text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-300" />
              <span>{t.portal?.phoneAppView || tr('Customer Mobile Phone View')}</span>
            </Link>
          </div>
        </div>

        {/* App 2: Worker Partner App */}
        <div className="glass-panel rounded-3xl p-8 border border-white/[0.1] hover:border-white/20 shadow-2xl transition-all flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[#F59E0B] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                workerUser
                  ? 'bg-slate-200 text-[#0B0F10] font-bold border-white/20'
                  : 'bg-white/[0.04] text-[#8E9EA2] border-white/10'
              }`}>
                {workerUser ? (t.portal?.loggedIn || tr('● Partner Logged In')) : (t.portal?.notLoggedIn || tr('○ Not Logged In'))}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#F59E0B] uppercase">
                {tr('Worker Partner Network')}
              </span>
              <h2 className="text-2xl font-heading font-bold text-[#E0EBE9] mt-1">
                {t.portal?.workerPartnerPortal || tr('Worker Partner App')}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#8E9EA2] leading-relaxed">
              {t.portal?.partnerDesc || tr('Field portal for artisans and skilled trades to manage their duty shifts (1h, 2h, full day), catalog, and customer enquiries.')}
            </p>

            {workerUser ? (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9EA2]">{tr('Partner Name:')}</span>
                  <span className="font-bold text-[#E0EBE9]">{workerUser.name}</span>
                </div>
                <div className="flex items-center justify-between text-[#8E9EA2]">
                  <span>{tr('Category:')}</span>
                  <span className="text-slate-200 font-semibold">{t.categories?.[workerUser.category] || tr(workerUser.category)}</span>
                </div>
                <div className="flex items-center justify-between text-[#8E9EA2]">
                  <span>{tr('Shift:')}</span>
                  <span className="font-mono text-slate-300">{workerUser.activeShift?.name || tr('Full Day Shift')}</span>
                </div>
                <div className="flex items-center justify-between text-[#8E9EA2] pt-1 border-t border-white/[0.04]">
                  <span>{tr('Status:')}</span>
                  <span className="text-slate-200">{workerUser.isAvailable ? tr('● Available for Work') : tr('○ Currently Busy')}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#8E9EA2] space-y-1">
                <p className="font-semibold text-slate-300">{tr('Are you a skilled technician or vendor?')}</p>
                <p className="text-[11px] leading-relaxed">
                  {tr('Log in with your registered partner number and password to manage shifts & customer inquiries.')}
                </p>
              </div>
            )}

            <ul className="space-y-2 text-xs text-[#8E9EA2] pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
                <span>{tr('Flexible hourly shift scheduling (1h, 2h, full day)')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
                <span>{tr('Voice input in Telugu, Hindi & English')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
                <span>{tr('1-Click Availability toggle (Available / Busy)')}</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-2.5">
            {workerUser ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/worker/dashboard')}
                  className="flex-1 py-3.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold rounded-full text-center shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{tr('Open Partner Dashboard')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={logoutWorkerUser}
                  className="px-4 py-3 bg-white/[0.04] hover:bg-white/[0.1] text-red-300 text-xs font-semibold rounded-full border border-white/10 transition-colors cursor-pointer"
                >
                  {t.nav?.logout || tr('Logout')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold rounded-full text-center shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t.portal?.partnerLoginBtn || tr('Partner Sign In (Mobile & Password)')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/worker/register')}
                    className="flex-1 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] font-semibold rounded-full text-xs transition-colors cursor-pointer text-center"
                  >
                    {t.portal?.joinAsPartnerBtn || tr('Register Profile')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/partner')}
                    className="flex-1 py-2 bg-white/[0.02] hover:bg-white/[0.06] text-[#8E9EA2] hover:text-[#E0EBE9] border border-white/[0.06] rounded-full text-xs transition-colors cursor-pointer text-center"
                  >
                    {tr('Partner Info →')}
                  </button>
                </div>
              </div>
            )}

            <Link
              to="/worker/app"
              className="w-full py-2 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] font-medium rounded-full text-center text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{tr('Worker Phone App View')}</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Location Modal */}
      <LocationPromptModal
        isOpen={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
        currentLocality={selectedLocality}
        onSelectLocality={(locName) => {
          setSelectedLocality(locName);
        }}
        detectLocation={detectLocation}
        userLocation={userLocation}
      />
    </div>
  );
}
