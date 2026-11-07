import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  MapPin,
  Compass,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  Map,
  PlusCircle,
} from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import LocalityMapModal from '../components/LocalityMapModal';
import PhoneCountryInput from '../components/PhoneCountryInput';
import StrongPasswordInput from '../components/StrongPasswordInput';
import { checkPasswordStrength } from '../utils/passwordStrength';
import { requestCurrentLocation } from '../utils/geoUtils';

const CATEGORIES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Vegetable Seller',
  'Potter',
  'Handloom Weaver',
  'Create Your Own Service',
];

const LOCALITIES = [
  'Kukatpally',
  'Ameerpet',
  'Banjara Hills',
  'Hitec City',
  'Charminar',
  'Secunderabad',
  'Dilsukhnagar',
  'Begumpet',
  'Other Area in Hyderabad',
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80',
];

export default function WorkerRegisterPage() {
  const { t, language, loginWorkerUser } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    category: 'Electrician',
    description: '',
    language: language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English',
    state: 'Telangana',
    city: 'Hyderabad',
    locality: 'Kukatpally',
    latitude: 17.3850,
    longitude: 78.4867,
    serviceRadius: 5,
    profileImage: AVATAR_PRESETS[0],
    startingPrice: '',
    isAvailable: true,
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [customCategory, setCustomCategory] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle voice speech transcription append
  const handleVoiceTranscript = (newText) => {
    setFormData((prev) => ({
      ...prev,
      description: prev.description ? `${prev.description} ${newText}` : newText,
    }));
  };

  // Browser Geolocation capture for worker shop/home
  const captureGpsLocation = async () => {
    setGpsLoading(true);
    setGpsStatus('Detecting precise coordinates...');

    try {
      const loc = await requestCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        latitude: loc.lat,
        longitude: loc.lng,
        locality: loc.localityName,
      }));
      setGpsStatus(`📍 ${loc.label} (Area set to ${loc.localityName})`);
    } catch (err) {
      setGpsStatus('Location unavailable. Please select your locality manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.locality) {
      setFormError('Please fill in your name and locality.');
      return;
    }

    if (formData.phone.length !== 10) {
      setFormError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (formData.password) {
      const strength = checkPasswordStrength(formData.password);
      if (!strength.isStrong) {
        setFormError('Please ensure your password meets all strong password criteria (8+ characters, uppercase, lowercase, number, and special character).');
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      ...formData,
      phone: `${countryCode}${formData.phone}`,
      category:
        formData.category === 'Create Your Own Service'
          ? (customCategory.trim() || 'Custom Artisan')
          : formData.category,
    };

    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage('Profile published successfully! Redirecting to your dashboard...');
        loginWorkerUser(data.data);
        setTimeout(() => {
          navigate('/worker/dashboard');
        }, 1200);
      } else {
        setFormError(data.message || 'Failed to save profile. Please check your details.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setFormError('Server unreachable. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-slate-200 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Free Digital Presence • 5% Fair Fee</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#E4ECEC]">
          Create Your Worker / Vendor Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#8E9EA2]">
          Join KaamSetu to connect with neighborhood customers with an affordable 5% commission.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#13191C] rounded-3xl p-6 sm:p-10 border border-white/[0.08] shadow-2xl space-y-6 text-[#E4ECEC]">
        
        {formError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Basic Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider pb-2 border-b border-white/[0.08] text-[#8E9EA2]">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <PhoneCountryInput
                  countryCode={countryCode}
                  onCountryChange={setCountryCode}
                  phone={formData.phone}
                  onPhoneChange={(val) => setFormData({ ...formData, phone: val })}
                  required={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  Profession or Business Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] focus:outline-none focus:border-amber-500/60 shadow-inner"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#13191C] text-[#E4ECEC]">
                      {cat}
                    </option>
                  ))}
                </select>

                {formData.category === 'Create Your Own Service' && (
                  <div className="mt-2.5 animate-in fade-in">
                    <label className="block text-[11px] font-bold text-[#F59E0B] uppercase mb-1">
                      Specify Your Custom Profession / Craft Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Sofa Cleaning, Key Maker, Mehndi Artist..."
                      className="w-full px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  Preferred Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] focus:outline-none focus:border-amber-500/60 shadow-inner"
                >
                  <option value="English" className="bg-[#13191C] text-[#E4ECEC]">English</option>
                  <option value="Telugu" className="bg-[#13191C] text-[#E4ECEC]">తెలుగు (Telugu)</option>
                  <option value="Hindi" className="bg-[#13191C] text-[#E4ECEC]">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Service Description with Voice Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#8E9EA2] uppercase">
                Short Description of Services / Products
              </label>
              <span className="text-[11px] text-[#8E9EA2]">
                Speak or type in Telugu, Hindi, or English
              </span>
            </div>

            {/* Voice Input Widget */}
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              initialLanguage={language}
            />

            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what services you provide, your experience, warranty, or items you sell..."
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
            />
          </div>

          {/* Section: Location and Service Radius */}
          <div className="p-4 sm:p-5 bg-[#182024] rounded-2xl border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.08]">
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 text-[#E4ECEC]">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  <span>2. Worker Location & Service Area</span>
                </h3>
                <p className="text-xs text-[#8E9EA2]">
                  Required on sign-up to match you with nearby local customers in Hyderabad.
                </p>
              </div>
              <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 font-bold text-[11px]">
                Sign-up Requirement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.state}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#8E9EA2] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.city}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#8E9EA2] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1 flex items-center justify-between">
                  <span>Locality / Area *</span>
                  <span className="text-[11px] text-[#F59E0B] font-medium">Click map icon to choose</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={formData.locality}
                      onChange={(e) => {
                        if (e.target.value === 'OPEN_MAP') {
                          setShowMapModal(true);
                        } else {
                          setFormData({ ...formData, locality: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm font-semibold text-[#E4ECEC] focus:outline-none focus:border-amber-500/60 shadow-inner"
                    >
                      {LOCALITIES.map((loc) => (
                        <option key={loc} value={loc} className="bg-[#13191C] text-[#E4ECEC]">
                          {loc}
                        </option>
                      ))}
                      {formData.locality && !LOCALITIES.includes(formData.locality) && (
                        <option value={formData.locality} className="bg-[#13191C] text-[#E4ECEC]">📍 {formData.locality}</option>
                      )}
                      <option value="OPEN_MAP" className="bg-[#13191C] text-[#F59E0B]">🗺️ Select from Map...</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[#E4ECEC] border border-white/10 text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
                    title="Select place with the help of Hyderabad Map"
                  >
                    <Map className="w-4 h-4 text-[#F59E0B]" />
                    <span className="hidden sm:inline">Pick on Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Location Confirmation Pill */}
            <div className="flex items-center justify-between p-2.5 bg-[#0F172A] rounded-xl border border-[#334155] text-xs text-[#8E9EA2]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Location: <strong className="text-[#E4ECEC]">{formData.locality}, Hyderabad</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="text-[#F59E0B] hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Change on Map</span>
              </button>
            </div>

            {/* GPS Location Capture */}
            <div className="p-3 bg-[#0F172A] rounded-xl border border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-[#E4ECEC]">GPS Coordinates (Optional Precision)</p>
                  <p className="text-[#8E9EA2] text-[11px]">
                    {gpsStatus || `Latitude: ${formData.latitude.toFixed(4)}, Longitude: ${formData.longitude.toFixed(4)}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={captureGpsLocation}
                disabled={gpsLoading}
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-amber-500/40 hover:border-amber-500 hover:bg-white/[0.12] text-xs font-bold text-[#E4ECEC] transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>{gpsLoading ? 'Capturing...' : '📍 Choose My Current Location'}</span>
              </button>
            </div>

            {/* Service Area Radius Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-[#8E9EA2] uppercase">Service Coverage Radius</span>
                <span className="font-extrabold text-[#F59E0B]">
                  {formData.serviceRadius} km from {formData.locality}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={formData.serviceRadius}
                onChange={(e) =>
                  setFormData({ ...formData, serviceRadius: Number(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Profile Image & Starting Price */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider pb-2 border-b border-white/[0.08] text-[#8E9EA2]">
              3. Pricing & Profile Image
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  Starting Price / Minimum Visit Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.startingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, startingPrice: e.target.value })
                  }
                  placeholder="e.g. 200"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-1">
                  Current Availability
                </label>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#E4ECEC] cursor-pointer">
                    <input
                      type="radio"
                      name="isAvailable"
                      checked={formData.isAvailable === true}
                      onChange={() => setFormData({ ...formData, isAvailable: true })}
                      className="accent-emerald-400"
                    />
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Available Now
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#8E9EA2] cursor-pointer">
                    <input
                      type="radio"
                      name="isAvailable"
                      checked={formData.isAvailable === false}
                      onChange={() => setFormData({ ...formData, isAvailable: false })}
                      className="accent-slate-500"
                    />
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      Currently Busy
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Avatar preset selection */}
            <div>
              <label className="block text-xs font-bold text-[#8E9EA2] uppercase mb-2">
                Choose a Profile Photo Preset (or paste URL)
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Avatar ${idx}`}
                    onClick={() => setFormData({ ...formData, profileImage: preset })}
                    className={`w-14 h-14 rounded-2xl object-cover cursor-pointer transition-all border-2 ${
                      formData.profileImage === preset
                        ? 'border-amber-400 scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
              <input
                type="url"
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                placeholder="Or paste custom image URL..."
                className="w-full mt-2 px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-[#E4ECEC] placeholder-[#8E9EA2] focus:outline-none focus:border-amber-500/60 shadow-inner"
              />
            </div>
          </div>

          {/* Strong Password Input with Real-time Checker */}
          <div className="pt-2">
            <StrongPasswordInput
              password={formData.password}
              onPasswordChange={(val) => setFormData({ ...formData, password: val })}
              required={false}
              label="Account Security Password"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-extrabold text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>
                {submitting ? 'Saving and Publishing...' : t.worker.saveAndPublish}
              </span>
            </button>
            <p className="text-center text-[11px] text-[#8E9EA2] mt-2">
              By publishing, your contact number will be visible to local neighborhood customers.
            </p>
          </div>
        </form>
      </div>

      {/* Locality Map Modal */}
      <LocalityMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        currentLocality={formData.locality}
        onSelectLocality={(locName, coords) => {
          setFormData((prev) => ({
            ...prev,
            locality: locName,
            latitude: coords ? coords.lat : prev.latitude,
            longitude: coords ? coords.lng : prev.longitude,
          }));
          setGpsStatus(`Map Pin selected: ${locName} (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        }}
      />
    </div>
  );
}
