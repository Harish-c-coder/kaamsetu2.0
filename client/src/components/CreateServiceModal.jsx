import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  X,
  PlusCircle,
  Search,
  Briefcase,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function CreateServiceModal({ isOpen, onClose }) {
  const { workerUser } = useApp();
  const navigate = useNavigate();
  const [customSearch, setCustomSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoToWorkerRegister = () => {
    onClose();
    if (workerUser?._id) {
      navigate('/worker/dashboard?tab=listings');
    } else {
      navigate('/worker/register');
    }
  };

  const handleCustomSearchSubmit = (e) => {
    e.preventDefault();
    if (customSearch.trim()) {
      onClose();
      navigate(`/customer/home?q=${encodeURIComponent(customSearch.trim())}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[#13191C] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-white/10 space-y-5 text-[#E0EBE9] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#8E9EA2] hover:text-white rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-slate-200 border border-white/[0.08] flex items-center justify-center">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#E0EBE9]">
              Create Your Own Service
            </h3>
            <p className="text-xs text-[#8E9EA2] mt-0.5">
              Offer a specialized craft or search custom neighborhood services
            </p>
          </div>
        </div>

        {/* Option 1: Worker - Create & Publish Your Service */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>For Workers, Artisans & Vendors</span>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-base text-[#E0EBE9]">
              Publish Your Custom Trade or Craft
            </h4>
            <p className="text-xs text-[#8E9EA2] mt-1 leading-relaxed">
              Don't see your specific skill in the preset list? Create your custom service profile with an affordable 5% platform fee and receive direct calls & WhatsApp messages from nearby customers.
            </p>
          </div>
          <button
            onClick={handleGoToWorkerRegister}
            className="w-full py-2.5 px-4 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-xs rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{workerUser ? 'Add Custom Service to Catalog' : 'Register Custom Service Profile'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-[#13191C] px-3 text-[11px] text-[#8E9EA2] font-mono uppercase">
            OR
          </span>
        </div>

        {/* Option 2: Customer - Custom Query Search */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase tracking-wider">
            <Search className="w-4 h-4" />
            <span>For Customers Looking for Custom Help</span>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-base text-[#E0EBE9]">
              Search for Custom Specialties
            </h4>
            <p className="text-xs text-[#8E9EA2] mt-1 leading-relaxed">
              Search by exact keywords (e.g. "clay terracotta potter", "antique furniture polish", "rooftop solar repair").
            </p>
          </div>
          <form onSubmit={handleCustomSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="e.g. Brass metal polisher"
              className="flex-1 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-full text-xs text-[#E0EBE9] placeholder-[#8E9EA2]/60 focus:outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-[#E0EBE9] font-bold text-xs rounded-full border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
