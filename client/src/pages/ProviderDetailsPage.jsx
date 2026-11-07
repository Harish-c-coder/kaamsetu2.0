import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Eye,
  ShieldCheck,
  Send,
  Package,
  Wrench,
  AlertCircle,
  Share2,
} from 'lucide-react';

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const { t } = useApp();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    customerName: '',
    customerPhone: '',
    message: '',
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  useEffect(() => {
    fetchProviderDetails();
  }, [id]);

  const fetchProviderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workers/${id}`);
      const data = await res.json();
      if (data.success) {
        setProvider(data.data);
      } else {
        setError(data.message || 'Provider not found');
      }
    } catch (err) {
      console.error('Error fetching provider:', err);
      setError('Unable to load provider details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryForm.customerName || !enquiryForm.customerPhone || !enquiryForm.message) {
      setEnquiryError('Please fill in your name, phone number, and message.');
      return;
    }

    setEnquirySubmitting(true);
    setEnquiryError('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: id,
          customerName: enquiryForm.customerName,
          customerPhone: enquiryForm.customerPhone,
          message: enquiryForm.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquirySuccess(true);
        setEnquiryForm({ customerName: '', customerPhone: '', message: '' });
      } else {
        setEnquiryError(data.message || 'Failed to submit enquiry');
      }
    } catch (err) {
      setEnquiryError('Could not send enquiry. Please try calling or messaging directly on WhatsApp.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-800/60 rounded-3xl animate-pulse border border-slate-700 shadow-md mb-8" />
        <div className="h-96 bg-slate-800/60 rounded-3xl animate-pulse border border-slate-700 shadow-md" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">{error || 'Provider not found'}</h2>
        <Link
          to="/customer/home"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 text-[#0B0F10] text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </Link>
      </div>
    );
  }

  const cleanPhone = (provider.phone || '').replace(/[^\d]/g, '');
  const prefilledMsg = encodeURIComponent(
    `Hello ${provider.name.split(' ')[0]}, I saw your profile on KaamSetu. I would like to enquire about your service.`
  );
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${prefilledMsg}`;
  const callUrl = `tel:${provider.phone}`;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    provider.name
  )}&background=334155&color=fff&size=200&bold=true`;

  const listings = provider.listings || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#E0EBE9]">
      
      {/* Back Button */}
      <div>
        <Link
          to="/customer/home"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Providers</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-700">
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={provider.profileImage || defaultAvatar}
                alt={provider.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-slate-700 shadow-sm"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
              <span
                className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-slate-800 ${
                  provider.isAvailable ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
                title={provider.isAvailable ? t.card.available : t.card.unavailable}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                  {provider.name}
                </h1>
                {provider.isDemo && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/80 uppercase">
                    Demo Profile
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-200 bg-slate-700 px-3 py-1 rounded-full border border-slate-600">
                  {provider.category}
                </span>
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    provider.isAvailable ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {provider.isAvailable ? t.card.available : t.card.unavailable}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{provider.viewsCount || 1} views</span>
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="text-left sm:text-right bg-slate-900/70 p-4 rounded-2xl border border-slate-700 min-w-[160px]">
            <span className="text-xs text-slate-400 font-medium block">
              {t.card.startingFrom}
            </span>
            <span className="text-2xl font-extrabold text-slate-100">
              {provider.startingPrice ? `₹${provider.startingPrice}` : 'Negotiable'}
            </span>
            <span className="text-[11px] text-emerald-400 block font-semibold mt-0.5">
              Direct & Transparent Pricing
            </span>
          </div>
        </div>

        {/* Location & Quick Details Row */}
        <div className="py-4 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#F4A340]" />
            <span className="font-bold text-slate-100">
              {provider.locality}, {provider.city || 'Hyderabad'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-slate-400" />
            <span>Service Radius: <strong className="text-slate-200">{provider.serviceRadius || 5} km</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <span>Preferred Language: <strong className="text-slate-200">{provider.language || 'Telugu / English'}</strong></span>
          </div>
        </div>

        {/* Action Buttons: WhatsApp & Call */}
        <div className="pt-4 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold text-sm shadow-sm transition-all text-center"
          >
            <MessageSquare className="w-5 h-5 text-slate-300" />
            <span>Chat Directly on WhatsApp</span>
          </a>

          <a
            href={callUrl}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#E0EBE9] font-bold text-sm shadow-sm transition-all text-center"
          >
            <Phone className="w-5 h-5 text-slate-300" />
            <span>Call Now ({provider.phone})</span>
          </a>
        </div>
      </div>

      {/* Grid: Left Column (About & Catalog) | Right Column (Direct Enquiry Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Details & Listings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Section */}
          <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-7 border border-slate-700 shadow-md space-y-3">
            <h2 className="text-lg font-bold text-slate-100">About the Provider</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {provider.description ||
                'Dedicated local worker offering reliable services with fair pricing and no platform markups.'}
            </p>
          </div>

          {/* Services & Products Catalog */}
          <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-7 border border-slate-700 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Services & Products</h2>
                <p className="text-xs text-slate-400">Available directly from {provider.name.split(' ')[0]}</p>
              </div>
              <span className="text-xs font-bold text-slate-200 bg-slate-700 border border-slate-600 px-2.5 py-1 rounded-full">
                {listings.length} Available
              </span>
            </div>

            {listings.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">
                No specific items listed yet. Contact the worker directly to request custom work!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {listings.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-36 rounded-xl object-cover mb-3 border border-slate-700"
                        />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-100">{item.title}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-200 border border-slate-600 shrink-0">
                          {item.listingType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">
                        {item.price ? `₹${item.price}` : 'Quote on request'}
                      </span>
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hello, I would like to inquire about "${item.title}" on KaamSetu.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-slate-300 hover:text-white hover:underline"
                      >
                        Enquire on WhatsApp →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Direct Enquiry Form */}
        <div className="space-y-6">
          <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-7 border border-slate-700 shadow-md space-y-4 sticky top-24">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                <Send className="w-3.5 h-3.5" />
                <span>Quick Message</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{t.enquiry.sendTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Leave a message and your phone number. The worker will receive it on their dashboard!
              </p>
            </div>

            {enquirySuccess ? (
              <div className="bg-slate-900/80 border border-slate-700 text-slate-200 p-4 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Enquiry Sent!</span>
                </div>
                <p>{t.enquiry.successMsg}</p>
                <button
                  onClick={() => setEnquirySuccess(false)}
                  className="mt-2 text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                {enquiryError && (
                  <div className="text-xs text-red-300 bg-red-950/60 p-2.5 rounded-xl border border-red-800">
                    {enquiryError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.enquiry.nameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.customerName}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, customerName: e.target.value })
                    }
                    placeholder="e.g. Anand Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.enquiry.phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.customerPhone}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, customerPhone: e.target.value })
                    }
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.enquiry.messageLabel} *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, message: e.target.value })
                    }
                    placeholder="Describe your work requirement, location, or timing..."
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enquirySubmitting}
                  className="w-full py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{enquirySubmitting ? 'Sending...' : t.enquiry.sendButton}</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-slate-700 text-[11px] text-slate-400 text-center">
              Direct peer-to-peer booking with zero hidden charges.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
