import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  UserPlus,
  Zap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  X,
  Compass,
} from 'lucide-react';
import { HYDERABAD_LOCALITIES } from '../utils/geoUtils';

export default function AuthAndLocationGate() {
  const {
    customerUser,
    workerUser,
    loginCustomerUser,
    loginWorkerUser,
    selectedLocality,
    setSelectedLocality,
    userLocation,
    detectLocation,
    tr,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const isPartnerSite = import.meta.env.VITE_APP_TYPE === 'partner';
  const currentUser = isPartnerSite ? workerUser : customerUser;
  const isLoggedIn = !!currentUser;

  // Track if location gate has been completed for this session
  const [locationCompleted, setLocationCompleted] = useState(() => {
    return sessionStorage.getItem('hlc_location_granted') === 'true';
  });

  // Track if guest dismissed auth gate
  const [guestDismissed, setGuestDismissed] = useState(() => {
    return sessionStorage.getItem('hlc_guest_browsing') === 'true';
  });

  // Force open state for manual trigger (e.g. from Navbar location click)
  const [forceLocationOpen, setForceLocationOpen] = useState(false);

  // Fetching state & animation phases
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [fetchPhase, setFetchPhase] = useState('idle'); // 'idle' | 'requesting' | 'triangulating' | 'success' | 'fallback'
  const [detectedLocalityName, setDetectedLocalityName] = useState(selectedLocality || 'Koti');
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);

  // Check if current route is an authentication route
  const authRoutes = [
    '/login',
    '/worker/login',
    '/register',
    '/worker/register',
    '/customer/login',
    '/customer/register',
    '/forgot-password',
  ];
  const isAuthRoute = authRoutes.includes(location.pathname);

  // Listen for manual open event from Navbar or Hero location pill
  useEffect(() => {
    const handleOpenGate = () => {
      setForceLocationOpen(true);
      setFetchPhase('idle');
      startFetchingLocation();
    };
    window.addEventListener('open-location-gate', handleOpenGate);
    return () => window.removeEventListener('open-location-gate', handleOpenGate);
  }, []);

  // Whenever user becomes logged in and location is not yet completed (or forced open),
  // automatically trigger the location permission fetching flow
  useEffect(() => {
    if ((isLoggedIn && !locationCompleted) || forceLocationOpen) {
      if (!isFetchingLocation && fetchPhase === 'idle') {
        startFetchingLocation();
      }
    }
  }, [isLoggedIn, locationCompleted, forceLocationOpen]);

  const startFetchingLocation = async () => {
    setIsFetchingLocation(true);
    setFetchPhase('requesting');

    // Phase 1: Requesting GPS authorization simulation step
    setTimeout(async () => {
      setFetchPhase('triangulating');

      try {
        let loc = null;
        if (detectLocation) {
          loc = await detectLocation();
        }

        const resolvedName = loc?.localityName || userLocation?.localityName || selectedLocality || 'Koti';
        setDetectedLocalityName(resolvedName);
        setFetchPhase('success');
      } catch (err) {
        console.warn('Location detection fallback:', err);
        const fallback = selectedLocality || 'Koti';
        setDetectedLocalityName(fallback);
        setFetchPhase('fallback');
      } finally {
        setIsFetchingLocation(false);
      }
    }, 1200);
  };

  const handleDismissOrCancel = () => {
    sessionStorage.setItem('hlc_location_granted', 'true');
    setLocationCompleted(true);
    setForceLocationOpen(false);
  };

  const handleDismissAuth = () => {
    sessionStorage.setItem('hlc_guest_browsing', 'true');
    setGuestDismissed(true);
  };

  const handleConfirmLocation = () => {
    if (detectedLocalityName) {
      setSelectedLocality(detectedLocalityName);
    }
    sessionStorage.setItem('hlc_location_granted', 'true');
    setLocationCompleted(true);
    setForceLocationOpen(false);

    // If on auth route, navigate to main home/dashboard
    if (isAuthRoute) {
      if (isPartnerSite) {
        navigate('/worker/dashboard');
      } else {
        navigate('/customer/home');
      }
    }
  };

  // 1-Click Demo Login to let user proceed instantly without typing credentials
  const handleQuickDemoLogin = async () => {
    setDemoLoginLoading(true);
    try {
      if (isPartnerSite) {
        // Quick worker login
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '+919876543211', password: '' }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          loginWorkerUser(data.data);
        } else {
          // Local fallback demo worker
          loginWorkerUser({
            _id: 'demo_worker_1',
            name: 'Ananya Reddy',
            phone: '+919876543211',
            category: 'Electrician & Wiring',
            locality: 'Koti',
            isAvailable: true,
          });
        }
      } else {
        // Quick customer login
        const res = await fetch('/api/auth/customer/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: '+919876543210', password: '' }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          loginCustomerUser(data.data);
        } else {
          // Local fallback demo customer
          loginCustomerUser({
            _id: 'demo_cust_1',
            name: 'Rahul Sharma',
            phone: '+919876543210',
            email: 'rahul.hyderabad@gmail.com',
            locality: 'Koti',
            city: 'Hyderabad',
            savedWorkers: [],
          });
        }
      }
    } catch (err) {
      console.error('Quick demo login error:', err);
      // Fallback
      if (isPartnerSite) {
        loginWorkerUser({
          _id: 'demo_worker_1',
          name: 'Ananya Reddy',
          phone: '+919876543211',
          category: 'Electrician & Wiring',
          locality: 'Koti',
          isAvailable: true,
        });
      } else {
        loginCustomerUser({
          _id: 'demo_cust_1',
          name: 'Rahul Sharma',
          phone: '+919876543210',
          locality: 'Koti',
          city: 'Hyderabad',
        });
      }
    } finally {
      setDemoLoginLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // RENDER DECISION:
  // Case A: User is NOT logged in and not on auth page -> Show Auth Required Gate
  // Case B: User IS logged in AND location NOT completed (or forced open) -> Show Location Permission Screen
  // Case C: User is logged in and location is completed -> Render nothing (allow normal app usage)
  // --------------------------------------------------------------------------

  // Allow seamless browsing of the Home Page, Partner Portal, and public catalog in our dark theme
  const isPublicPage =
    isPartnerSite ||
    location.pathname === '/' ||
    location.pathname === '/services' ||
    location.pathname === '/customer/home' ||
    location.pathname === '/customer/categories' ||
    location.pathname.startsWith('/worker') ||
    location.pathname.startsWith('/dashboard');
  const shouldShowAuthGate = !isLoggedIn && !isAuthRoute && !guestDismissed && !isPublicPage;
  const shouldShowLocationGate = forceLocationOpen;

  if (!shouldShowAuthGate && !shouldShowLocationGate) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#13191C] border border-white/[0.14] shadow-2xl overflow-hidden relative text-[#E0EBE9] space-y-6 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =================================================================== */}
        {/* CASE A: USER MUST LOG IN OR SIGN IN FIRST                           */}
        {/* =================================================================== */}
        {shouldShowAuthGate && (
          <div className="space-y-6 text-center animate-in fade-in relative">
            {/* Top Close / Cancel (X) button to cancel in any case */}
            <button
              type="button"
              onClick={handleDismissAuth}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-white/10"
              title="Cancel / Close"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isPartnerSite ? 'KaamSetu Partner Portal' : 'KaamSetu Customer Store'}</span>
            </div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
              <LogIn className="w-8 h-8 text-[#F59E0B]" />
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#E0EBE9]">
                Please Log In or Sign In First
              </h2>
              <p className="text-xs sm:text-sm text-[#8E9EA2] max-w-md mx-auto leading-relaxed">
                {isPartnerSite
                  ? 'To manage your shifts, receive client requests, and set your direct rates, please log in with your verified partner phone number.'
                  : 'To book verified local specialists, access 20-min InstaHelp dispatch, and view direct phone numbers, please sign in to your customer account.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(isPartnerSite ? '/login' : '/customer/login')}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <LogIn className="w-4 h-4 text-[#0B0F10]" />
                <span>Log In to Existing Account</span>
                <ArrowRight className="w-4 h-4 text-[#0B0F10] ml-auto" />
              </button>

              <button
                type="button"
                onClick={() => navigate(isPartnerSite ? '/register' : '/customer/register')}
                className="w-full py-3.5 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-slate-300" />
                <span>Create New Account (Sign Up)</span>
              </button>

              {/* 1-Click Quick Demo Sign In */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={demoLoginLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#F59E0B] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 animate-pulse" />
                <span>{demoLoginLoading ? 'Signing In...' : 'Quick 1-Click Demo Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismissAuth}
                className="w-full py-1 text-xs text-[#8E9EA2] hover:text-[#E4ECEC] transition-colors cursor-pointer"
              >
                Cancel / Explore as Guest
              </button>
            </div>

            <p className="text-[11px] text-[#8E9EA2] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-commission local marketplace in Hyderabad</span>
            </p>
          </div>
        )}

        {/* =================================================================== */}
        {/* CASE B: LOGGED IN -> STRAIGHT AWAY LOCATION PERMISSION & ANIMATION */}
        {/* =================================================================== */}
        {shouldShowLocationGate && (
          <div className="space-y-6">
            {/* Header with Cancel / Close (X) Button in ANY case */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#F59E0B]">
                  <Compass className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#E0EBE9]">
                    Hyderabad Location Setup
                  </h3>
                  <p className="text-[11px] text-[#8E9EA2]">
                    Signed in as <strong className="text-white">{currentUser?.name || 'Verified User'}</strong>
                  </p>
                </div>
              </div>

              {/* Cancel / Close (X) Button to cancel in any case */}
              <button
                type="button"
                onClick={handleDismissOrCancel}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-white/10"
                title="Cancel / Close"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* =============================================================== */}
            {/* ANIMATION SECTION: "FETCHING YOUR LOCATION..."                   */}
            {/* =============================================================== */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] text-center space-y-4">
              {/* 3D Radar Pulsing Sonar Graphic */}
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                {/* Expanding Sonar Waves */}
                <div
                  className="absolute inset-0 rounded-full bg-amber-500/15 animate-ping"
                  style={{ animationDuration: '2.5s' }}
                />
                <div
                  className="absolute inset-2 rounded-full bg-emerald-500/15 animate-ping"
                  style={{ animationDuration: '2s', animationDelay: '0.4s' }}
                />
                <div className="absolute inset-4 rounded-full border border-amber-500/30 animate-pulse" />
                <div className="absolute inset-7 rounded-full border border-emerald-500/40" />

                {/* Rotating Radar Scan Beam */}
                <div className="absolute inset-0 rounded-full border border-white/10 overflow-hidden">
                  <div
                    className="w-full h-full bg-gradient-to-tr from-transparent via-amber-400/25 to-transparent animate-spin"
                    style={{ animationDuration: '2.2s' }}
                  />
                </div>

                {/* Central Glowing Pin */}
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0C1012] border border-amber-500/60 shadow-xl shadow-amber-500/25 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-[#F59E0B] fill-amber-500/30 animate-bounce" />
                </div>
              </div>

              {/* Animated Status Headlines */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#F59E0B] text-xs font-mono font-bold">
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLocation ? 'animate-spin' : ''}`} />
                  <span>
                    {fetchPhase === 'success' || fetchPhase === 'fallback'
                      ? 'Location Successfully Fetched!'
                      : 'We are fetching your location...'}
                  </span>
                </div>

                <h4 className="text-lg font-heading font-extrabold text-[#E0EBE9]">
                  {fetchPhase === 'success' || fetchPhase === 'fallback' ? (
                    <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Connected to {detectedLocalityName}, Hyderabad</span>
                    </span>
                  ) : (
                    <span>Fetching Your Hyderabad Neighborhood</span>
                  )}
                </h4>

                <p className="text-xs text-[#8E9EA2] max-w-sm mx-auto leading-relaxed">
                  {fetchPhase === 'requesting' && 'Requesting device GPS coordinates & satellite triangulating...'}
                  {fetchPhase === 'triangulating' && 'Matching your position with local verified service clusters...'}
                  {(fetchPhase === 'success' || fetchPhase === 'fallback') &&
                    `Instant direct dispatch and zero-middleman specialists configured for ${detectedLocalityName}.`}
                </p>
              </div>

              {/* Detected Location Result Card */}
              {(fetchPhase === 'success' || fetchPhase === 'fallback') && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#E0EBE9]">
                        {detectedLocalityName} Locality
                      </div>
                      <div className="text-[10px] text-[#8E9EA2]">
                        Lat: {userLocation?.lat ? userLocation.lat.toFixed(4) : '17.3850'}, Lng: {userLocation?.lng ? userLocation.lng.toFixed(4) : '78.4867'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startFetchingLocation}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-slate-300 border border-white/10 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-fetch</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Proceed Action Button & Cancel Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleConfirmLocation}
                disabled={isFetchingLocation}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#E2E8F0] hover:bg-white text-[#0B0F10] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-white/5 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>
                  {`Continue to ${isPartnerSite ? 'Partner Portal' : 'Services'} with ${detectedLocalityName}`}
                </span>
                <ArrowRight className="w-4 h-4 text-[#0B0F10]" />
              </button>

              <button
                type="button"
                onClick={handleDismissOrCancel}
                className="w-full py-2 text-xs font-semibold text-[#8E9EA2] hover:text-[#E0EBE9] transition-colors cursor-pointer text-center"
              >
                Cancel / Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
