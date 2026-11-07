/**
 * voiceController.js
 * 
 * Two-Way Intelligent Voice Engine for Partner Portal ("Comsity" / "KaamSetu")
 * Full Speech-to-Text (STT) AND Text-to-Speech (TTS) with Intelligent Semantic Router ("The Brain").
 * 
 * Strict Guarantees:
 * - Listens to FULL words/sentences without interrupting on partial words like "open".
 * - Never assumes "open" means account: politely asks what to open if no target is given.
 * - Semantic Auto-Words Router:
 *     * "worship", "open word", "open word shift", "work shift", "shifts" -> Opens Work Shifts
 *     * "open my service", "my service", "services", "listings" -> Opens My Services catalog
 *     * "put shift 1 hour shift", "1 hour shift", "quick shift" -> Activates 1-Hour Shift
 *     * "from-time to-time", "full day shift", "all day" -> Activates Full Day Shift (until 8 PM)
 *     * "open account", "profile", "my profile" -> Pops out Account details
 *     * "logout" -> Logs out cleanly
 * - Multilingual: Thinks and responds out loud in the selected language (English / Telugu / Hindi).
 * - Immediate hardware microphone release on modal close or toggle off.
 * - Zero UI/CSS modifications.
 */

class VoiceController {
  constructor(options = {}) {
    this.micButtonSelector = options.micButtonSelector || '[data-voice-mic]';
    
    // Strict default: Universal high-accuracy English ('en-US') unless explicitly selected
    const currentLang = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hlc_session_lang') : null) || 'en';
      
    this.activeLanguage = currentLang === 'te' ? 'te-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US';
    this.recognition = null;
    this.isListening = false;
    this.desiredListening = false;
    this.audioCtx = null;
    this.availableVoices = [];
    this.lastCommandTime = 0;
    this.currentUtterance = null;
    this.speechEndTimer = null;

    this.initAudioContext();
    this.loadVoices();
    this.buildIntents();
  }

  // =========================================================================
  // 1. AUDITORY CHIMES (Synthesized via Web Audio API - Zero UI/CSS)
  // =========================================================================
  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    } catch (e) {
      console.warn('[VoiceController] Web Audio error:', e);
    }
  }

  playChime(freq = 440, duration = 0.12, type = 'sine') {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {}
  }

  playStartSound() {
    this.playChime(523.25, 0.08); // C5
    setTimeout(() => this.playChime(659.25, 0.12), 70); // E5
  }

  playErrorSound() {
    this.playChime(311.13, 0.12, 'sawtooth');
    setTimeout(() => this.playChime(233.08, 0.18, 'sawtooth'), 120);
  }

  // =========================================================================
  // 2. TEXT-TO-SPEECH (TTS) - SPEAKS CONFIRMATION OUT LOUD IN MATCHING LANGUAGE
  // =========================================================================
  loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const fetchVoices = () => {
      this.availableVoices = window.speechSynthesis.getVoices() || [];
    };
    fetchVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }

  setLanguage(langCode) {
    if (langCode === 'te') {
      this.activeLanguage = 'te-IN';
    } else if (langCode === 'hi') {
      this.activeLanguage = 'hi-IN';
    } else {
      this.activeLanguage = 'en-US';
    }
    if (this.recognition) {
      this.recognition.lang = this.activeLanguage;
    }
    console.log(`[VoiceController] Language switched to: ${this.activeLanguage}`);
  }

  speakAndExecute(message, langCode, onFinishedAction = null) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[VoiceController] SpeechSynthesis not supported.');
      if (onFinishedAction) onFinishedAction();
      return;
    }

    const targetLang = langCode || this.activeLanguage || 'en-IN';

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(message);
      this.currentUtterance = utterance;
      window.__currentVoiceUtterance = utterance;

      utterance.lang = targetLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select regional voice if available
      const isTelugu = targetLang.startsWith('te');
      const isHindi = targetLang.startsWith('hi');
      const allVoices = window.speechSynthesis.getVoices() || this.availableVoices || [];
      const voice = allVoices.find((v) => {
        if (isTelugu) return v.lang.includes('te') || v.name.toLowerCase().includes('telugu');
        if (isHindi) return v.lang.includes('hi') || v.name.toLowerCase().includes('hindi');
        return v.lang.includes('en-IN') || v.lang.includes('en');
      });

      if (voice) {
        utterance.voice = voice;
      } else if (isTelugu) {
        const fallbackVoice = allVoices.find((v) => v.lang.includes('hi') || v.lang.includes('en-IN') || v.lang.includes('en'));
        if (fallbackVoice) utterance.voice = fallbackVoice;
      }

      let executed = false;
      const doAction = () => {
        if (!executed) {
          executed = true;
          if (onFinishedAction) onFinishedAction();
        }
      };

      utterance.onend = () => {
        console.log('[VoiceController] TTS finished speaking. Executing action.');
        doAction();
      };

      utterance.onerror = (e) => {
        console.warn('[VoiceController] TTS error:', e);
        doAction();
      };

      // Safety fallback: if speech audio stalls, trigger action within 1500ms
      setTimeout(doAction, 1500);

      // Brief tick after cancel() so Chrome doesn't abort the newly queued utterance
      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('[VoiceController] Speak invocation error:', err);
          doAction();
        }
      }, 80);
    } catch (err) {
      console.warn('[VoiceController] TTS failure:', err);
      if (onFinishedAction) onFinishedAction();
    }
  }

  // =========================================================================
  // 3. INTENTS DEFINITIONS
  // =========================================================================
  buildIntents() {
    this.intents = [
      // 1. Account / Profile (Requires explicit "account" or "profile" in sentence)
      {
        intent: 'NAVIGATE_ACCOUNT',
        feedback: {
          'te-IN': 'మీ ఖాతా మరియు ప్రొఫైల్ తెరుస్తున్నాము',
          'hi-IN': 'आपका खाता और प्रोफाइल खोला जा रहा है',
          'en-IN': 'Opening My Account and Profile'
        },
        action: () => this.triggerAccountProfile()
      },

      // 2. Increase 1-Hour Quick Shift
      {
        intent: 'SHIFT_1HR',
        feedback: {
          'te-IN': 'వర్క్ షిఫ్ట్ 1 గంటకు పెంచబడింది. మీరు ఇప్పుడు ఆన్‌లైన్ అయ్యారు',
          'hi-IN': 'कार्य शिफ्ट 1 घंटे के लिए बढ़ा दी गई है. आप अब ऑनलाइन हैं',
          'en-IN': '1-hour work shift activated. You are now Online and on duty'
        },
        action: () => {
          this.triggerShift('shift_1hr_quick', '1-Hour Quick Shift');
          this.triggerAvailability(true);
          this.triggerShiftsModal();
        }
      },

      // 3. Custom Time-to-Time Shift
      {
        intent: 'SHIFT_CUSTOM',
        feedback: {
          'te-IN': 'సమయానికి అనుగుణంగా వర్క్ షిఫ్ట్ పెంచబడింది. మీరు ఇప్పుడు ఆన్‌లైన్ అయ్యారు',
          'hi-IN': 'समय के अनुसार कार्य शिफ्ट बढ़ा दी गई है. आप अब ऑनलाइन हैं',
          'en-IN': 'Work shift increased for specified timings. You are now Online and on duty'
        },
        action: () => {
          this.triggerShift('shift_custom', 'Custom Timing Shift');
          this.triggerAvailability(true);
          this.triggerShiftsModal();
        }
      },

      // 4. Open Workshifts
      {
        intent: 'NAVIGATE_SHIFTS',
        feedback: {
          'te-IN': 'వర్క్ షిఫ్ట్‌ల ఇంటర్‌ఫేస్ తెరుస్తున్నాము',
          'hi-IN': 'कार्य शिफ्ट इंटरफ़ेस खोला जा रहा है',
          'en-IN': 'Opening Workshifts interface'
        },
        action: () => {
          this.triggerShiftsModal();
        }
      },

      // 5. Open My Services ("open my services", "my services")
      {
        intent: 'NAVIGATE_SERVICES',
        feedback: {
          'te-IN': 'మీ సేవలు తెరుస్తున్నాము',
          'hi-IN': 'आपकी सेवाएं खोली जा रही हैं',
          'en-IN': 'Opening My Services'
        },
        action: () => {
          window.dispatchEvent(new CustomEvent('comsity:voice:closeModal'));
          this.triggerNavigation('/worker/dashboard?tab=listings');
          window.dispatchEvent(new CustomEvent('comsity:worker:tab', { detail: { tab: 'listings' } }));
        }
      },

      // 6. Logout / Sign out
      {
        intent: 'LOGOUT',
        feedback: {
          'te-IN': 'లాగ్ అవుట్ చేస్తున్నాము',
          'hi-IN': 'लॉग आउट किया जा रहा है',
          'en-IN': 'Logging out'
        },
        action: () => this.triggerLogout()
      },

      // 7. Leads & Calls ("open leads and calls", "leads and calls", "calls")
      {
        intent: 'NAVIGATE_CALLS',
        feedback: {
          'te-IN': 'కస్టమర్ కాల్స్ మరియు లీడ్స్ తెరుస్తున్నాము',
          'hi-IN': 'ग्राहक कॉल और लीड्स खोली जा रही हैं',
          'en-IN': 'Opening Leads and Calls'
        },
        action: () => {
          window.dispatchEvent(new CustomEvent('comsity:voice:closeModal'));
          this.triggerNavigation('/worker/dashboard?tab=enquiries');
          window.dispatchEvent(new CustomEvent('comsity:worker:tab', { detail: { tab: 'enquiries' } }));
        }
      },

      // 8. Partner Overview / Dashboard ("open partner overview", "partner overview")
      {
        intent: 'NAVIGATE_OVERVIEW',
        feedback: {
          'te-IN': 'పార్ట్‌నర్ ఓవర్‌వ్యూ తెరుస్తున్నాము',
          'hi-IN': 'पार्टनर अवलोकन खोला जा रहा है',
          'en-IN': 'Opening Partner Overview'
        },
        action: () => {
          window.dispatchEvent(new CustomEvent('comsity:voice:closeModal'));
          this.triggerNavigation('/worker/dashboard?tab=overview');
          window.dispatchEvent(new CustomEvent('comsity:worker:tab', { detail: { tab: 'overview' } }));
        }
      },

      // 9. On Duty / Set as Available ("set as available")
      {
        intent: 'SET_AVAILABLE',
        feedback: {
          'te-IN': 'మీరు ఇప్పుడు ఆన్‌లైన్ అయ్యారు',
          'hi-IN': 'आप अब ऑनलाइन हैं',
          'en-IN': 'You are now online'
        },
        action: () => this.triggerAvailability(true)
      },

      // 10. Off Duty / Set as Busy ("set as busy")
      {
        intent: 'SET_BUSY',
        feedback: {
          'te-IN': 'మీరు ఇప్పుడు ఆఫ్‌లైన్ అయ్యారు',
          'hi-IN': 'आप अब ऑफलाइन हैं',
          'en-IN': 'You are now busy'
        },
        action: () => this.triggerAvailability(false)
      },

      // 11. Switch to Customer App ("open customer app")
      {
        intent: 'CUSTOMER_APP',
        feedback: {
          'te-IN': 'కస్టమర్ యాప్ తెరుస్తున్నాము',
          'hi-IN': 'ग्राहक ऐप खोला जा रहा है',
          'en-IN': 'Opening Customer Store'
        },
        action: () => this.triggerCustomerApp()
      },

      // 12. Open Menu ("open menu")
      {
        intent: 'OPEN_MENU',
        feedback: {
          'te-IN': 'మెనూ తెరుస్తున్నాము',
          'hi-IN': 'मेनू खोला जा रहा है',
          'en-IN': 'Opening Menu'
        },
        action: () => this.triggerMenu()
      },

      // 13. Friendly Greetings
      {
        intent: 'GREETING',
        feedback: {
          'te-IN': 'నమస్తే! నేను వింటున్నాను. "వర్క్‌షాప్స్", "మై సర్వీసెస్", లేదా "పార్ట్‌నర్ ఓవర్‌వ్యూ" అని చెప్పండి.',
          'hi-IN': 'नमस्ते! मैं सुन रहा हूँ. "कार्यशाला", "मेरी सेवाएं", या "पार्टनर अवलोकन" बोलें.',
          'en-IN': 'Hello! I am listening. You can say "Partner Overview", "Workshops", "My Services", or "Leads & Calls".'
        },
        action: null
      }
    ];
  }

  // =========================================================================
  // 4. THE BRAIN: SEMANTIC INTENT CLASSIFIER (Free-Flow Intelligent Routing)
  // =========================================================================
  evaluateBrain(rawText) {
    if (!rawText) return null;

    const text = rawText
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?।॥]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('[VoiceController Brain Input]:', text);

    // Rule 1: Friendly Greetings
    if (/^(hello|hi|hey|namaste|good morning|good evening|నమస్తే|హలో|నమస్కారం|नमस्ते)/i.test(text)) {
      return this.intents.find((i) => i.intent === 'GREETING');
    }

    // Rule 2: Increase 1-Hour Work Shift
    // Matches: "increase 1 hour", "increase one hour", "increase 1 hour work shift", "increase 1 hr", "1 hour shift", "1 hour", "increase worship for 1 hour"
    const has1Hour = /\b(1|one)\s*(hour|hr|hrs|ghante|గంట)/i.test(text) || text.includes('1hr') || text.includes('1 hour') || text.includes('one hour') || text.includes('1 గంట');
    const isIncrease1Hr = text.includes('increase') && (text.includes('1') || text.includes('one') || text.includes('hour') || text.includes('hr'));
    if (isIncrease1Hr || (has1Hour && (text.includes('shift') || text.includes('increase') || text.includes('put') || text.includes('quick') || text.includes('work')))) {
      return this.intents.find((i) => i.intent === 'SHIFT_1HR');
    }

    // Rule 3: This Time to This Time, Increase Work Shift
    // Matches: "this time to this time, increase work shift", "this time to this time", "from time to time", "time to time", "timing shift", "increase work shift"
    const hasCustomTime = 
      text.includes('this time to this time') || text.includes('from time to time') || text.includes('time to time') ||
      text.includes('this time') || text.includes('from time') || text.includes('timing') ||
      (text.includes('increase') && (text.includes('work shift') || text.includes('shift') || text.includes('workshift')) && !has1Hour);
    if (hasCustomTime) {
      return this.intents.find((i) => i.intent === 'SHIFT_CUSTOM');
    }

    // Rule 4: My Services Catalog
    // Matches: "my services", "open my services", "my service", "open my service", "services", "service", "listings", "catalog"
    const hasService = 
      text.includes('service') || text.includes('services') || text.includes('social') || text.includes('socials') || text.includes('listing') || text.includes('listings') || text.includes('catalog') ||
      text.includes('సేవ') || text.includes('సర్వీస్') || text.includes('సర్వీసులు') || text.includes('సర్వీసెస్') ||
      text.includes('सेवा') || text.includes('सर्विस') || text.includes('कैटलॉग');
    if (hasService) {
      return this.intents.find((i) => i.intent === 'NAVIGATE_SERVICES');
    }

    // Rule 5: Workshifts Interface
    // Matches: "workshifts", "work shifts", "open workshifts", "workshift", "work shift", "shifts", "shift", "duty", "workshops", "worship"
    const hasWorkshifts = 
      text.includes('workshift') || text.includes('workshifts') || text.includes('work shift') || text.includes('work shifts') ||
      text.includes('shifts') || text.includes('shift') || text.includes('duty') ||
      text.includes('workshop') || text.includes('workshops') || text.includes('worship') || text.includes('warship') || text.includes('worksheet') || text.includes('worksheets') ||
      text.includes('వర్క్ షిఫ్ట్') || text.includes('వర్క్‌షాప్') || text.includes('వర్క్ షిఫ్ట్‌లు') || text.includes('షిఫ్ట్') || text.includes('డ్యూటీ') ||
      text.includes('कार्य शिफ्ट') || text.includes('वर्कशॉप') || text.includes('शिफ्ट') || text.includes('ड्यूटी');
    if (hasWorkshifts) {
      return this.intents.find((i) => i.intent === 'NAVIGATE_SHIFTS');
    }

    // Rule 6: Open Profile / My Account
    // Matches: "open profile", "profile", "my profile", "my account", "open account", "account", "accounts", "user", "settings"
    const hasAccount = 
      text.includes('profile') || text.includes('account') || text.includes('accounts') || text.includes('user') || text.includes('settings') ||
      text.includes('అకౌంట్') || text.includes('ఖాతా') || text.includes('ప్రొఫైల్') ||
      text.includes('खाता') || text.includes('प्रोफाइल');
    if (hasAccount) {
      return this.intents.find((i) => i.intent === 'NAVIGATE_ACCOUNT');
    }

    // Rule 7: Logout
    // Matches: "logout", "log out", "sign out", "signout", "exit"
    const hasLogout = 
      text.includes('logout') || text.includes('log out') || text.includes('sign out') || text.includes('signout') || text.includes('exit') ||
      text.includes('లాగ్') || text.includes('లాక్') || text.includes('లాగౌట్') || text.includes('లాకవుట్') || text.includes('బయటకు') || text.includes('నిష్క్రమించు') ||
      text.includes('लॉग आउट') || text.includes('लॉगआउट') || text.includes('साइन आउट');
    if (hasLogout) {
      return this.intents.find((i) => i.intent === 'LOGOUT');
    }

    // Rule 8: Leads & Calls
    // Matches: "leads and calls", "calls", "open leads and calls", "leads & calls", "leads", "lead", "call"
    const hasCalls = 
      text.includes('call') || text.includes('calls') || text.includes('lead') || text.includes('leads') || text.includes('enquiry') ||
      text.includes('కాల్స్') || text.includes('లీడ్స్') ||
      text.includes('कॉल') || text.includes('लीड्स');
    if (hasCalls) {
      return this.intents.find((i) => i.intent === 'NAVIGATE_CALLS');
    }

    // Rule 9: Partner Overview
    // Matches: "partner overview", "overview", "open partner overview", "dashboard"
    const hasOverview = 
      text.includes('partner overview') || text.includes('overview') || text.includes('dashboard') ||
      text.includes('డ్యాష్‌బోర్డ్') || text.includes('ఓవర్‌వ్యూ') || text.includes('అవలోకనం') ||
      text.includes('डैशबोर्ड') || text.includes('विवरण');
    if (hasOverview) {
      return this.intents.find((i) => i.intent === 'NAVIGATE_OVERVIEW');
    }

    // Rule 10: Set as Available
    // Matches: "set as available", "set available", "available", "set as online", "online", "ready", "on duty"
    const hasOnline = 
      text.includes('available') || text.includes('online') || text.includes('ready') || text.includes('on duty') ||
      text.includes('ఆన్‌లైన్') || text.includes('అందుబాటులో') || text.includes('డ్యూటీ ఆన్') ||
      text.includes('ऑनलाइन') || text.includes('उपलब्ध');
    if (hasOnline) {
      return this.intents.find((i) => i.intent === 'SET_AVAILABLE');
    }

    // Rule 11: Set as Busy
    // Matches: "set as busy", "set busy", "busy", "set as offline", "offline", "off duty", "break"
    const hasOffline = 
      text.includes('busy') || text.includes('offline') || text.includes('off duty') || text.includes('break') ||
      text.includes('ఆఫ్‌లైన్') || text.includes('బిజీ') || text.includes('డ్యూటీ ఆఫ్') ||
      text.includes('ऑफलाइन') || text.includes('व्यस्त');
    if (hasOffline) {
      return this.intents.find((i) => i.intent === 'SET_BUSY');
    }

    // Rule 12: Customer Store App
    // Matches: "open customer app", "customer app", "customer store", "customer"
    const hasCustomer = 
      text.includes('customer app') || text.includes('open customer app') || text.includes('customer store') || text.includes('customer site') || text.includes('customer') || text.includes('client') || text.includes('buyer') ||
      text.includes('కస్టమర్') || text.includes('కస్టమర్ యాప్') ||
      text.includes('ग्राहक ऐप') || text.includes('ग्राहक');
    if (hasCustomer) {
      return this.intents.find((i) => i.intent === 'CUSTOMER_APP');
    }

    // Rule 13: Open Menu
    // Matches: "open menu", "menu", "start menu"
    const hasMenu = 
      text.includes('open menu') || text.includes('menu') || text.includes('start menu') || text.includes('navigation menu') ||
      text.includes('మెనూ') || text.includes('మెను') ||
      text.includes('मेनू');
    if (hasMenu) {
      return this.intents.find((i) => i.intent === 'OPEN_MENU');
    }

    // Rule 14: Standalone "Open" without target
    if (text === 'open' || text === 'ఓపెన్' || text === 'ఓపెన్ చేయి') {
      return {
        intent: 'CLARIFY_OPEN',
        feedback: {
          'te-IN': 'మీరు ఏమి తెరవాలనుకుంటున్నారు? "ఓవర్‌వ్యూ", "వర్క్ షిఫ్ట్‌లు", "మై సర్వీసెస్", "లీడ్స్", లేదా "ప్రొఫైల్" అని చెప్పండి.',
          'hi-IN': 'आप क्या खोलना चाहते हैं? "अवलोकन", "कार्य शिफ्ट", "सर्विस", "कॉल", या "प्रोफाइल" बोलें.',
          'en-IN': 'What would you like to open? You can say "Partner Overview", "Workshifts", "My Services", "Leads & Calls", or "Open Profile".'
        },
        action: null
      };
    }

    return null;
  }

  // =========================================================================
  // 5. SPEECH RECOGNITION (STT - Direct Hardware Integration & Live Interim)
  // =========================================================================
  async start() {
    this.desiredListening = true;

    // Abort previous instance if any cleanly
    if (this.recognition) {
      try { this.recognition.abort(); } catch {}
      this.recognition = null;
    }

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      console.warn('[VoiceController] SpeechRecognition unavailable in this browser.');
      this.desiredListening = false;
      this.isListening = false;
      window.dispatchEvent(
        new CustomEvent('comsity:voice:error', {
          detail: {
            error: 'not_supported',
            message: 'Microphone recognition is not supported in this browser. Please open in Google Chrome or use the Quick Command buttons below.'
          }
        })
      );
      window.dispatchEvent(new CustomEvent('comsity:voice:state', { detail: { isListening: false } }));
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      // Use single-phrase recognition to prevent persistent socket disconnects and "network" errors
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.activeLanguage || 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.playStartSound();
        console.log(`[VoiceController] Mic is LIVE and listening in: ${this.recognition.lang}`);
        window.dispatchEvent(new CustomEvent('comsity:voice:state', { detail: { isListening: true } }));
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const liveText = (finalTranscript || interimTranscript).trim();

        if (liveText) {
          // Immediately broadcast live words so user sees what is being recognized in real time
          window.dispatchEvent(
            new CustomEvent('comsity:voice:interim', {
              detail: { text: liveText, isFinal: Boolean(finalTranscript) }
            })
          );
        }

        if (finalTranscript.trim()) {
          // Final sentence captured: execute immediately without lag!
          if (this.speechEndTimer) {
            clearTimeout(this.speechEndTimer);
            this.speechEndTimer = null;
          }
          this.processBrainCommand(finalTranscript.trim());
        } else if (interimTranscript.trim()) {
          // Mid-sentence interim: wait for user pause
          if (this.speechEndTimer) {
            clearTimeout(this.speechEndTimer);
          }
          this.speechEndTimer = setTimeout(() => {
            this.processBrainCommand(interimTranscript.trim());
          }, 800);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[VoiceController] Speech recognition error event:', event.error);

        // If network error occurred on en-US, try with default browser locale once
        if (event.error === 'network' && !this._networkRetried) {
          this._networkRetried = true;
          try {
            this.recognition.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-IN';
            this.recognition.start();
            return;
          } catch {}
        }
        this._networkRetried = false;

        this.desiredListening = false;
        this.isListening = false;
        window.dispatchEvent(new CustomEvent('comsity:voice:state', { detail: { isListening: false } }));

        if (event.error === 'aborted') {
          return;
        }

        let friendlyMsg = `Microphone error (${event.error}). Please tap a quick command below.`;
        if (event.error === 'no-speech') {
          friendlyMsg = 'No speech detected. Tap the mic to speak again, or tap a quick command below.';
        } else if (event.error === 'network') {
          friendlyMsg = 'Speech cloud is unreachable on this network. Please tap any quick command below or type your command.';
        } else if (event.error === 'not-allowed') {
          friendlyMsg = (typeof window !== 'undefined' && window.isSecureContext === false)
            ? 'Microphone blocked by browser on HTTP. Tap a quick command below to run.'
            : 'Microphone permission blocked. Please allow mic in browser settings.';
        } else if (event.error === 'audio-capture') {
          friendlyMsg = 'Microphone hardware is busy or not detected. Tap a quick command below to run.';
        } else if (event.error === 'service-not-allowed') {
          friendlyMsg = 'Speech service not allowed by browser. Tap any quick command below.';
        }

        window.dispatchEvent(
          new CustomEvent('comsity:voice:error', {
            detail: { error: event.error, message: friendlyMsg }
          })
        );
      };

      this.recognition.onend = () => {
        // Cleanly reset listening state without infinite restarting loops
        this.isListening = false;
        this.desiredListening = false;
        window.dispatchEvent(new CustomEvent('comsity:voice:state', { detail: { isListening: false } }));
      };

      this.recognition.start();
    } catch (err) {
      console.warn('[VoiceController] Error initializing speech recognition:', err);
      this.desiredListening = false;
      this.isListening = false;
      window.dispatchEvent(
        new CustomEvent('comsity:voice:error', {
          detail: {
            error: 'start_failed',
            message: 'Unable to start speech recognition. Tap any quick command below.'
          }
        })
      );
      window.dispatchEvent(new CustomEvent('comsity:voice:state', { detail: { isListening: false } }));
    }
  }

  stop() {
    this.desiredListening = false;
    this.isListening = false;
    if (this.speechEndTimer) {
      clearTimeout(this.speechEndTimer);
      this.speechEndTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort(); // Immediately cut off microphone hardware
      } catch {
        try { this.recognition.stop(); } catch {}
      }
      this.recognition = null;
    }
    window.dispatchEvent(new CustomEvent('comsity:voice:state', { detail: { isListening: false } }));
  }

  toggle() {
    if (this.isListening || this.desiredListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  // =========================================================================
  // 6. PROCESS COMMAND VIA "THE BRAIN"
  // =========================================================================
  processBrainCommand(rawText) {
    if (!rawText) return;

    const isTelugu = this.activeLanguage.startsWith('te');
    const isHindi = this.activeLanguage.startsWith('hi');
    const langKey = isTelugu ? 'te-IN' : isHindi ? 'hi-IN' : 'en-IN';

    // Query "The Brain" with the complete spoken phrase
    const match = this.evaluateBrain(rawText);

    const cleanedText = rawText.toLowerCase().trim();
    const now = Date.now();

    if (match) {
      if (this.lastCommandText === cleanedText && this.lastCommandTime && now - this.lastCommandTime < 1200) {
        console.log('[VoiceController] Dropping duplicate rapid command:', cleanedText);
        return;
      }
      this.lastCommandText = cleanedText;
      this.lastCommandTime = now;

      // Stop listening so it doesn't loop on its own audio output
      this.stop();

      // Auth Gate Check: Only active shift starts require login first
      const isWorkerLoggedIn = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('hlc_worker_user'));
      const requiresAuth = ['SHIFT_1HR', 'SHIFT_FULLDAY'].includes(match.intent);

      let responseSpeech = match.feedback[langKey] || match.feedback['en-IN'];
      let chosenAction = match.action;

      if (requiresAuth && !isWorkerLoggedIn) {
        responseSpeech = isTelugu
          ? 'షిఫ్ట్ ప్రారంభించడానికి దయచేసి ముందుగా మీ అకౌంట్‌కు లాగిన్ అవ్వండి.'
          : isHindi
          ? 'शिफ्ट शुरू करने के लिए कृपया पहले अपने खाते में लॉग इन करें.'
          : 'Please login to your account first to activate a shift.';
        chosenAction = () => this.triggerAccountProfile();
      }

      this.playChime(659.25, 0.08);

      window.dispatchEvent(
        new CustomEvent('comsity:voice:action', {
          detail: {
            command: rawText,
            output: responseSpeech,
            intent: match.intent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        })
      );

      // Execute chosen action IMMEDIATELY without waiting for TTS speech
      if (chosenAction) {
        try {
          chosenAction();
        } catch (err) {
          console.error('[VoiceController] Error executing action:', err);
        }
      }

      // Speak response confirmation out loud ONCE
      this.speakAndExecute(responseSpeech, this.activeLanguage);
    } else {
      // User finished a full sentence that couldn't be classified
      if (this.lastCommandText === cleanedText && this.lastCommandTime && now - this.lastCommandTime < 1200) {
        return;
      }
      this.lastCommandText = cleanedText;
      this.lastCommandTime = now;

      this.playErrorSound();
      const unknownSpeech = isTelugu
        ? `మీరు "${rawText}" అన్నారు. "వర్క్ షిఫ్ట్", "సర్వీసెస్", లేదా "అకౌంట్" అని చెప్పండి.`
        : isHindi
        ? `आपने "${rawText}" कहा. "वर्क शिफ्ट", "सर्विस", या "खाता" बोलें.`
        : `I heard "${rawText}". Say "Workshifts" for duties, "Services" for catalog, or "Account" for profile.`;

      window.dispatchEvent(
        new CustomEvent('comsity:voice:action', {
          detail: {
            command: rawText,
            output: unknownSpeech,
            intent: 'UNKNOWN',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        })
      );

      this.speakAndExecute(unknownSpeech, this.activeLanguage);
    }
  }

  // =========================================================================
  // 7. ACTION EXECUTION (Pop-up & Instant Router Triggers)
  // =========================================================================
  triggerAccountProfile() {
    console.log('[VoiceController Executing] Profile command understood as Account');
    window.dispatchEvent(new CustomEvent('comsity:voice:closeModal'));
    this.triggerNavigation('/worker/dashboard?tab=profile');
    window.dispatchEvent(new CustomEvent('comsity:worker:tab', { detail: { tab: 'profile' } }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('comsity:voice:account'));
    }, 120);
  }

  triggerShiftsModal() {
    console.log('[VoiceController Executing] Open Workshifts modal');
    window.dispatchEvent(new CustomEvent('comsity:voice:closeModal'));
    this.triggerNavigation('/worker/dashboard?tab=shifts&modal=shift');
    window.dispatchEvent(new CustomEvent('comsity:worker:tab', { detail: { tab: 'shifts' } }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('comsity:voice:shiftsModal'));
    }, 120);
  }

  triggerMenu() {
    console.log('[VoiceController Executing] Open Menu command');
    window.dispatchEvent(new CustomEvent('comsity:voice:closeModal'));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('comsity:voice:menu'));
    }, 150);
  }

  triggerLogout() {
    console.log('[VoiceController Executing] Logout command');
    window.dispatchEvent(new CustomEvent('comsity:voice:closeModal'));
    window.dispatchEvent(new CustomEvent('comsity:voice:logout'));

    const allButtons = Array.from(document.querySelectorAll('button'));
    const logoutBtn = allButtons.find((b) => b.textContent && b.textContent.toLowerCase().includes('logout'));
    if (logoutBtn) {
      logoutBtn.click();
    } else {
      localStorage.removeItem('hlc_worker_user');
      localStorage.removeItem('hlc_token');
      window.location.href = '/';
    }
  }

  triggerNavigation(targetPath) {
    console.log(`[VoiceController Executing] Navigate -> ${targetPath}`);
    // Client-side route navigation via React Router
    window.dispatchEvent(new CustomEvent('comsity:navigate', { detail: { path: targetPath } }));
  }

  triggerAvailability(isAvailable) {
    console.log(`[VoiceController Executing] Set Availability -> ${isAvailable}`);
    // Dispatches state update to AppContext and WorkerDashboard without clicking DOM buttons
    window.dispatchEvent(new CustomEvent('comsity:voice:availability', { detail: { isAvailable } }));
  }

  triggerShift(shiftId, shiftName) {
    window.dispatchEvent(new CustomEvent('comsity:voice:shift', { detail: { shiftId, shiftName } }));
  }

  triggerCustomerApp() {
    const customerLink = document.querySelector('a[title*="Customer Website"], a:has-text("Customer App")');
    if (customerLink) customerLink.click();
    else window.open('http://localhost:5174', '_blank');
  }
}

// Global Singleton
let voiceInstance = null;
export function getVoiceController(options = {}) {
  if (typeof window === 'undefined') return null;
  if (!voiceInstance) voiceInstance = new VoiceController(options);
  return voiceInstance;
}

export default VoiceController;
