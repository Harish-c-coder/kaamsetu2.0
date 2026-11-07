import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Sparkles, ExternalLink, Users, Briefcase } from 'lucide-react';

export default function Footer({ onOpenAbout, onOpenContact, onOpenPrivacy, onOpenTerms }) {
  const { t, tr } = useApp();
  const isPartnerSite = import.meta.env.VITE_APP_TYPE === 'partner';
  const customerSiteUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5174` : 'http://localhost:5174';

  return (
    <footer className="hidden md:block bg-[#0A0D0F] border-t border-white/[0.08] mt-24 pt-16 pb-12 text-[#8E9EA2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className={`w-3.5 h-3.5 rounded-full ${isPartnerSite ? 'bg-[#F59E0B]' : 'bg-[#E4ECEC]'}`} />
                <span className={`w-3.5 h-3.5 rounded-full border-2 ${isPartnerSite ? 'border-[#F59E0B]' : 'border-[#E4ECEC]'} border-r-transparent`} />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-[#E4ECEC]">
                {t.appName || 'KaamSetu'}{' '}
                <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded ${
                  isPartnerSite ? 'text-[#F59E0B] bg-amber-500/10' : 'text-[#8E9EA2] bg-white/[0.05]'
                }`}>
                  ({isPartnerSite ? 'PARTNER' : 'CUSTOMER'})
                </span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8E9EA2] max-w-md leading-relaxed">
              {isPartnerSite
                ? 'The dedicated operations hub for electricians, plumbers, beauticians, cleaners, and artisans to earn directly with transparent 5% platform fees.'
                : 'A decentralized local marketplace engineered to connect informal workers, artisans, and street vendors directly with nearby Hyderabad residents with zero middleman markup.'}
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-slate-300 bg-white/[0.04] border border-white/10 font-medium px-3.5 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5 text-slate-300" />
              <span>{isPartnerSite ? 'Affordable 5% Platform Commission • 95% to Workers' : 'Direct Local Connect • Zero Middleman Markup'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-[#E4ECEC] text-xs uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {isPartnerSite ? (
                <>
                  <li>
                    <Link to="/" className="hover:text-[#E4ECEC] transition-colors">
                      Partner Overview
                    </Link>
                  </li>
                  <li>
                    <Link to="/worker/dashboard?tab=shifts" className="hover:text-[#E4ECEC] transition-colors">
                      Work Shifts Schedule
                    </Link>
                  </li>
                  <li>
                    <Link to="/worker/dashboard?tab=listings" className="hover:text-[#E4ECEC] transition-colors">
                      Service Catalog & Rates
                    </Link>
                  </li>
                  <li>
                    <Link to="/worker/dashboard" className="hover:text-[#E4ECEC] transition-colors">
                      Partner Dashboard
                    </Link>
                  </li>
                  {/* Single Link to Customer Site */}
                  <li className="pt-2">
                    <a
                      href={customerSiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#F59E0B] hover:text-[#fbbf24] font-bold"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Switch to Customer App</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/" className="hover:text-[#E4ECEC] transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/customer/home" className="hover:text-[#E4ECEC] transition-colors">
                      Find Services Near Me
                    </Link>
                  </li>
                  <li>
                    <Link to="/customer/login" className="hover:text-[#E4ECEC] transition-colors">
                      Customer Sign In
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Information & Legal */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-[#E4ECEC] text-xs uppercase tracking-widest">
              Information
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-[#E4ECEC] transition-colors cursor-pointer text-left"
                >
                  About Platform
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-[#E4ECEC] transition-colors cursor-pointer text-left"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-[#E4ECEC] transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-[#E4ECEC] transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-[#8E9EA2]">
            © {new Date().getFullYear()} KaamSetu {isPartnerSite ? 'Partner Network' : 'Customer Marketplace'}. Direct peer-to-peer connection.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <span>Hyderabad, Telangana • Live Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
