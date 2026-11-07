import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CategoryDetailModal({ category, isOpen, onClose }) {
  const { tr } = useApp();
  const navigate = useNavigate();

  if (!isOpen || !category) return null;

  const handleSubServiceClick = (subService) => {
    onClose();
    navigate(`/customer/home?category=${encodeURIComponent(category.id)}&q=${encodeURIComponent(subService.name)}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/customer/home?category=${encodeURIComponent(category.id)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-[480px] max-h-[85vh] bg-[#13191C] border border-white/[0.12] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Image */}
        <div className="relative h-44 shrink-0 overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13191C] via-[#13191C]/60 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-[#E4ECEC] hover:text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#F59E0B] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block mb-1">
              {category.badge || 'Verified Pro'}
            </span>
            <h2 className="text-xl font-heading font-bold text-[#E4ECEC] leading-tight">
              {tr(category.id)}
            </h2>
            <p className="text-xs text-[#8E9EA2] mt-0.5 line-clamp-1">
              {category.description}
            </p>
          </div>
        </div>

        {/* Scrollable Sub-services List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#8E9EA2]">
            Available Specialized Services:
          </p>

          <div className="space-y-2.5">
            {category.subServices && category.subServices.map((sub) => (
              <div
                key={sub.id}
                onClick={() => handleSubServiceClick(sub)}
                className="p-3 rounded-2xl bg-[#182024] hover:bg-[#1D282D] border border-white/[0.08] hover:border-white/[0.18] transition-all flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={sub.image}
                  alt={sub.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#E4ECEC] group-hover:text-white truncate">
                      {tr(sub.name)}
                    </h4>
                    <span className="text-[11px] font-mono text-[#F59E0B] font-semibold shrink-0">
                      ₹{sub.startingPrice}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8E9EA2] line-clamp-2 mt-0.5 leading-snug">
                    {sub.desc}
                  </p>
                </div>

                <div className="w-7 h-7 rounded-full bg-white/[0.04] group-hover:bg-white/[0.12] flex items-center justify-center shrink-0 text-[#8E9EA2] group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0C1012]/80 flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewAll}
            className="flex-1 py-3 px-4 rounded-xl bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <span>View All Nearby Providers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
