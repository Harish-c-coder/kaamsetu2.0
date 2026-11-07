import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VoiceInput({ onTranscript, initialLanguage = 'en' }) {
  const { t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState(
    initialLanguage === 'te' ? 'te-IN' : initialLanguage === 'hi' ? 'hi-IN' : 'en-IN'
  );
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    setErrorMessage('');
    setInterimText('');

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage(t.worker.voiceUnsupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedVoiceLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimText(interim);
        }

        if (finalTranscript) {
          onTranscript(finalTranscript);
          setInterimText('');
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permission in your browser settings.');
        } else if (event.error === 'no-speech') {
          // Normal timeout if user was quiet
        } else {
          setErrorMessage(`Speech recognition notice: ${event.error}. You can also type directly.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setErrorMessage('Could not activate microphone. Please type your description manually.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 sm:p-4 my-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Language selector for voice input */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-800" />
          <span className="text-xs font-bold text-gray-700">Voice Language:</span>
          <select
            value={selectedVoiceLang}
            onChange={(e) => setSelectedVoiceLang(e.target.value)}
            disabled={isListening}
            className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-gray-800 focus:outline-none focus:border-slate-800"
          >
            <option value="en-IN">English (India)</option>
            <option value="te-IN">తెలుగు (Telugu)</option>
            <option value="hi-IN">हिन्दी (Hindi)</option>
          </select>
        </div>

        {/* Action Button */}
        <div>
          {!isListening ? (
            <button
              type="button"
              onClick={startListening}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-black transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#F4A340]" />
              <span>Voice Typing ({selectedVoiceLang === 'te-IN' ? 'తెలుగు' : selectedVoiceLang === 'hi-IN' ? 'हिन्दी' : 'English'})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopListening}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold animate-voice-pulse cursor-pointer shadow-sm"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>{t.worker.voiceStop}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live recording indicator */}
      {isListening && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
          <span>{t.worker.voiceListening}</span>
          {interimText && (
            <span className="text-gray-600 italic font-normal ml-2">"{interimText}"</span>
          )}
        </div>
      )}

      {/* Unsupported or Error Messages */}
      {!isSupported && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{t.worker.voiceUnsupported}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
