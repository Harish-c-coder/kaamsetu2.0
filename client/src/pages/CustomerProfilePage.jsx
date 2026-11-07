import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Users,
  MapPin,
  Phone,
  MessageCircle,
  Bookmark,
  Clock,
  LogOut,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Map,
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
  CalendarCheck,
} from 'lucide-react';
import LocalityMapModal from '../components/LocalityMapModal';

export default function CustomerProfilePage() {
  const { customerUser, logoutCustomerUser, updateCustomerUser } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(
    tabParam === 'saved' || tabParam === 'edit' ? tabParam : 'bookings'
  );

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) {
      setActiveTabState(t === 'saved' || t === 'edit' ? t : 'bookings');
    }
  }, [searchParams]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };
  const [savedWorkerDetails, setSavedWorkerDetails] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [editName, setEditName] = useState(customerUser?.name || '');
  const [editLocality, setEditLocality] = useState(customerUser?.locality || 'Kukatpally');
  const [showMapModal, setShowMapModal] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!customerUser?._id) {
      navigate('/customer/login');
      return;
    }
    loadSavedWorkers();
  }, [customerUser]);

  const loadSavedWorkers = async () => {
    const savedIds = customerUser?.savedWorkers || [];
    if (savedIds.length === 0) {
      setSavedWorkerDetails([]);
      return;
    }

    setLoadingSaved(true);
    try {
      const results = await Promise.all(
        savedIds.map(async (wid) => {
          try {
            const res = await fetch(`/api/workers/${wid}`);
            const data = await res.json();
            return data.success ? data.data : null;
          } catch {
            return null;
          }
        })
      );
      setSavedWorkerDetails(results.filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaveMsg('');

    try {
      const res = await fetch(`/api/auth/customer/${customerUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          locality: editLocality,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateCustomerUser(data.data);
        setSaveMsg('Profile saved successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      setSaveMsg('Failed to update profile.');
    }
  };

  const handleLogout = () => {
    logoutCustomerUser();
    navigate('/');
  };

  const contactHistory = customerUser?.contactHistory || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 text-[#E0EBE9]">
      
      {/* Top Profile Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] text-[#34D399] border border-white/[0.08] flex items-center justify-center font-heading font-extrabold text-2xl shadow-md">
            {customerUser?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E0EBE9]">
                {customerUser?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#34D399] text-[10px] font-mono tracking-wider border border-[#34D399]/30 uppercase">
                Customer
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#8E9EA2] mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                {customerUser?.locality}, Hyderabad
              </span>
              <span>•</span>
              <span className="font-mono">{customerUser?.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/customer/home"
            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 hover:bg-white text-[#0B0F10] text-xs font-bold rounded-full shadow-lg shadow-black/40 transition-all flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Find Services</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 border border-white/10 hover:border-red-400 text-[#8E9EA2] hover:text-red-400 text-xs font-semibold rounded-full hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
            activeTab === 'bookings' || activeTab === 'history'
              ? 'bg-slate-200 text-[#0C1012] border-white shadow-sm font-bold'
              : 'bg-white/[0.04] text-[#8E9EA2] border-white/[0.08] hover:text-white'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5 text-[#34D399]" />
          <span>My Bookings ({contactHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
            activeTab === 'saved'
              ? 'bg-slate-200 text-[#0C1012] border-white shadow-sm font-bold'
              : 'bg-white/[0.04] text-[#8E9EA2] border-white/[0.08] hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Saved Workers ({savedWorkerDetails.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
            activeTab === 'edit'
              ? 'bg-slate-200 text-[#0C1012] border-white shadow-sm font-bold'
              : 'bg-white/[0.04] text-[#8E9EA2] border-white/[0.08] hover:text-white'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* TAB 1: SAVED WORKERS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {loadingSaved ? (
            <div className="p-8 text-center text-xs text-[#8E9EA2]">
              Loading your saved local workers...
            </div>
          ) : savedWorkerDetails.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-white/[0.08] space-y-3">
              <div className="w-14 h-14 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center text-[#F59E0B] mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-[#E0EBE9]">No Saved Workers Yet</h3>
              <p className="text-xs text-[#8E9EA2] max-w-sm mx-auto">
                Whenever you discover trusted electricians, plumbers, or artisans you like, bookmark them to quickly find them later.
              </p>
              <Link
                to="/customer/home"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-xs rounded-full shadow-lg transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Explore Local Workers</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedWorkerDetails.map((w) => (
                <div
                  key={w._id}
                  className="glass-panel rounded-2xl p-4 border border-white/[0.08] hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        w.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          w.name
                        )}&background=182124&color=E0EBE9&size=100`
                      }
                      alt={w.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-[#E0EBE9]">{w.name}</h4>
                      <span className="text-[11px] font-medium text-slate-300">
                        {w.category}
                      </span>
                      <div className="text-[10px] text-[#8E9EA2] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#F59E0B]" />
                        <span>{w.locality}, Hyderabad</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06]">
                    <a
                      href={`https://wa.me/${(w.phone || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 font-semibold text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${w.phone}`}
                      className="py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#E0EBE9] font-semibold text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: MY BOOKINGS */}
      {(activeTab === 'bookings' || activeTab === 'history') && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#E0EBE9] tracking-tight">
                My Service Bookings & Enquiries
              </h3>
              <p className="text-xs text-[#8E9EA2] mt-0.5">
                Direct WhatsApp chats and phone calls initiated with verified neighborhood pros.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              {contactHistory.length} Bookings
            </span>
          </div>

          {contactHistory.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#34D399] mx-auto shadow-inner">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-[#E0EBE9]">No Bookings Yet</h4>
                <p className="text-xs text-[#8E9EA2] max-w-sm mx-auto mt-1">
                  When you call or WhatsApp local electricians, plumbers, or beauticians, your bookings appear here automatically.
                </p>
              </div>
              <Link
                to="/customer/home"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold text-xs rounded-full shadow-lg transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find & Book Services</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contactHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-slate-800 border border-white/10 shrink-0">
                      {item.contactMethod === 'whatsapp' ? (
                        <MessageCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Phone className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#E0EBE9] font-bold text-sm">{item.workerName}</strong>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Direct Connected
                        </span>
                      </div>
                      <p className="text-xs text-[#8E9EA2] mt-0.5">
                        {item.workerCategory} • {item.contactMethod === 'whatsapp' ? 'WhatsApp Chat' : 'Phone Call'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="text-right mr-2 hidden sm:block">
                      <span className="font-mono text-xs text-[#E0EBE9] block font-semibold">{item.workerPhone}</span>
                      <span className="text-[10px] text-[#8E9EA2]">
                        {new Date(item.contactedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <a
                      href={`tel:${item.workerPhone}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-[#E0EBE9] flex items-center gap-1.5 transition-colors"
                      title="Call Worker"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Call Again</span>
                    </a>

                    <a
                      href={`https://wa.me/${item.workerPhone.replace(/[^\d]/g, '')}?text=Hello%20${encodeURIComponent(item.workerName)},%20I%20would%20like%20to%20follow%20up%20on%20my%20service%20booking.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition-colors"
                      title="WhatsApp Worker"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EDIT ACCOUNT */}
      {activeTab === 'edit' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] max-w-lg space-y-4">
          <h3 className="font-heading font-semibold text-base text-[#E0EBE9]">Update Profile Details</h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#8E9EA2] uppercase block mb-1">Your Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs sm:text-sm font-medium text-[#E0EBE9] focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#8E9EA2] uppercase">Home Locality</label>
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="text-[11px] text-slate-300 font-semibold hover:underline flex items-center gap-1"
                >
                  <Map className="w-3 h-3 text-[#F59E0B]" />
                  <span>Choose from Map</span>
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={`${editLocality}, Hyderabad`}
                className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-xs sm:text-sm font-medium text-[#8E9EA2]"
              />
            </div>

            {saveMsg && (
              <div className="text-xs font-semibold text-slate-200 text-center">{saveMsg}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-200 hover:bg-white text-[#0B0F10] font-bold rounded-full text-xs shadow-lg transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Locality Map Modal */}
      <LocalityMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        currentLocality={editLocality}
        onSelectLocality={(locName) => {
          setEditLocality(locName);
          setShowMapModal(false);
        }}
      />
    </div>
  );
}
