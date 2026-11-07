import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, translatePhrase } from '../utils/translations';
import { requestCurrentLocation, findClosestHyderabadLocality, HYDERABAD_LOCALITIES } from '../utils/geoUtils';
import { getFullPageTranslator } from '../utils/fullPageTranslator';
import { getVoiceController } from '../utils/voiceController';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Ensure consistent dark luxury theme across laptop and mobile
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#0C1012';
    document.body.style.color = '#E4ECEC';
  }, []);

  // Language state: Default language of the website is strictly English ('en')
  const [language, setLanguageState] = useState(() => {
    // Fresh session defaults to English; only use chosen language if explicitly selected in session
    return sessionStorage.getItem('hlc_session_lang') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    sessionStorage.setItem('hlc_session_lang', lang);
    localStorage.setItem('hlc_lang', lang);

    // Synchronize Voice STT/TTS language immediately
    try {
      const vc = getVoiceController();
      if (vc) {
        vc.setLanguage(lang);
      }
    } catch (e) {
      console.warn('Voice controller lang sync error:', e);
    }

    // Trigger full page translator
    try {
      const translator = getFullPageTranslator();
      if (translator) {
        translator.translatePage(lang);
      }
    } catch (err) {
      console.warn('Failed to trigger full page translation:', err);
    }
  };

  // Restore active language translation on initial page mount if explicitly selected
  useEffect(() => {
    if (language && language !== 'en') {
      try {
        const translator = getFullPageTranslator();
        if (translator) {
          setTimeout(() => translator.translatePage(language), 200);
        }
      } catch (err) {
        console.warn('Initial translation sync error:', err);
      }
    }
  }, []);

  const tr = (text) => translatePhrase(text, language);

  const t = useMemo(() => {
    const base = translations[language] || translations.en;
    return {
      ...base,
      tr,
    };
  }, [language]);

  // ==================== WORKER / PARTNER STATE ====================
  const [workerUser, setWorkerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hlc_worker_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginWorkerUser = (userData) => {
    setWorkerUser(userData);
    localStorage.setItem('hlc_worker_user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('hlc_token', userData.token);
    }
  };

  const logoutWorkerUser = () => {
    setWorkerUser(null);
    localStorage.removeItem('hlc_worker_user');
    localStorage.removeItem('hlc_token');
  };

  const updateWorkerAvailability = async (newStatus) => {
    const current = workerUser || {
      _id: 'local_partner_session',
      name: 'Partner',
      category: 'Local Services',
      locality: 'Hyderabad',
      isAvailable: false,
    };
    const updated = { ...current, isAvailable: newStatus };
    setWorkerUser(updated);
    localStorage.setItem('hlc_worker_user', JSON.stringify(updated));

    if (workerUser?._id && workerUser._id !== 'local_partner_session') {
      try {
        const res = await fetch(`/api/workers/${workerUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isAvailable: newStatus,
            name: workerUser.name,
            phone: workerUser.phone,
            category: workerUser.category,
            locality: workerUser.locality,
          }),
        });
        const data = await res.json();
        return data.success;
      } catch (err) {
        console.error('Failed to sync availability with server:', err);
        return false;
      }
    }
    return true;
  };

  const updateWorkerShift = async (shiftData) => {
    const current = workerUser || {
      _id: 'local_partner_session',
      name: 'Partner',
      category: 'Local Services',
      locality: 'Hyderabad',
      isAvailable: true,
    };
    const updated = { ...current, activeShift: shiftData, isAvailable: true };
    setWorkerUser(updated);
    localStorage.setItem('hlc_worker_user', JSON.stringify(updated));

    if (workerUser?._id && workerUser._id !== 'local_partner_session') {
      try {
        const res = await fetch(`/api/workers/${workerUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activeShift: shiftData,
            isAvailable: true,
            name: workerUser.name,
            phone: workerUser.phone,
            category: workerUser.category,
            locality: workerUser.locality,
          }),
        });
        const data = await res.json();
        return data.success;
      } catch (err) {
        console.error('Failed to sync shift with server:', err);
      }
    }
    return true;
  };

  // Background Voice Controller Event Listeners (Comsity Voice Automation)
  useEffect(() => {
    const handleVoiceAvailability = (e) => {
      if (e.detail && typeof e.detail.isAvailable === 'boolean') {
        updateWorkerAvailability(e.detail.isAvailable);
      }
    };
    const handleVoiceShift = (e) => {
      if (e.detail && e.detail.shiftId) {
        updateWorkerShift({
          id: e.detail.shiftId,
          name: e.detail.shiftName || 'Voice Selected Shift',
          durationHours: e.detail.shiftId.includes('2hr') ? 2 : 11,
          startedAt: new Date().toISOString(),
        });
      }
    };
    window.addEventListener('comsity:voice:availability', handleVoiceAvailability);
    window.addEventListener('comsity:voice:shift', handleVoiceShift);
    return () => {
      window.removeEventListener('comsity:voice:availability', handleVoiceAvailability);
      window.removeEventListener('comsity:voice:shift', handleVoiceShift);
    };
  }, [workerUser]);

  // ==================== CUSTOMER USER STATE ====================
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hlc_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginCustomerUser = (userData) => {
    setCustomerUser(userData);
    localStorage.setItem('hlc_customer_user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('hlc_customer_token', userData.token);
    }
  };

  const logoutCustomerUser = () => {
    setCustomerUser(null);
    localStorage.removeItem('hlc_customer_user');
    localStorage.removeItem('hlc_customer_token');
  };

  const updateCustomerUser = (updatedData) => {
    const merged = { ...customerUser, ...updatedData };
    setCustomerUser(merged);
    localStorage.setItem('hlc_customer_user', JSON.stringify(merged));
  };

  const toggleSaveWorker = async (workerId) => {
    if (!customerUser?._id) {
      // Local fallback if guest
      const current = customerUser?.savedWorkers || [];
      const updated = current.includes(workerId)
        ? current.filter((id) => id !== workerId)
        : [...current, workerId];
      updateCustomerUser({ savedWorkers: updated });
      return;
    }

    try {
      const res = await fetch(`/api/auth/customer/${customerUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleSaveWorkerId: workerId }),
      });
      const data = await res.json();
      if (data.success) {
        updateCustomerUser(data.data);
      }
    } catch (err) {
      console.error('Failed to toggle save worker:', err);
    }
  };

  const recordCustomerContact = async (worker, method = 'whatsapp') => {
    const contactRecord = {
      workerId: worker._id,
      workerName: worker.name,
      workerCategory: worker.category,
      workerPhone: worker.phone,
      contactMethod: method,
    };

    if (customerUser?._id) {
      try {
        await fetch(`/api/auth/customer/${customerUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newContactRecord: contactRecord }),
        });
      } catch (err) {
        console.error('Failed to record contact history:', err);
      }
    }

    // Local state fallback update
    const current = customerUser?.contactHistory || [];
    updateCustomerUser({
      contactHistory: [{ ...contactRecord, contactedAt: new Date() }, ...current],
    });
  };

  // User Selected Locality for Hyderabad
  const [selectedLocality, setSelectedLocalityState] = useState(() => {
    return localStorage.getItem('hlc_user_locality') || '';
  });

  const setSelectedLocality = (loc) => {
    setSelectedLocalityState(loc || '');
    if (loc) {
      localStorage.setItem('hlc_user_locality', loc);
    } else {
      localStorage.removeItem('hlc_user_locality');
    }
  };

  // Browser Geolocation state
  const [userLocation, setUserLocation] = useState({
    lat: 17.3850, // Default Hyderabad coordinates
    lng: 78.4867,
    hasGps: false,
    loading: false,
    error: null,
    localityName: 'Hyderabad',
  });

  const detectLocation = async () => {
    setUserLocation((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const loc = await requestCurrentLocation();
      setUserLocation({
        lat: loc.lat,
        lng: loc.lng,
        hasGps: true,
        loading: false,
        error: null,
        localityName: loc.localityName,
        zone: loc.zone,
        label: loc.label,
        distanceKm: loc.distanceKm,
      });

      // Synchronize with active selectedLocality and server so all connected mobile devices get exact location
      if (loc.localityName) {
        setSelectedLocality(loc.localityName);
        fetch('/api/geo/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loc),
        }).catch(() => {});
      }
      return loc;
    } catch (err) {
      console.warn('Location detection failed:', err);
      const fallbackLoc = HYDERABAD_LOCALITIES[0]; // Kukatpally
      setUserLocation({
        lat: fallbackLoc.lat,
        lng: fallbackLoc.lng,
        hasGps: false,
        loading: false,
        error: 'Unable to detect GPS. Defaulted to Kukatpally, Hyderabad.',
        localityName: fallbackLoc.name,
      });
      setSelectedLocality(fallbackLoc.name);
      return fallbackLoc;
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tr,
        workerUser,
        loginWorkerUser,
        logoutWorkerUser,
        updateWorkerAvailability,
        updateWorkerShift,
        customerUser,
        loginCustomerUser,
        logoutCustomerUser,
        updateCustomerUser,
        toggleSaveWorker,
        recordCustomerContact,
        userLocation,
        setUserLocation,
        detectLocation,
        selectedLocality,
        setSelectedLocality,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
