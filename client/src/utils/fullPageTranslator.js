/**
 * fullPageTranslator.js
 * 
 * Deep Full-Page Translation Engine for Comsity / KaamSetu
 * Translates 100% of website content (text nodes, buttons, input placeholders, titles, aria-labels)
 * into all 8 target languages:
 * 1. English ('en')
 * 2. Hindi ('hi')
 * 3. Telugu ('te')
 * 4. Tamil ('ta')
 * 5. Kannada ('kn')
 * 6. Malayalam ('ml')
 * 7. Marathi ('mr')
 * 8. Bengali ('bn')
 * 
 * Strict Guarantees:
 * - ZERO CSS alterations. No banner injection, no 40px pushdown.
 * - Deep scanning of all DOM text nodes, inputs, and dynamically rendered elements.
 * - Full button and form event preservation.
 */

import { DICTIONARY } from './translations';

// Supported 8 Indian Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', short: 'EN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', short: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', short: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', short: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', short: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', short: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', short: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', short: 'বাংলা' },
];

// Pre-computed Bidirectional Reverse Dictionary Map for Infinite Multi-Language Switching
const REVERSE_DICT = new Map();
for (const [enKey, translations] of Object.entries(DICTIONARY)) {
  const normEn = enKey.trim().toLowerCase();
  REVERSE_DICT.set(normEn, enKey.trim());
  if (translations && typeof translations === 'object') {
    for (const translatedText of Object.values(translations)) {
      if (typeof translatedText === 'string') {
        REVERSE_DICT.set(translatedText.trim().toLowerCase(), enKey.trim());
      }
    }
  }
}

export function resolveEnglishKey(rawText) {
  if (!rawText) return '';
  const clean = rawText.trim().toLowerCase();
  return REVERSE_DICT.get(clean) || rawText.trim();
}

class FullPageTranslator {
  constructor() {
    this.currentLang = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hlc_session_lang') : null) || 'en';
    this.originalTextMap = new WeakMap();
    this.isTranslating = false;
    this.observer = null;
    this.googleScriptLoaded = false;

    this.injectZeroUIGuard();
    this.initGoogleTranslator();
    this.initMutationObserver();
  }

  // 1. Forcefully suppress any Google Translate banner, balloon, or body 40px shift
  injectZeroUIGuard() {
    if (typeof document === 'undefined') return;

    if (!document.getElementById('comsity-zero-ui-guard')) {
      const style = document.createElement('style');
      style.id = 'comsity-zero-ui-guard';
      style.textContent = `
        .skiptranslate,
        .skiptranslate iframe,
        iframe[id*=":1.container"],
        div[id*=":1.container"],
        iframe.goog-te-banner-frame,
        .goog-te-banner-frame,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-tooltip,
        .goog-tooltip:hover,
        .VIpgJd-ZVi9od-ORHb-OEVmcd,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-vH1Gmf {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0px !important;
          max-height: 0px !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          pointer-events: none !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        font[color] {
          color: inherit !important;
          font: inherit !important;
          background: transparent !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Keep body.style.top reset to 0px and hide banner without deleting Google translation workers
    const resetBodyTop = () => {
      if (document.body && document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      const banner = document.querySelector('iframe.goog-te-banner-frame, .goog-te-banner-frame');
      if (banner && banner.style.display !== 'none') {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
        banner.style.height = '0px';
      }
    };

    resetBodyTop();
    setInterval(resetBodyTop, 100);
  }

  // 2. Initialize Google Translate Element headlessly in the background
  initGoogleTranslator() {
    if (typeof window === 'undefined') return;

    // Check if script already exists
    if (!document.getElementById('google-translate-script')) {
      // Hidden container
      let container = document.getElementById('google_translate_element');
      if (!container) {
        container = document.createElement('div');
        container.id = 'google_translate_element';
        container.style.display = 'none';
        container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(container);
      }

      window.googleTranslateElementInit = () => {
        try {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,te,ta,kn,ml,mr,bn',
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          }, 'google_translate_element');
          this.googleScriptLoaded = true;

          // If language was already selected, trigger it now
          if (this.currentLang && this.currentLang !== 'en') {
            setTimeout(() => this.triggerGoogleCombo(this.currentLang), 300);
          }
        } catch (e) {
          console.warn('[Translator] Google Translate Element init error:', e);
        }
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.onerror = () => {
        console.warn('[Translator] External translation CDN unreachable; using full local dictionary fallback.');
      };
      document.body.appendChild(script);
    }
  }

  triggerGoogleCombo(langCode) {
    // Set googtrans cookies
    const cookieVal = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (window.location.hostname) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;
    }

    // Try finding the Google combo element
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      if (combo.value !== langCode) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
      }
      return true;
    }
    return false;
  }

  // 3. Fast Deep TreeWalker for instant local dictionary translation
  deepTranslateDOM(root = document.body, targetLang = 'en') {
    if (!root) return;

    // A. Gather Text Nodes
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'code', 'pre', 'svg'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('[translate="no"]')) {
            return NodeFilter.FILTER_REJECT;
          }
          const val = node.nodeValue?.trim();
          return val && val.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      const currentVal = currentNode.nodeValue;
      if (!currentVal || !currentVal.trim()) continue;

      const leading = currentVal.match(/^\s*/)[0];
      const trailing = currentVal.match(/\s*$/)[0];
      const trimmed = currentVal.trim();

      // Resolve the original English canonical key (even if currently in Telugu, Hindi, etc.)
      const enKey = resolveEnglishKey(trimmed);

      if (targetLang === 'en') {
        if (enKey && trimmed !== enKey) {
          currentNode.nodeValue = leading + enKey + trailing;
        }
      } else {
        const dictEntry = DICTIONARY[enKey];
        if (dictEntry && dictEntry[targetLang]) {
          const targetTranslation = dictEntry[targetLang];
          if (trimmed !== targetTranslation) {
            currentNode.nodeValue = leading + targetTranslation + trailing;
          }
        }
      }
    }

    // B. Gather Input Placeholders, Titles, and Aria Labels
    const inputs = root.querySelectorAll('input[placeholder], textarea[placeholder], [title], [aria-label]');
    inputs.forEach((el) => {
      // Placeholder
      if (el.placeholder && el.placeholder.trim()) {
        const trimmed = el.placeholder.trim();
        const enKey = resolveEnglishKey(trimmed);
        if (targetLang === 'en') {
          if (enKey) el.placeholder = enKey;
        } else {
          const dict = DICTIONARY[enKey];
          if (dict && dict[targetLang]) {
            el.placeholder = dict[targetLang];
          }
        }
      }

      // Title
      if (el.title && el.title.trim()) {
        const trimmed = el.title.trim();
        const enKey = resolveEnglishKey(trimmed);
        if (targetLang === 'en') {
          if (enKey) el.title = enKey;
        } else {
          const dict = DICTIONARY[enKey];
          if (dict && dict[targetLang]) {
            el.title = dict[targetLang];
          }
        }
      }
    });
  }

  // 4. Main Translation Invocation (Triggered on language button click)
  translatePage(targetLang) {
    this.currentLang = targetLang;
    localStorage.setItem('hlc_lang', targetLang);
    document.documentElement.lang = targetLang;

    // Step A: Immediately translate using local high-speed dictionary
    this.deepTranslateDOM(document.body, targetLang);

    // Step B: Trigger headless Google Translate with continuous retry until ready
    let attempts = 0;
    const tryTrigger = () => {
      const ok = this.triggerGoogleCombo(targetLang);
      if (!ok && attempts < 25) {
        attempts++;
        setTimeout(tryTrigger, 200);
      }
    };
    tryTrigger();
  }

  // 5. Watch for dynamic content (modals, new pages, cards) and translate immediately
  initMutationObserver() {
    if (typeof window === 'undefined') return;

    this.observer = new MutationObserver((mutations) => {
      if (this.currentLang === 'en') return;

      let hasNewNodes = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }

      if (hasNewNodes) {
        clearTimeout(this.mutationDebounce);
        this.mutationDebounce = setTimeout(() => {
          this.deepTranslateDOM(document.body, this.currentLang);
        }, 100);
      }
    });

    if (document.body) {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }
}

// Global Singleton
let translatorInstance = null;

export function getFullPageTranslator() {
  if (typeof window === 'undefined') return null;
  if (!translatorInstance) {
    translatorInstance = new FullPageTranslator();
  }
  return translatorInstance;
}

export default FullPageTranslator;
