import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import InfoModals from './components/InfoModals';
import InstaHelpModal from './components/InstaHelpModal';
import PartnerVoiceModal from './components/PartnerVoiceModal';
import ScrollToTop from './components/ScrollToTop';
import AuthAndLocationGate from './components/AuthAndLocationGate';
import { useApp } from './context/AppContext';

// Customer Pages
import LandingPage from './pages/LandingPage';
import CustomerHomePage from './pages/CustomerHomePage';
import CustomerCategoriesPage from './pages/CustomerCategoriesPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CustomerMobileApp from './pages/CustomerMobileApp';
import ProviderDetailsPage from './pages/ProviderDetailsPage';

// Partner Pages
import PartnerPortalPage from './pages/PartnerPortalPage';
import WorkerRegisterPage from './pages/WorkerRegisterPage';
import WorkerDashboardPage from './pages/WorkerDashboardPage';
import WorkerMobileApp from './pages/WorkerMobileApp';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { getVoiceController } from './utils/voiceController';

function ExternalRedirect({ url, label }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
      <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#8E9EA2]">Redirecting to {label || 'website'}...</p>
      <a href={url} className="text-xs text-[#F59E0B] underline font-semibold">
        Click here if you are not redirected automatically
      </a>
    </div>
  );
}

export default function App() {
  const { workerUser } = useApp();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null); // 'about', 'contact', 'privacy', 'terms'
  const [showInstaHelp, setShowInstaHelp] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Global Voice modal state controllers
  useEffect(() => {
    const handleCloseVoiceModal = () => {
      setShowVoiceModal(false);
    };
    const handleOpenVoiceModal = () => {
      setShowVoiceModal(true);
    };
    window.addEventListener('comsity:voice:closeModal', handleCloseVoiceModal);
    window.addEventListener('comsity:voice:openModal', handleOpenVoiceModal);
    return () => {
      window.removeEventListener('comsity:voice:closeModal', handleCloseVoiceModal);
      window.removeEventListener('comsity:voice:openModal', handleOpenVoiceModal);
    };
  }, []);

  // Client-side instant route navigation triggered by Voice commands
  useEffect(() => {
    const handleVoiceNavigate = (e) => {
      if (e.detail?.path) {
        navigate(e.detail.path);
      }
    };
    window.addEventListener('comsity:navigate', handleVoiceNavigate);
    return () => window.removeEventListener('comsity:navigate', handleVoiceNavigate);
  }, [navigate]);

  const handleVoiceToggle = () => {
    setShowVoiceModal((prev) => !prev);
  };

  // App separation based on build / environment config:
  // Port 5174: Customer Website
  // Port 5175: Partner Website
  const isPartnerSite = import.meta.env.VITE_APP_TYPE === 'partner';
  const customerSiteUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5174` : 'http://localhost:5174';
  const partnerSiteUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5175` : 'http://localhost:5175';

  return (
    <div className="min-h-screen bg-[#0C1012] text-[#E4ECEC] font-sans selection:bg-white/20 selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* Route & Hash Scroll Controller */}
      <ScrollToTop />

      {/* Global Authentication & Location Permission Gate */}
      <AuthAndLocationGate />

      {/* Top Navbar Header */}
      <Navbar
        onOpenAbout={() => setActiveModal('about')}
        onOpenContact={() => setActiveModal('contact')}
        onOpenVoice={handleVoiceToggle}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-8">
        <Routes>
          {isPartnerSite ? (
            /* ========================================================= */
            /* 1. DEDICATED PARTNER WEBSITE ROUTES (PORT 5175)           */
            /* ========================================================= */
            <>
              {/* Partner Landing / Operations Portal */}
              <Route
                path="/"
                element={workerUser ? <Navigate to="/worker/dashboard" replace /> : <PartnerPortalPage />}
              />
              <Route path="/partner" element={<Navigate to="/" replace />} />
              <Route path="/worker" element={<Navigate to="/" replace />} />

              {/* Partner Authentication */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/worker/login" element={<LoginPage />} />
              <Route path="/register" element={<WorkerRegisterPage />} />
              <Route path="/worker/register" element={<WorkerRegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Partner Operations Dashboard & Duty Shifts */}
              <Route path="/dashboard" element={<WorkerDashboardPage />} />
              <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
              <Route path="/worker/shifts" element={<WorkerDashboardPage />} />
              <Route path="/worker/listings" element={<WorkerDashboardPage />} />
              <Route path="/worker/enquiries" element={<WorkerDashboardPage />} />
              <Route path="/worker/profile" element={<WorkerDashboardPage />} />

              {/* Partner Dedicated Mobile Phone App View */}
              <Route path="/app" element={<WorkerMobileApp />} />
              <Route path="/worker/app" element={<WorkerMobileApp />} />
              <Route path="/app/worker" element={<WorkerMobileApp />} />

              {/* Seamless redirect to Customer Website when requested */}
              <Route path="/customer/*" element={<ExternalRedirect url={customerSiteUrl} label="Customer Website" />} />
              <Route path="/services/*" element={<ExternalRedirect url={customerSiteUrl} label="Customer Website" />} />
              <Route path="/provider/*" element={<ExternalRedirect url={customerSiteUrl} label="Customer Website" />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            /* ========================================================= */
            /* 2. DEDICATED CUSTOMER WEBSITE ROUTES (PORT 5174)          */
            /* ========================================================= */
            <>
              {/* Customer Landing & Directory */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/customer" element={<Navigate to="/customer/home" replace />} />
              <Route path="/customer/home" element={<CustomerHomePage />} />
              <Route path="/customer/search" element={<CustomerHomePage />} />
              <Route path="/services" element={<CustomerHomePage />} />
              <Route path="/customer/categories" element={<CustomerCategoriesPage />} />
              <Route path="/categories" element={<CustomerCategoriesPage />} />

              {/* Customer Accounts & Bookings */}
              <Route path="/customer/login" element={<CustomerLoginPage />} />
              <Route path="/customer/register" element={<CustomerRegisterPage />} />
              <Route path="/customer/profile" element={<CustomerProfilePage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Verified Provider Profiles */}
              <Route path="/provider/:id" element={<ProviderDetailsPage />} />

              {/* Customer Dedicated Mobile Phone App View */}
              <Route path="/app" element={<CustomerMobileApp />} />
              <Route path="/customer/app" element={<CustomerMobileApp />} />
              <Route path="/app/customer" element={<CustomerMobileApp />} />

              {/* Seamless redirect to Partner Website when requested */}
              <Route path="/partner" element={<ExternalRedirect url={partnerSiteUrl} label="Partner Website" />} />
              <Route path="/worker/*" element={<ExternalRedirect url={partnerSiteUrl} label="Partner Website" />} />
              <Route path="/choose-role" element={<Navigate to="/customer/home" replace />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>

      {/* Mobile-only Bottom Navigation Bar */}
      <BottomNav
        onOpenInstaHelp={() => setShowInstaHelp(true)}
        onOpenVoice={handleVoiceToggle}
      />

      {/* Footer */}
      <Footer
        onOpenAbout={() => setActiveModal('about')}
        onOpenContact={() => setActiveModal('contact')}
        onOpenPrivacy={() => setActiveModal('privacy')}
        onOpenTerms={() => setActiveModal('terms')}
      />

      {/* Static Info Modals (About, Contact, Privacy, Terms) */}
      <InfoModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      {/* Emergency InstaHelp 20-min modal */}
      <InstaHelpModal
        isOpen={showInstaHelp}
        onClose={() => setShowInstaHelp(false)}
      />

      {/* Partner Voice AI Assistant & Mic Control Modal */}
      <PartnerVoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </div>
  );
}
