import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProviderCard({ worker, viewMode = 'grid' }) {
  const { t, tr, customerUser, toggleSaveWorker, recordCustomerContact } = useApp();

  // Clean WhatsApp number
  const rawPhone = worker.phone || '';
  const cleanPhone = rawPhone.replace(/[^\d]/g, '');

  const prefilledMsg = encodeURIComponent(
    `Hello ${worker.name.split(' ')[0]}, I found your profile on KaamSetu. I would like to enquire about your service.`
  );
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${prefilledMsg}`;
  const callUrl = `tel:${worker.phone}`;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    worker.name
  )}&background=182124&color=E0EBE9&size=200&bold=true`;

  const isGrid = viewMode === 'grid';
  const isSaved = customerUser?.savedWorkers?.includes(worker._id);

  const handleWhatsAppClick = () => {
    recordCustomerContact(worker, 'whatsapp');
  };

  const handleCallClick = () => {
    recordCustomerContact(worker, 'call');
  };

  const shift = worker.activeShift;

  return (
    <div
      className={`glass-panel rounded-2xl glass-panel-hover overflow-hidden flex flex-col justify-between group ${
        !isGrid ? 'sm:flex-row sm:items-center p-5 gap-6' : 'p-5'
      }`}
    >
      <div className={!isGrid ? 'flex items-start gap-4 flex-1' : ''}>
        {/* Top Header: Image, Name, Badge & Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={worker.profileImage || defaultAvatar}
                alt={worker.name}
                className="w-13 h-13 rounded-2xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
              {/* Availability dot */}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#13191C] ${
                  worker.isAvailable ? 'bg-[#34D399] shadow-sm shadow-emerald-500/50' : 'bg-[#64748B]'
                }`}
                title={worker.isAvailable ? 'Available Now' : 'Off-Duty'}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-heading font-semibold text-[#E0EBE9] text-base group-hover:text-white transition-colors">
                  {worker.name}
                </h3>
                {worker.isDemo && (
                  <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                    Demo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="inline-block text-[11px] font-medium text-slate-200 bg-white/[0.06] border border-white/10 px-2.5 py-0.5 rounded-full">
                  {tr(worker.category)}
                </span>

                {worker.subCategory && (
                  <span className="inline-block text-[10px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    {tr(worker.subCategory)}
                  </span>
                )}

                {/* Shift Badge */}
                {shift && worker.isAvailable && (
                  <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#F59E0B]" />
                    <span>
                      {shift.startTime && shift.endTime && shift.startTime !== 'Dynamic'
                        ? `${shift.startTime} – ${shift.endTime}`
                        : tr(shift.name || 'On Shift')}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bookmark / Save Button for Customers */}
          <button
            onClick={() => toggleSaveWorker(worker._id)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isSaved
                ? 'bg-white/20 border-white/40 text-white'
                : 'bg-white/[0.04] border-white/10 text-[#8E9EA2] hover:text-[#E0EBE9] hover:bg-white/[0.08]'
            }`}
            title={isSaved ? tr('Remove from Saved') : tr('Save Worker')}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Short description */}
        <p className="mt-3 text-xs sm:text-sm text-[#8E9EA2] line-clamp-2 leading-relaxed">
          {tr(worker.description || 'Experienced local professional offering services across Hyderabad.')}
        </p>

        {/* Locality & Distance / Price metadata */}
        <div className="mt-3.5 flex items-center gap-3 text-xs text-[#8E9EA2] flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[#E0EBE9]">{tr(worker.locality || 'Hyderabad')}</span>
          </div>

          {worker.distanceKm !== undefined && (
            <span className="text-[11px] text-slate-300 font-mono">
              • {worker.distanceKm.toFixed(1)} {tr('km away')}
            </span>
          )}

          {worker.price && (
            <span className="text-[11px] text-[#E0EBE9] font-mono">
              • {tr('Starting')} ₹{worker.price}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: WhatsApp, Call & Profile (Monochromatic Slate & Gray) */}
      <div className={`mt-4 pt-3.5 border-t border-white/[0.06] flex items-center gap-2 ${!isGrid ? 'sm:mt-0 sm:pt-0 sm:border-t-0 sm:flex-col sm:w-44' : ''}`}>
        
        {/* WhatsApp Click-to-Chat */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="flex-1 py-2 px-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
          <span>{t.card?.whatsapp || tr('WhatsApp')}</span>
        </a>

        {/* Direct Call Link */}
        <a
          href={callUrl}
          onClick={handleCallClick}
          className="py-2 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#E0EBE9] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Phone className="w-3.5 h-3.5 text-slate-300" />
          <span>{t.card?.call || tr('Call')}</span>
        </a>

        {/* View Profile */}
        <Link
          to={`/provider/${worker._id}`}
          className="p-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-[#8E9EA2] hover:text-[#E0EBE9] border border-white/[0.06] flex items-center justify-center transition-colors"
          title={tr('View Full Profile')}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
