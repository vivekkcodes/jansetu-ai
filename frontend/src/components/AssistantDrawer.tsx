import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Database, 
  ChevronRight,
  Mic,
  MicOff,
  Trash2,
  Copy,
  Check,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';

import { Language } from '../i18n/translations';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: string;
  lang?: Language;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: any[];
  suggested_actions?: string[];
  timestamp: string;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({ isOpen, onClose, selectedDistrict, lang = 'en' }) => {
  const [currentLang, setCurrentLang] = useState<Language>(lang);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const getInitialMessage = (l: Language): Message => ({
    id: 'initial',
    sender: 'assistant',
    text: l === 'hi' 
      ? "नमस्ते! मैं **JanSetu AI इंटेलिजेंस सहायक** हूँ, जो आपके सक्रिय प्रशासनिक इंफ्रास्ट्रक्चर डेटाबेस से सीधे जुड़ा हुआ है।\n\nमैं **प्राथमिकता रैंकिंग**, **जिलावार समस्याएं**, **PMGSY सड़क परियोजनाएं** और **शिकायत समाधान** पर लाइव डेटा से सटीक उत्तर देता हूँ।"
      : "Hello! I am **JanSetu Intelligence Assistant**, directly connected to your active municipal infrastructure database.\n\nI answer queries on **priority rankings**, **district bottlenecks**, **PMGSY public works**, and **complaint verification** with zero hallucination in both English and Hindi.",
    suggested_actions: l === 'hi' ? [
      "सबसे पहले किस विकास कार्य की जांच करनी चाहिए?",
      "गोरखपुर में पीने के पानी की क्या समस्या है?",
      "सक्रिय PMGSY सड़क परियोजनाओं की स्थिति क्या है?",
      "हॉटस्पॉट RD-2048 उच्च प्राथमिकता पर क्यों है?",
      "सड़क मरम्मत के बाद शिकायतों में कितनी कमी आई?"
    ] : [
      "Which development issue should the district investigate first?",
      "Show drinking water contamination hotspots in Gorakhpur.",
      "What is the status of active PMGSY road projects?",
      "Why is Hotspot RD-2048 high priority?",
      "Show verified complaint drop after road remediation."
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage(lang)]);

  useEffect(() => {
    setCurrentLang(lang);
  }, [lang]);

  useEffect(() => {
    // If only initial message is present, update it to the active language
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'initial') {
        return [getInitialMessage(currentLang)];
      }
      return prev;
    });
  }, [currentLang]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askAssistant(queryText, selectedDistrict !== 'All' ? selectedDistrict : undefined);
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: res.answer,
        citations: res.citations,
        suggested_actions: res.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: "I encountered an issue querying the development database. Please ensure backend services are running on port 8000.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(currentLang === 'hi' ? 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया टाइप करें।' : 'Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([getInitialMessage(currentLang)]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">JanSetu Intelligence AI</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live DB
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{currentLang === 'hi' ? 'नागरिक व प्रशासनिक AI सहायक' : 'Multilingual Civic Assistant'}</span>
              {selectedDistrict && selectedDistrict !== 'All' && (
                <span className="text-blue-400 font-semibold flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" /> {selectedDistrict}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentLang(currentLang === 'hi' ? 'en' : 'hi')}
            className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition cursor-pointer"
            title={currentLang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            {currentLang === 'hi' ? '🌐 English' : '🌐 हिन्दी'}
          </button>
          <button
            onClick={clearChat}
            title={currentLang === 'hi' ? 'बातचीत रीसेट करें' : 'Reset conversation'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title={currentLang === 'hi' ? 'बंद करें' : 'Close Assistant'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-xl p-3.5 text-xs leading-relaxed group relative ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium shadow-md'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/70 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed font-sans">{m.text}</div>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Grounding: Verified against {m.citations.length} live database records</span>
                </div>
              )}

              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    Recommended Follow-Ups:
                  </span>
                  {m.suggested_actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(act)}
                      className="w-full text-left p-1.5 rounded-lg bg-slate-900/80 hover:bg-blue-950/80 text-blue-300 hover:text-blue-200 text-[11px] border border-slate-700/70 hover:border-blue-600/50 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{act}</span>
                      <ChevronRight className="w-3 h-3 shrink-0 ml-1 opacity-70" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400/80 pt-1 border-t border-slate-700/40">
                <span className="font-mono">{m.timestamp}</span>
                {m.sender === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(m.id, m.text)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                    title="Copy response"
                  >
                    {copiedId === m.id ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl max-w-[80%]">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>{currentLang === 'hi' ? 'डेटाबेस से लाइव जानकारी खोजी जा रही है...' : 'Querying development database & calculating rankings...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListening 
                ? (currentLang === 'hi' ? "सुन रहे हैं... बोलिए" : "Listening... speak now") 
                : (currentLang === 'hi' ? "JanSetu AI से पूछें (हिंदी / अंग्रेजी)..." : "Ask JanSetu AI (English / Hindi)...")}
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder:text-slate-500 focus:outline-none transition ${
                isListening ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-700 focus:border-blue-500'
              }`}
            />
            <button
              type="button"
              onClick={toggleSpeech}
              title={isListening ? "Stop Voice Input" : "Speak your query (Speech to text)"}
              className={`absolute right-2 top-2 p-1 rounded-lg transition cursor-pointer ${
                isListening 
                  ? 'text-rose-400 bg-rose-500/20 animate-pulse' 
                  : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
