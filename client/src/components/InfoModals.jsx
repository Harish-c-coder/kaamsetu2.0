import React, { useEffect } from 'react';
import { X, ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function InfoModals({ activeModal, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[#13191C] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/10 text-[#E0EBE9] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#8E9EA2] hover:text-white rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {activeModal === 'about' && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-2xl bg-white/[0.04] text-slate-200 border border-white/[0.08]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#E0EBE9]">About KaamSetu</h3>
            </div>
            <div className="space-y-3.5 text-[#8E9EA2] text-sm leading-relaxed">
              <p>
                <strong className="text-[#E0EBE9]">KaamSetu</strong> is a hyperlocal initiative engineered to dismantle the exorbitant 25% to 35% commission walls of large aggregators, offering a transparent, low 5% platform fee.
              </p>
              <p>
                Local Indian handloom weavers, clay potters, street vendors, and skilled repair technicians receive transparent pricing and direct connections. KaamSetu gives them an instant, mobile-first presence where nearby customers can reach them directly via WhatsApp or phone.
              </p>
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                <h4 className="font-semibold text-[#E0EBE9] mb-1">Our Core Pillars:</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#8E9EA2]">
                  <li><strong className="text-[#E0EBE9]">Low 5% Platform Fee:</strong> Only 5% commission, leaving 95% of earnings directly with the worker.</li>
                  <li><strong className="text-[#E0EBE9]">Direct Communication:</strong> Customers chat and call workers directly.</li>
                  <li><strong className="text-[#E0EBE9]">Indian Language Inclusivity:</strong> Voice typing and native support for Telugu, Hindi, and English.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'contact' && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-2xl bg-white/[0.04] text-[#F59E0B] border border-white/[0.08]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#E0EBE9]">Contact & Support</h3>
            </div>
            <div className="space-y-4 text-[#8E9EA2] text-sm">
              <p>
                Have questions, suggestions, or want to partner for local community onboarding in Telangana or other states? Reach out to our project team:
              </p>
              <div className="space-y-2.5 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06] text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-[#E0EBE9]">
                  <Mail className="w-4 h-4 text-slate-300" />
                  <span>support@kaamsetu.in</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#E0EBE9]">
                  <Phone className="w-4 h-4 text-slate-300" />
                  <span>Helpline: +91 40 2345 6789 (Hyderabad)</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#E0EBE9]">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  <span>Hyderabad, Telangana, India</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModal === 'privacy' && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-2xl bg-white/[0.04] text-cyan-400 border border-white/[0.08]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#E0EBE9]">Privacy Policy & Disclosure</h3>
            </div>
            <div className="space-y-3 text-[#8E9EA2] text-xs leading-relaxed">
              <p>
                <strong className="text-[#E0EBE9]">Public Worker Profile Disclosure:</strong> As an open hyperlocal marketplace, service providers publish their trade name, business category, service locality, and commercial contact telephone number so nearby neighborhood customers can call or WhatsApp them directly.
              </p>
              <p>
                <strong className="text-[#E0EBE9]">Customer Data Privacy:</strong> Customer GPS coordinates are handled strictly on the client browser session for radius filtering and are never sold or tracked across external ad networks.
              </p>
            </div>
          </div>
        )}

        {activeModal === 'terms' && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-2xl bg-white/[0.04] text-purple-400 border border-white/[0.08]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#E0EBE9]">Terms of Service</h3>
            </div>
            <div className="space-y-3 text-[#8E9EA2] text-xs leading-relaxed">
              <p>
                1. <strong className="text-[#E0EBE9]">Direct Mutual Engagement:</strong> KaamSetu acts solely as an open directory to connect customers and local providers directly without middleman markups.
              </p>
              <p>
                2. <strong className="text-[#E0EBE9]">Work & Fair Payment:</strong> Customers and workers agree on pricing, timelines, and safety standards directly between themselves.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-[#E0EBE9] rounded-full font-semibold text-xs transition-colors cursor-pointer border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
