import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  Radio,
  Globe,
  User,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getVoiceController } from '../utils/voiceController';
import { SUPPORTED_LANGUAGES } from '../utils/fullPageTranslator';

const UI_STRINGS = {
  en: {
    title: 'Voice Command & Control',
    subtitle: 'Say "Profile" to open Account directly',
    currentWork: 'Current Work Going On',
    partnerAndTrade: 'Partner & Trade',
    currentShift: 'Current Active Shift',
    noShift: 'No Shift Active (Tap mic to start)',
    online: '🟢 Online • On Duty',
    offline: '🔴 Offline • Busy',
    commentOnline: 'Active on duty taking customer calls and bookings.',
    commentOffline: 'Currently taking a break or offline.',
    statusTitle: 'Voice Command & Output Status',
    listening: 'Listening... Please speak now in English.',
    commandGiven: 'Command Given: ',
    output: 'Output: ',
    tapPrompt: 'Tap the big mic button below and speak in English.',
    completedWork: 'What I Have Completed:',
    translator: 'Translator:',
    tapToSpeak: 'Tap Mic to Speak (Speak in English)',
    tapToStop: 'Listening... Tap to Stop',
    profileHint: 'Say "Profile" to open Account details directly',
    notLoggedIn: 'Not Logged In (Please Login)',
    noHistoryYet: 'No voice commands executed yet. Tap the mic and speak.',
  },
  te: {
    title: 'వాయిస్ కమాండ్ & కంట్రోల్',
    subtitle: 'అకౌంట్ తెరవడానికి "ప్రొఫైల్" లేదా "అకౌంట్" అని చెప్పండి',
    currentWork: 'ప్రస్తుతం జరుగుతున్న పని',
    partnerAndTrade: 'పార్ట్‌నర్ & వృత్తి',
    currentShift: 'ప్రస్తుత పని షిఫ్ట్',
    noShift: 'ఏ షిఫ్ట్ ప్రారంభం కాలేదు (మైక్ నొక్కండి)',
    online: '🟢 ఆన్‌లైన్ • డ్యూటీలో ఉన్నారు',
    offline: '🔴 ఆఫ్‌లైన్ • బిజీ',
    commentOnline: 'డ్యూటీలో ఉన్నారు, కస్టమర్ కాల్స్ అందుబాటులో ఉన్నాయి.',
    commentOffline: 'ప్రస్తుతం విశ్రాంతిలో లేదా ఆఫ్‌లైన్‌లో ఉన్నారు.',
    statusTitle: 'వాయిస్ కమాండ్ & అవుట్‌పుట్ స్టేటస్',
    listening: 'వింటున్నాము... దయచేసి తెలుగులో మాట్లాడండి.',
    commandGiven: 'ఇచ్చిన ఆదేశం: ',
    output: 'ఫలితం: ',
    tapPrompt: 'క్రింద ఉన్న మైక్ బటన్ నొక్కి తెలుగులో మాట్లాడండి.',
    completedWork: 'పూర్తి చేసిన పనులు:',
    translator: 'అనువాదం:',
    tapToSpeak: 'మాట్లాడటానికి మైక్ నొక్కండి (తెలుగులో మాట్లాడండి)',
    tapToStop: 'వింటున్నాము... ఆపడానికి నొక్కండి',
    profileHint: 'అకౌంట్ వివరాలు తెరవడానికి "ప్రొఫైల్" అని చెప్పండి',
    notLoggedIn: 'లాగిన్ కాలేదు (దయచేసి లాగిన్ అవ్వండి)',
    noHistoryYet: 'ఇంకా ఎటువంటి వాయిస్ ఆదేశాలు ఇవ్వలేదు. మైక్ నొక్కి మాట్లాడండి.',
  },
  hi: {
    title: 'वॉयस कमांड और नियंत्रण',
    subtitle: 'खाता खोलने के लिए "प्रोफाइल" या "खाता" बोलें',
    currentWork: 'वर्तमान में चल रहा कार्य',
    partnerAndTrade: 'पार्टनर और व्यवसाय',
    currentShift: 'वर्तमान कार्य शिफ्ट',
    noShift: 'कोई शिफ्ट सक्रिय नहीं (माइक दबाएं)',
    online: '🟢 ऑनलाइन • ड्यूटी पर',
    offline: '🔴 ऑफलाइन • व्यस्त',
    commentOnline: 'ड्यूटी पर सक्रिय हैं, ग्राहक कॉल उपलब्ध हैं।',
    commentOffline: 'वर्तमान में ब्रेक पर या ऑफलाइन हैं।',
    statusTitle: 'वॉयस कमांड और आउटपुट स्थिति',
    listening: 'सुन रहे हैं... कृपया हिंदी में बोलें।',
    commandGiven: 'दिया गया आदेश: ',
    output: 'परिणाम: ',
    tapPrompt: 'नीचे दिए गए माइक बटन को दबाएं और हिंदी में बोलें।',
    completedWork: 'पूर्ण किए गए कार्य:',
    translator: 'अनुवादक:',
    tapToSpeak: 'बोलने के लिए माइक दबाएं (हिंदी में बोलें)',
    tapToStop: 'सुन रहे हैं... रोकने के लिए दबाएं',
    profileHint: 'खाता विवरण खोलने के लिए "प्रोफाइल" बोलें',
    notLoggedIn: 'लॉग इन नहीं हैं (कृपया लॉग इन करें)',
    noHistoryYet: 'अभी तक कोई आदेश नहीं दिया गया। माइक दबाएं और बोलें।',
  },
};

const QUICK_COMMANDS = [
  { label: '🏢 Partner Overview', command: 'Partner Overview' },
  { label: '⏰ Workshifts', command: 'Workshifts' },
  { label: '💼 My Services', command: 'My Services' },
  { label: '📞 Leads & Calls', command: 'Leads and Calls' },
  { label: '👤 Open Profile', command: 'Open Profile' },
  { label: '⏱️ Increase 1 Hour', command: 'increase 1 hour' },
  { label: '🕒 Time-to-Time', command: 'this time to this time, increase work shift' },
  { label: '🟢 Set as Available', command: 'Set as available' },
  { label: '🔴 Set as Busy', command: 'set as busy' },
];

export default function PartnerVoiceModal({ isOpen, onClose }) {
  const {
    workerUser,
    updateWorkerAvailability,
    updateWorkerShift,
    language,
    setLanguage,
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [spokenCommand, setSpokenCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [typedCommand, setTypedCommand] = useState('');

  const activeLangKey = language === 'te' ? 'te' : language === 'hi' ? 'hi' : 'en';
  const strings = UI_STRINGS[activeLangKey] || UI_STRINGS.en;

  const [completedHistory, setCompletedHistory] = useState([]);

  // Clean initialize state when modal opens, stop when closed
  useEffect(() => {
    if (isOpen) {
      const vc = getVoiceController();
      if (vc) {
        vc.setLanguage(language);
      }
      setSpokenCommand('');
      setCommandOutput('Ready: Tap the mic below to speak, or tap any quick command.');
      setErrorMessage('');
      setIsListening(false);
    } else {
      const vc = getVoiceController();
      if (vc) {
        vc.stop();
      }
      setIsListening(false);
    }
  }, [isOpen]);

  // Synchronize listening state with browser speech recognition events
  useEffect(() => {
    const handleVoiceState = (e) => {
      if (e.detail && typeof e.detail.isListening === 'boolean') {
        setIsListening(e.detail.isListening);
      }
    };
    window.addEventListener('comsity:voice:state', handleVoiceState);
    return () => {
      window.removeEventListener('comsity:voice:state', handleVoiceState);
    };
  }, []);

  // Connect to Voice Controller events
  useEffect(() => {
    if (!isOpen) return;

    const handleVoiceInterim = (e) => {
      if (e.detail?.text) {
        setSpokenCommand(e.detail.text);
        setCommandOutput(`Hearing: "${e.detail.text}"...`);
        setErrorMessage('');
      }
    };

    const handleVoiceError = (e) => {
      if (e.detail?.message) {
        setErrorMessage(e.detail.message);
        setCommandOutput('Ready: Tap a quick command below or try mic again.');
        setIsListening(false);
      }
    };

    const handleVoiceAction = (e) => {
      if (e.detail) {
        const { command, output, intent, timestamp } = e.detail;
        setSpokenCommand(command);
        setCommandOutput(output);
        setErrorMessage('');
        setIsListening(false);

        // Add to completed work history with comment
        setCompletedHistory((prev) => [
          {
            id: Date.now(),
            title: `Executed: "${command}"`,
            comment: output,
            time: timestamp || 'Just now',
            type: intent || 'action',
          },
          ...prev.slice(0, 4), // Keep last 5
        ]);
      }
    };

    window.addEventListener('comsity:voice:interim', handleVoiceInterim);
    window.addEventListener('comsity:voice:error', handleVoiceError);
    window.addEventListener('comsity:voice:action', handleVoiceAction);
    return () => {
      window.removeEventListener('comsity:voice:interim', handleVoiceInterim);
      window.removeEventListener('comsity:voice:error', handleVoiceError);
      window.removeEventListener('comsity:voice:action', handleVoiceAction);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const runCommand = (cmd) => {
    if (!cmd || !cmd.trim()) return;
    const vc = getVoiceController();
    if (vc) {
      setSpokenCommand(cmd.trim());
      setCommandOutput('Evaluating command...');
      setErrorMessage('');
      vc.processBrainCommand(cmd.trim());
    }
  };

  const handleToggleMic = () => {
    const vc = getVoiceController();
    if (vc) {
      vc.setLanguage(language);
      if (!isListening) {
        setIsListening(true);
        setSpokenCommand('');
        setCommandOutput(strings.listening);
        setErrorMessage('');
        vc.start();
      } else {
        setIsListening(false);
        vc.stop();
      }
    }
  };

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
    setSpokenCommand('');
    setCommandOutput('');
    setErrorMessage('');
    const vc = getVoiceController();
    if (vc) {
      vc.setLanguage(langCode);
      vc.stop();
      setTimeout(() => {
        vc.start();
        setIsListening(true);
      }, 150);
    }
  };

  const currentShiftName = workerUser?.activeShift?.name || strings.noShift;
  const isAvailable = Boolean(workerUser?.isAvailable);

  return (
    <div
      translate="no"
      className="notranslate fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in cursor-pointer"
      onClick={onClose}
    >
      <div
        translate="no"
        className="notranslate w-full max-w-xl bg-[#13191C] border border-amber-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-5 max-h-[92vh] overflow-y-auto flex flex-col justify-between cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#F59E0B]">
              <Mic className="w-5 h-5 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#E4ECEC] flex items-center gap-2">
                <span>{strings.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F59E0B] font-bold">
                  2-WAY VOICE
                </span>
              </h3>
              <p className="text-[11px] text-[#8E9EA2]">{strings.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-[#8E9EA2] hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. WHAT WORK IS GOING ON */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E4ECEC]">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{strings.currentWork}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              {isAvailable ? strings.online : strings.offline}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold text-[#8E9EA2] block">
                {strings.partnerAndTrade}
              </span>
              {workerUser ? (
                <p className="font-semibold text-white truncate">
                  {workerUser.name} ({workerUser.category})
                </p>
              ) : (
                <p className="font-semibold text-amber-400 truncate">
                  {strings.notLoggedIn}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold text-[#8E9EA2] block">
                {strings.currentShift}
              </span>
              {workerUser ? (
                <p className="font-semibold text-amber-400 truncate">{currentShiftName}</p>
              ) : (
                <p className="font-semibold text-[#8E9EA2] truncate">{strings.noShift}</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#8E9EA2] italic pt-0.5">
            Comment: {isAvailable ? strings.commentOnline : strings.commentOffline}
          </p>
        </div>

        {/* Error Alert (if microphone permission or network error occurs) */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-red-300">{errorMessage}</p>
              <p className="text-[11px] text-[#8E9EA2]">
                Tip: You can also tap any command button below or type a command to execute it instantly.
              </p>
            </div>
          </div>
        )}

        {/* 2. LIVE COMMAND & OUTPUT STATUS */}
        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#334155] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {strings.statusTitle}
            </span>
            {isListening ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 animate-pulse bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Listening Live
              </span>
            ) : (
              <span className="text-[10px] text-[#8E9EA2] bg-white/[0.05] px-2 py-0.5 rounded-full">
                Standby
              </span>
            )}
          </div>

          <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/5">
            <div className="text-xs">
              <span className="text-[#8E9EA2] text-[11px] block sm:inline">{strings.commandGiven}</span>
              <span className="font-bold text-amber-300 ml-0 sm:ml-1 text-sm">
                {spokenCommand ? `"${spokenCommand}"` : '(Speak or tap a command below)'}
              </span>
            </div>

            <div className="text-xs text-emerald-300 flex items-start gap-1.5 pt-1 border-t border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block sm:inline">{strings.output}</strong>
                <span className="ml-0 sm:ml-1 text-emerald-300 font-medium">
                  {commandOutput || (isListening ? strings.listening : strings.tapPrompt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ONE-TAP INSTANT COMMANDS (GUARANTEES 100% RELIABILITY) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8E9EA2]">
            <span className="flex items-center gap-1 text-amber-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Tap to Test Any Command:</span>
            </span>
            <span className="text-[10px] text-[#8E9EA2]">9 Live Actions</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {QUICK_COMMANDS.map((qc) => (
              <button
                key={qc.command}
                type="button"
                onClick={() => runCommand(qc.command)}
                className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/40 text-[11px] font-medium text-[#E4ECEC] hover:text-white transition-all text-left truncate cursor-pointer active:scale-95 shadow-xs"
                title={`Say or tap: "${qc.command}"`}
              >
                {qc.label}
              </button>
            ))}
          </div>

          {/* Quick Command Typing Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedCommand.trim()) {
                runCommand(typedCommand);
                setTypedCommand('');
              }
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={typedCommand}
              onChange={(e) => setTypedCommand(e.target.value)}
              placeholder='Or type e.g. "workshifts", "my services", "set as available"...'
              className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-[#8E9EA2]/60 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm"
            >
              Run
            </button>
          </form>
        </div>

        {/* 4. WHAT I HAVE COMPLETED (EXECUTION LOG) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#8E9EA2] uppercase tracking-wider block">
            {strings.completedWork}
          </span>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {completedHistory.length === 0 ? (
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center text-xs text-[#8E9EA2]">
                {strings.noHistoryYet}
              </div>
            ) : (
              completedHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs hover:bg-white/[0.05] transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#E4ECEC] truncate">{item.title}</p>
                    <p className="text-[11px] text-emerald-400 truncate">Status: {item.comment}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-[#8E9EA2] shrink-0">
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. BOTTOM SECTION: TRANSLATOR SELECTOR & BIG MIC BUTTON */}
        <div className="pt-2 border-t border-white/[0.08] space-y-3">
          
          {/* Translator at the bottom */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#8E9EA2] flex items-center gap-1 shrink-0">
              <Globe className="w-3.5 h-3.5 text-slate-300" />
              {strings.translator}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              {SUPPORTED_LANGUAGES.slice(0, 5).map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelectLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    language === l.code
                      ? 'bg-amber-500/20 text-[#F59E0B] border border-amber-500/50 shadow-xs'
                      : 'bg-white/[0.04] text-[#8E9EA2] border border-white/[0.08] hover:text-white'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>

          {/* Big Mic Button at the bottom */}
          <div className="flex flex-col items-center justify-center pt-1">
            <button
              type="button"
              onClick={handleToggleMic}
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl relative group ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-400/40 scale-105'
                  : 'bg-gradient-to-tr from-amber-600 to-amber-400 text-[#0C1012] hover:scale-105 hover:shadow-amber-500/30'
              }`}
              title="Tap to Speak"
            >
              <Mic className={`w-8 h-8 ${isListening ? 'animate-bounce text-white' : 'text-[#0C1012]'}`} />
              {isListening && (
                <span className="absolute -inset-2 rounded-full border-2 border-red-500/50 animate-ping pointer-events-none" />
              )}
            </button>

            <p className="text-xs font-bold text-[#E4ECEC] pt-2">
              {isListening ? strings.tapToStop : strings.tapToSpeak}
            </p>
            <p className="text-[10px] text-[#8E9EA2]">{strings.profileHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
