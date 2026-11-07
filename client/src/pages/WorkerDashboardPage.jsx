import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  User,
  Package,
  MessageSquare,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  TrendingUp,
  MapPin,
  Phone,
  Send,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Calendar,
  Mic,
  ArrowRight,
} from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import ShiftSelectorModal from '../components/ShiftSelectorModal';
import { AVAILABLE_SHIFTS, getShiftRemainingTime } from '../utils/shifts';

export default function WorkerDashboardPage() {
  const {
    t,
    workerUser,
    logoutWorkerUser,
    updateWorkerAvailability,
    updateWorkerShift,
  } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active section tab: 'overview', 'profile', 'listings', 'enquiries', 'edit-profile', 'shifts'
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Worker profile & stats data
  const [dashboardData, setDashboardData] = useState(null);
  const [listings, setListings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Automatically pop open ShiftSelectorModal when requested by Voice or URL
  useEffect(() => {
    if (searchParams.get('modal') === 'shift') {
      setShowShiftModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleVoiceShiftModal = () => {
      setShowShiftModal(true);
    };
    window.addEventListener('comsity:voice:shiftsModal', handleVoiceShiftModal);
    return () => window.removeEventListener('comsity:voice:shiftsModal', handleVoiceShiftModal);
  }, []);

  // Synchronize voice tab change command immediately in visual UI
  useEffect(() => {
    const handleVoiceTab = (e) => {
      if (e.detail?.tab) {
        setSearchParams({ tab: e.detail.tab });
      }
    };
    window.addEventListener('comsity:worker:tab', handleVoiceTab);
    return () => window.removeEventListener('comsity:worker:tab', handleVoiceTab);
  }, [setSearchParams]);

  // New Listing Modal state
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    category: workerUser?.category || 'Electrician',
    description: '',
    price: '',
    listingType: 'service',
    image: '',
  });
  const [listingSubmitting, setListingSubmitting] = useState(false);

  // Edit Profile form state
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    phone: '',
    category: '',
    description: '',
    locality: '',
    startingPrice: '',
    serviceRadius: 5,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    if (workerUser?._id) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [workerUser]);

  // Synchronize voice availability command immediately in visual UI
  useEffect(() => {
    const handleVoiceAvail = (e) => {
      if (e.detail && typeof e.detail.isAvailable === 'boolean') {
        const newStatus = e.detail.isAvailable;
        setDashboardData((prev) => ({
          ...prev,
          worker: { ...(prev?.worker || workerUser || {}), isAvailable: newStatus },
          stats: { ...(prev?.stats || {}), isAvailable: newStatus },
        }));
      }
    };
    window.addEventListener('comsity:voice:availability', handleVoiceAvail);
    return () => window.removeEventListener('comsity:voice:availability', handleVoiceAvail);
  }, [workerUser]);

  const loadDashboardData = async () => {
    if (!workerUser?._id) return;
    setLoading(true);
    try {
      // 1. Fetch dashboard metrics
      const res = await fetch(`/api/workers/${workerUser._id}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
        setEditProfileForm({
          name: data.data.worker.name,
          phone: data.data.worker.phone,
          category: data.data.worker.category,
          description: data.data.worker.description || '',
          locality: data.data.worker.locality,
          startingPrice: data.data.worker.startingPrice || '',
          serviceRadius: data.data.worker.serviceRadius || 5,
        });
      }

      // 2. Fetch listings
      const lRes = await fetch(`/api/listings/worker/${workerUser._id}`);
      const lData = await lRes.json();
      if (lData.success) {
        setListings(lData.data);
      }

      // 3. Fetch enquiries
      const eRes = await fetch(`/api/enquiries/worker/${workerUser._id}`);
      const eData = await eRes.json();
      if (eData.success) {
        setEnquiries(eData.data);
      }
    } catch (err) {
      console.error('Failed to load worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    const current = dashboardData?.worker?.isAvailable ?? workerUser?.isAvailable ?? true;
    const newStatus = !current;
    
    // 1. Instant optimistic state flip so button and badges change with zero lag
    setDashboardData((prev) => ({
      ...prev,
      worker: { ...(prev?.worker || workerUser || {}), isAvailable: newStatus },
      stats: { ...(prev?.stats || {}), isAvailable: newStatus },
    }));

    // 2. Synchronize to AppContext & Backend API
    await updateWorkerAvailability(newStatus);
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!newListing.title || !newListing.category) return;

    setListingSubmitting(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: workerUser._id,
          title: newListing.title,
          category: newListing.category,
          description: newListing.description,
          price: newListing.price ? Number(newListing.price) : null,
          listingType: newListing.listingType,
          image: newListing.image,
          locality: dashboardData?.worker?.locality || workerUser.locality,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setListings([data.data, ...listings]);
        setShowAddListingModal(false);
        setNewListing({
          title: '',
          category: workerUser.category,
          description: '',
          price: '',
          listingType: 'service',
          image: '',
        });
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to create listing:', err);
    } finally {
      setListingSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setListings(listings.filter((l) => l._id !== listingId));
        loadDashboardData();
      }
    } catch (err) {
      console.error('Delete listing error:', err);
    }
  };

  const handleMarkEnquiryReplied = async (enquiryId) => {
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'replied' }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(
          enquiries.map((e) => (e._id === enquiryId ? { ...e, status: 'replied' } : e))
        );
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');

    try {
      const res = await fetch(`/api/workers/${workerUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileForm),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMessage('Profile updated and published successfully!');
        loadDashboardData();
      } else {
        setProfileMessage(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileMessage('Error updating profile. Check connection.');
    } finally {
      setProfileSaving(false);
    }
  };

  const worker = dashboardData?.worker || workerUser || {
    name: 'Partner Operations',
    category: 'Local Services',
    locality: 'Hyderabad',
  };
  const stats = dashboardData?.stats || {
    profileCompletion: workerUser ? 80 : 0,
    isAvailable: workerUser?.isAvailable ?? false,
    viewsCount: workerUser?.viewsCount || 0,
    enquiriesCount: enquiries.length,
    unreadEnquiriesCount: enquiries.filter((e) => e.status === 'unread').length,
    listingsCount: listings.length,
  };

  const isAvailable = Boolean(workerUser?.isAvailable);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    workerUser?.name || 'Partner'
  )}&background=16834A&color=fff&size=200&bold=true`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#E0EBE9]">
      
      {/* Top Banner with Worker Status */}
      <div className="glass-panel rounded-3xl p-6 border border-white/[0.1] shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={workerUser?.profileImage || defaultAvatar}
            alt={workerUser?.name || 'Partner'}
            className="w-16 h-16 rounded-2xl object-cover border border-white/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E0EBE9]">
                {workerUser?.name || 'Partner Operations'}
              </h1>
              {!workerUser ? (
                <Link
                  to="/login"
                  className="text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#F59E0B] border border-amber-500/40 font-bold uppercase hover:bg-amber-500/30 transition-colors"
                >
                  Login Required
                </Link>
              ) : workerUser?.isDemo ? (
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                  Demo
                </span>
              ) : null}
            </div>
            <p className="text-xs text-[#8E9EA2] mt-0.5">
              {workerUser ? `${workerUser.category} • ${workerUser.locality || 'Hyderabad'}` : 'Manage Shifts, Services & Customer Enquiries'}
            </p>
          </div>
        </div>

        {/* Action Controls: Shift Selector, Availability & Phone App View */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Active Shift Selector Badge */}
          <div className="flex items-center gap-2.5 bg-white/[0.04] p-2 rounded-2xl border border-white/[0.08]">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-slate-200 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-xs">
              <span className="text-[#8E9EA2] block text-[10px] font-medium">Work Shift:</span>
              <span className="font-semibold text-slate-200 block truncate max-w-[170px]">
                {worker?.activeShift?.name || 'Full Day (9 AM – 8 PM)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowShiftModal(true)}
              className="px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.14] text-[#E0EBE9] border border-white/10 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.04] p-2.5 rounded-2xl border border-white/[0.08]">
            <div className="text-xs">
              <span className="text-[#8E9EA2] block text-[10px] font-medium">Availability:</span>
              <span
                className={`font-semibold flex items-center gap-1.5 ${
                  isAvailable ? 'text-[#34D399]' : 'text-[#F59E0B]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#34D399] animate-pulse' : 'bg-[#F59E0B]'}`} />
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                isAvailable
                  ? 'bg-slate-200 hover:bg-white text-[#0B0F10]'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-[#F59E0B] border border-amber-500/40'
              }`}
            >
              {isAvailable ? 'Set Busy' : 'Set Available'}
            </button>
          </div>

          {/* Partner Mic Button (Laptop / Desktop View - ONLY on Partner site) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('comsity:voice:openModal'))}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-2 rounded-2xl text-xs font-bold text-[#F59E0B] transition-all cursor-pointer shadow-xs active:scale-95"
            title="Partner Voice AI Assistant (Telugu / Hindi / English)"
          >
            <Mic className="w-4 h-4 text-[#F59E0B] animate-pulse" />
            <span>Mic</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Active Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-1">
          <div className="glass-panel rounded-2xl border border-white/[0.08] p-2 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'overview'
                  ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                  : 'text-[#8E9EA2] hover:text-[#E0EBE9] hover:bg-white/[0.04]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            {/* Work Shifts Tab */}
            <button
              onClick={() => setActiveTab('shifts')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'shifts'
                  ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                  : 'text-[#8E9EA2] hover:text-[#E0EBE9] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>Work Shifts</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-[#F59E0B] font-mono">
                {worker?.activeShift?.badge || 'Shift'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'listings'
                  ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                  : 'text-[#8E9EA2] hover:text-[#E0EBE9] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>My Services</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'listings' ? 'bg-[#0C1012]/20 text-[#0C1012]' : 'bg-white/[0.06] text-[#8E9EA2]'
              }`}>
                {listings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('enquiries')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'enquiries'
                  ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                  : 'text-[#8E9EA2] hover:text-[#E0EBE9] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Enquiries</span>
              </div>
              {stats.unreadEnquiriesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
                  {stats.unreadEnquiriesCount} new
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'profile'
                  ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                  : 'text-[#8E9EA2] hover:text-[#E0EBE9] hover:bg-white/[0.04]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Public Profile Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('edit-profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'edit-profile'
                  ? 'bg-slate-200 text-[#0B0F10] font-bold shadow-md'
                  : 'text-[#8E9EA2] hover:text-[#E0EBE9] hover:bg-white/[0.04]'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile & Voice</span>
            </button>

            <div className="pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  logoutWorkerUser();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="md:col-span-3 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Profile Completion */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-md space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">{t.worker.profileCompletion}</span>
                    <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-600 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4A340]" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-100">
                    {stats.profileCompletion}%
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.profileCompletion}%` }}
                    />
                  </div>
                </div>

                {/* Metric 2: Availability */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-md space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">{t.worker.availability}</span>
                    <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-600 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                  <div
                    className={`text-base font-bold flex items-center gap-2 ${
                      isAvailable ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span>{isAvailable ? 'Available Now' : 'Offline / Busy'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isAvailable ? 'Visible to nearby search' : 'Hidden from nearby searches'}
                  </p>
                </div>

                {/* Metric 3: Profile Views */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-md space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">{t.worker.views}</span>
                    <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-600 flex items-center justify-center">
                      <Eye className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-100">
                    {stats.viewsCount}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Neighborhood customer visits
                  </p>
                </div>

                {/* Metric 4: Enquiries */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-md space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">{t.worker.enquiries}</span>
                    <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-600 flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-100">
                    {stats.enquiriesCount}
                  </div>
                  <p className="text-[11px] text-slate-300 font-semibold">
                    {stats.unreadEnquiriesCount} unread
                  </p>
                </div>
              </div>

              {/* Recent Enquiries Box */}
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-100">
                    Recent Customer Enquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('enquiries')}
                    className="text-xs font-bold text-slate-300 hover:text-white hover:underline cursor-pointer"
                  >
                    View All ({enquiries.length}) →
                  </button>
                </div>

                {enquiries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3">
                    No customer enquiries yet. Customers who discover your profile will message you here!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {enquiries.slice(0, 3).map((enq) => (
                      <div
                        key={enq._id}
                        className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">
                              {enq.customerName}
                            </span>
                            <span className="text-xs text-slate-400">({enq.customerPhone})</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                enq.status === 'unread'
                                  ? 'bg-red-950/60 text-red-300 border border-red-800/80'
                                  : 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              {enq.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{enq.message}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`https://wa.me/${enq.customerPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                              `Hello ${enq.customerName}, I received your enquiry on KaamSetu!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleMarkEnquiryReplied(enq._id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${enq.customerPhone}`}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#E0EBE9] text-xs font-bold flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-300" />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Listings Preview */}
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-100">
                    Active Catalog Items ({listings.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="text-xs font-bold text-slate-300 hover:text-white hover:underline cursor-pointer"
                  >
                    Manage Listings →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listings.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-start justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-100">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.category}</p>
                      </div>
                      <span className="text-xs font-extrabold text-slate-100">
                        {item.price ? `₹${item.price}` : 'Quote'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY SERVICES / PRODUCTS */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              {!workerUser && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-amber-300">
                    <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
                    <span>
                      <strong>Login to your account first</strong> to add, publish, and manage your partner services.
                    </span>
                  </div>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-[#0C1012] font-bold text-xs shrink-0 transition-colors text-center"
                  >
                    Partner Login
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    My Services & Products
                  </h2>
                  <p className="text-xs text-slate-400">
                    Add specific repair jobs, services, or handcrafted products you sell
                  </p>
                </div>
                <button
                  onClick={() => setShowAddListingModal(true)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-white text-[#0B0F10] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.worker.addListing}</span>
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="bg-slate-800/80 rounded-3xl p-12 text-center border border-slate-700 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-700/60 border border-slate-600 flex items-center justify-center mx-auto text-slate-300">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-400">{t.worker.noListingsYet}</p>
                  <button
                    onClick={() => setShowAddListingModal(true)}
                    className="px-4 py-2 bg-slate-200 hover:bg-white text-[#0B0F10] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Create First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map((item) => (
                    <div
                      key={item._id}
                      className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-md flex flex-col justify-between"
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
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-200 border border-slate-600">
                            {item.listingType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-100">
                          {item.price ? `₹${item.price}` : 'Quote on request'}
                        </span>
                        <button
                          onClick={() => handleDeleteListing(item._id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMER ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Customer Enquiries</h2>
                <p className="text-xs text-slate-400">
                  Messages submitted by customers directly through your KaamSetu profile
                </p>
              </div>

              {enquiries.length === 0 ? (
                <div className="bg-slate-800/80 rounded-3xl p-12 text-center border border-slate-700 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-700/60 border border-slate-600 flex items-center justify-center mx-auto text-slate-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-400">No customer messages received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((enq) => (
                    <div
                      key={enq._id}
                      className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">
                            {enq.customerName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {enq.customerPhone}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              enq.status === 'unread'
                                ? 'bg-red-950/60 text-red-300 border border-red-800/80'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {enq.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                          {enq.message}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Received: {new Date(enq.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`https://wa.me/${enq.customerPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                            `Hello ${enq.customerName}, this is ${worker.name.split(' ')[0]} from KaamSetu regarding your enquiry.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleMarkEnquiryReplied(enq._id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-300" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${enq.customerPhone}`}
                          className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#E0EBE9] text-xs font-bold flex items-center gap-1.5"
                        >
                          <Phone className="w-4 h-4 text-slate-300" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PUBLIC PROFILE PREVIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Public Profile Preview</h2>
                  <p className="text-xs text-slate-400">
                    This is how customers see your profile on the marketplace
                  </p>
                </div>
                <Link
                  to={`/provider/${worker._id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white hover:underline"
                >
                  <span>Open Public URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-md space-y-6">
                <div className="flex items-center gap-4">
                  <img
                    src={worker.profileImage || defaultAvatar}
                    alt={worker.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-100">{worker.name}</h3>
                    <p className="text-xs text-slate-400">
                      {worker.category} • {worker.locality}, {worker.city}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-bold text-slate-200 bg-slate-700 px-2.5 py-0.5 rounded-full border border-slate-600">
                      {isAvailable ? 'Available Now' : 'Currently Unavailable'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase">Description</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {worker.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EDIT PROFILE */}
          {activeTab === 'edit-profile' && (
            <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-md space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Edit Worker Profile</h2>
                <p className="text-xs text-slate-400">
                  Update your contact, location, description, or voice details
                </p>
              </div>

              {profileMessage && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{profileMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editProfileForm.name}
                      onChange={(e) =>
                        setEditProfileForm({ ...editProfileForm, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-slate-100 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={editProfileForm.phone}
                      onChange={(e) =>
                        setEditProfileForm({ ...editProfileForm, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-slate-100 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">
                      Description of Services
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Use microphone to speak in Telugu, Hindi or English
                    </span>
                  </div>

                  <VoiceInput
                    onTranscript={(txt) =>
                      setEditProfileForm((prev) => ({
                        ...prev,
                        description: prev.description ? `${prev.description} ${txt}` : txt,
                      }))
                    }
                  />

                  <textarea
                    rows={4}
                    value={editProfileForm.description}
                    onChange={(e) =>
                      setEditProfileForm({ ...editProfileForm, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-slate-100 rounded-xl text-sm placeholder:text-slate-500 mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Locality
                    </label>
                    <input
                      type="text"
                      value={editProfileForm.locality}
                      onChange={(e) =>
                        setEditProfileForm({ ...editProfileForm, locality: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-slate-100 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Starting Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editProfileForm.startingPrice}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          startingPrice: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-slate-100 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {profileSaving ? 'Saving...' : 'Save & Publish Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB: WORK SHIFTS & HOURS */}
          {activeTab === 'shifts' && (
            <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-md space-y-6">
              {!workerUser && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-amber-300">
                    <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
                    <span>
                      <strong>Login to your account first</strong> to activate dynamic work shifts and start taking customer bookings.
                    </span>
                  </div>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-[#0C1012] font-bold text-xs shrink-0 transition-colors text-center"
                  >
                    Partner Login
                  </Link>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
                <div>
                  <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#F4A340]" />
                    <span>Work Shifts & Availability Schedule</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select your working shift so nearby customers know when you are actively on duty
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowShiftModal(true)}
                  className="px-4 py-2 bg-slate-200 hover:bg-white text-[#0B0F10] text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Choose Shift</span>
                </button>
              </div>

              {/* Current Active Shift Card */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Active Assigned Shift
                  </span>
                  <h4 className="text-xl font-black text-slate-100">
                    {worker?.activeShift?.name || 'Full Day Shift (9:00 AM – 8:00 PM)'}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <span>
                      Hours: {worker?.activeShift?.startTime || '09:00 AM'} to {worker?.activeShift?.endTime || '08:00 PM'}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-slate-300">
                      ● {isAvailable ? 'Shift is Active' : 'Currently Paused'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus = !isAvailable;
                      updateWorkerAvailability(nextStatus);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                      isAvailable ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                    }`}
                  >
                    {isAvailable ? 'Pause Shift' : 'Resume Shift'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShiftModal(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Change Shift
                  </button>
                </div>
              </div>

              {/* Grid of All Available Shifts */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-100">
                  Select or Switch Your Shift
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_SHIFTS.map((shift) => {
                    const isSelected = worker?.activeShift?.id === shift.id;
                    return (
                      <div
                        key={shift.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? 'border-slate-400 bg-slate-800 ring-2 ring-slate-400/30'
                            : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                shift.category === 'hourly'
                                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                                  : 'bg-slate-700 text-slate-200 border border-slate-600'
                              }`}
                            >
                              {shift.badge}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-slate-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active
                              </span>
                            )}
                          </div>
                          <h5 className="font-extrabold text-xs sm:text-sm text-slate-100">
                            {shift.name}
                          </h5>
                          <p className="text-[11px] text-slate-400">
                            {shift.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            const now = new Date();
                            const shiftData = {
                              id: shift.id,
                              name: shift.name,
                              startTime: shift.startTime || 'Now',
                              endTime: shift.endTime || `+${shift.durationHours}h`,
                              durationHours: shift.durationHours,
                              startedAt: now.toISOString(),
                              endsAt: new Date(
                                now.getTime() + shift.durationHours * 3600 * 1000
                              ).toISOString(),
                            };
                            await updateWorkerShift(shiftData);
                            if (dashboardData) {
                              setDashboardData({
                                ...dashboardData,
                                worker: {
                                  ...dashboardData.worker,
                                  activeShift: shiftData,
                                  isAvailable: true,
                                },
                              });
                            }
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-200 text-[#0B0F10] shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isSelected ? 'Currently Selected Shift' : 'Switch to this Shift'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add New Service / Product Listing */}
      {showAddListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm cursor-pointer" onClick={() => setShowAddListingModal(false)}>
          <div className="bg-[#182124] border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 text-slate-100 cursor-default" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-100">
              Add New Service or Product
            </h3>

            <form onSubmit={handleCreateListing} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                  placeholder="e.g. Switchboard Wiring or Handmade Clay Pot"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Listing Type
                  </label>
                  <select
                    value={newListing.listingType}
                    onChange={(e) =>
                      setNewListing({ ...newListing, listingType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs font-bold text-slate-100"
                  >
                    <option value="service">Service (Work / Labour)</option>
                    <option value="product">Product (Physical Good)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newListing.price}
                    onChange={(e) =>
                      setNewListing({ ...newListing, price: e.target.value })
                    }
                    placeholder="e.g. 350"
                    className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newListing.description}
                  onChange={(e) =>
                    setNewListing({ ...newListing, description: e.target.value })
                  }
                  placeholder="Details of what is included or material specifications..."
                  className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Optional Product Image URL
                </label>
                <input
                  type="url"
                  value={newListing.image}
                  onChange={(e) =>
                    setNewListing({ ...newListing, image: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddListingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={listingSubmitting}
                  className="px-5 py-2 bg-slate-200 hover:bg-white text-[#0B0F10] text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {listingSubmitting ? 'Saving...' : 'Add Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Shift Selector */}
      <ShiftSelectorModal
        isOpen={showShiftModal}
        onClose={() => {
          setShowShiftModal(false);
          if (searchParams.get('modal') === 'shift') {
            setSearchParams({ tab: 'shifts' });
          }
        }}
        activeShift={worker?.activeShift}
        onSelectShift={async (shiftData) => {
          await updateWorkerShift(shiftData);
          if (dashboardData) {
            setDashboardData({
              ...dashboardData,
              worker: {
                ...dashboardData.worker,
                activeShift: shiftData,
                isAvailable: true,
              },
            });
          }
        }}
      />
    </div>
  );
}
