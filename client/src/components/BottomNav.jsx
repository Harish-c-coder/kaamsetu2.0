import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Home,
  Grid3X3,
  Zap,
  Briefcase,
  User,
  Clock,
  Layers,
  ExternalLink,
  Users,
  Bookmark,
  Mic,
  CalendarCheck,
} from 'lucide-react';

export default function BottomNav({ onOpenInstaHelp, onOpenVoice }) {
  const { t, tr, customerUser, workerUser } = useApp();
  const location = useLocation();

  const isPartnerSite = import.meta.env.VITE_APP_TYPE === 'partner';
  const customerSiteUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5174/app` : 'http://localhost:5174/app';

  const isHome = location.pathname === '/';
  const isServices = (location.pathname.startsWith('/customer/home') || location.pathname.startsWith('/customer/search') || location.pathname === '/services') && !location.pathname.includes('categories');
  const isCategories = location.pathname.startsWith('/customer/categories') || location.pathname.startsWith('/categories');
  const isProfile = location.pathname.startsWith('/customer/profile') || location.pathname.startsWith('/customer/login');

  if (isPartnerSite) {
    /* PARTNER MOBILE BOTTOM NAV */
    return (
      <nav
        aria-label="Partner Mobile Navigation"
        className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-[#13191C]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-2xl"
      >
        {/* 1. Duty Shifts */}
        <NavLink
          to={workerUser ? "/worker/dashboard?tab=shifts" : "/login"}
          className={() =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              location.search.includes('shifts') ? 'text-white font-bold' : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
            }`
          }
        >
          <Clock className="w-5 h-5 text-[#34D399]" />
          <span className="text-[10px] tracking-tight">Shifts</span>
        </NavLink>

        {/* 2. Catalog */}
        <NavLink
          to={workerUser ? "/worker/dashboard?tab=listings" : "/login"}
          className={() =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              location.search.includes('listings') ? 'text-white font-bold' : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
            }`
          }
        >
          <Layers className="w-5 h-5 text-slate-300" />
          <span className="text-[10px] tracking-tight">Catalog</span>
        </NavLink>

        {/* 3. Center Highlight: Partner Voice Mic Assistant (Circled by user) */}
        <button
          type="button"
          onClick={onOpenVoice}
          className="flex flex-col items-center -mt-4 group cursor-pointer"
          title="Partner Voice AI Assistant (Telugu / Hindi / English)"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-[1px] shadow-lg shadow-amber-500/25 group-hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
            <div className="w-full h-full bg-[#0C1012] rounded-[15px] flex items-center justify-center">
              <Mic className="w-6 h-6 text-[#F59E0B] animate-pulse" />
            </div>
          </div>
          <span className="text-[9px] font-bold text-[#F59E0B] mt-0.5 tracking-tight uppercase">Mic</span>
        </button>

        {/* 4. Partner Profile / Login */}
        <NavLink
          to={workerUser ? "/worker/dashboard?tab=profile" : "/login"}
          className={() =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              location.pathname === '/login' || location.search.includes('profile')
                ? 'text-white font-bold'
                : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
            }`
          }
        >
          <User className="w-5 h-5 text-blue-400" />
          <span className="text-[10px] tracking-tight">{workerUser ? 'Profile' : 'Login'}</span>
        </NavLink>

        {/* 5. THE ONE SINGLE CONNECTION: Customer App */}
        <a
          href={customerSiteUrl}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[#F59E0B] hover:text-[#fbbf24] transition-all"
        >
          <div className="flex items-center gap-0.5">
            <Users className="w-5 h-5 text-[#F59E0B]" />
            <ExternalLink className="w-2.5 h-2.5 text-[#F59E0B]" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Customer</span>
        </a>
      </nav>
    );
  }

  /* CUSTOMER MOBILE BOTTOM NAV (ZERO PARTNER LINKS) */
  return (
    <nav
      aria-label="Customer Mobile Navigation"
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-[#13191C]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-2xl"
    >
      {/* 1. Home Link */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            isActive && isHome
              ? 'text-white font-bold'
              : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
          }`
        }
      >
        <Home className={`w-5 h-5 ${isHome ? 'text-[#F59E0B] stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight">{t.nav?.home || 'Home'}</span>
      </NavLink>

      {/* 2. Services Directory */}
      <NavLink
        to="/customer/home"
        className={() =>
          `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            isServices
              ? 'text-white font-bold'
              : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
          }`
        }
      >
        <Grid3X3 className={`w-5 h-5 ${isServices ? 'text-[#F59E0B] stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight">{t.portal?.services || 'Services'}</span>
      </NavLink>

      {/* 3. InstaHelp Emergency Dispatch (Center Highlight) */}
      <button
        type="button"
        onClick={onOpenInstaHelp}
        className="flex flex-col items-center -mt-4 group cursor-pointer"
        title="InstaHelp 20-min Emergency Response"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-[1px] shadow-lg shadow-amber-500/25 group-hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
          <div className="w-full h-full bg-[#0C1012] rounded-[15px] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#F59E0B] fill-amber-400 animate-pulse" />
          </div>
        </div>
        <span className="text-[9px] font-bold text-[#F59E0B] mt-0.5 tracking-tight uppercase">InstaHelp</span>
      </button>

      {/* 4. Categories (Dedicated Page) */}
      <NavLink
        to="/customer/categories"
        className={() =>
          `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            isCategories
              ? 'text-white font-bold'
              : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
          }`
        }
      >
        <Layers className={`w-5 h-5 ${isCategories ? 'text-[#F59E0B] stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight">Categories</span>
      </NavLink>

      {/* 5. Account / Profile (Customer Only) */}
      <NavLink
        to={customerUser ? '/customer/profile' : '/customer/login'}
        className={() =>
          `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            isProfile
              ? 'text-white font-bold'
              : 'text-[#8E9EA2] hover:text-[#E4ECEC]'
          }`
        }
      >
        <User className={`w-5 h-5 ${isProfile ? 'text-[#F59E0B] stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight">
          {customerUser ? 'Profile' : 'Sign In'}
        </span>
      </NavLink>
    </nav>
  );
}
