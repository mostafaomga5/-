import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  X,
  ArrowUpRight,
  Compass,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  textAr: string;
  textEn: string;
  followUpChipsAr?: string[];
  matchedItems?: Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
    badgeAr: string;
    badgeEn: string;
    route: string;
  }>;
  recommendation?: {
    categoryTitleAr: string;
    categoryTitleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    buttonLabelAr: string;
    buttonLabelEn: string;
    targetRoute: string;
  };
}

interface AssistantThread {
  id: string;
  titleAr: string;
  updatedAt: string;
  messages: ChatMessage[];
}

interface SmartPlasticoAssistantProps {
  mode?: 'floating' | 'embedded';
}

export const PlasticoRobotAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const dim =
    size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  return (
    <div
      className={`${dim} relative rounded-full bg-gradient-to-br from-[#1769E8] via-[#0B2A5B] to-[#071A33] p-0.5 shadow-md flex items-center justify-center shrink-0 border border-[#27BED6]/60`}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <line x1="32" y1="8" x2="32" y2="15" stroke="#27BED6" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="7" r="3.5" fill="#FF8A2A" />
        <rect
          x="13"
          y="15"
          width="38"
          height="32"
          rx="14"
          fill="#F8FAFC"
          stroke="#1769E8"
          strokeWidth="2.5"
        />
        <rect x="8" y="25" width="5" height="12" rx="2.5" fill="#FF8A2A" />
        <rect x="51" y="25" width="5" height="12" rx="2.5" fill="#FF8A2A" />
        <rect x="18" y="22" width="28" height="15" rx="7" fill="#071A33" />
        <circle cx="25.5" cy="29.5" r="3.2" fill="#27BED6" />
        <circle cx="38.5" cy="29.5" r="3.2" fill="#27BED6" />
        <circle cx="26.5" cy="28.5" r="1" fill="#FFFFFF" />
        <circle cx="39.5" cy="28.5" r="1" fill="#FFFFFF" />
        <path
          d="M27 41 Q32 44.5 37 41"
          stroke="#1769E8"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// Kept as a safe no-op for backward compatibility; assistant never auto-opens
export function triggerAssistantWelcomeIntro() {
  // Intentionally empty: Smart Assistant stays closed until explicitly clicked by the user.
}

function buildWelcomeMessage(userName?: string): ChatMessage {
  const cleanName = userName?.trim();
  return {
    id: 'welcome-1',
    sender: 'assistant',
    textAr: cleanName
      ? `أهلاً بك يا ${cleanName} في PLASTICO! إزيك النهاردة؟ أنا مساعدك الصناعي الذكي — تقدر تسألني بأي لهجة عن ماكينات الحقن والنفخ والسحب، خامات البوليمر، الموردين، الفنيين، أو تشخيص الأعطال، وهعرض لك النتائج الحقيقية من قاعدة البيانات فوراً.`
      : 'أهلاً بك في PLASTICO! أنا مساعدك الصناعي الذكي. تقدر تدردش معايا طبيعي أو تسألني عن ماكينات، خامات PP/PE/PET، موردين، فنيين، أو أعطال الماكينات وهعرض لك النتائج فوراً. تحب أتعرف باسمك الكريم؟',
    textEn: cleanName
      ? `Welcome back, ${cleanName}! How are you doing today? Ask me naturally about machinery, polymer resins, suppliers, technicians, or machine faults and I will query the live PLASTICO database for you.`
      : 'Welcome to PLASTICO! I am your conversational AI industrial assistant. Ask me about machinery, polymer resins, suppliers, technicians, or troubleshooting and I will fetch live results immediately.',
    followUpChipsAr: [
      'عامل إيه؟ إيه خدمات بلاستيكو؟',
      'عايز ماكينة حقن مستعملة',
      'عايز مورد خامة PP',
      'محتاج فني صيانة ماكينات حقن',
    ],
  };
}

export const SmartPlasticoAssistant: React.FC<SmartPlasticoAssistantProps> = ({
  mode = 'floating',
}) => {
  const { lang, t, realUser } = usePlastico();
  const navigate = useNavigate();

  // Strictly false by default; never opens automatically
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThreadsList, setShowThreadsList] = useState(false);

  // Remembered guest name if not logged in
  const [rememberedName, setRememberedName] = useState<string>(() => {
    try {
      return localStorage.getItem('plastico_assistant_guest_name_v1') || '';
    } catch {
      return '';
    }
  });

  const activeUserName = realUser?.name || rememberedName || '';
  const storageKey = `plastico_assistant_threads_v3_${realUser?.id || 'guest'}`;

  const [threads, setThreads] = useState<AssistantThread[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'thread-default',
        titleAr: 'المحادثة الحالية',
        updatedAt: 'الآن',
        messages: [buildWelcomeMessage(activeUserName)],
      },
    ];
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    return threads[0]?.id || 'thread-default';
  });

  // Voice Input & TTS state (strictly opt-in)
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const hasUserInteractedRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          return;
        }
      }
    } catch {
      // ignore
    }
    const initialThread: AssistantThread = {
      id: 'thread-default',
      titleAr: 'المحادثة الحالية',
      updatedAt: 'الآن',
      messages: [buildWelcomeMessage(realUser?.name || rememberedName)],
    };
    setThreads([initialThread]);
    setActiveThreadId(initialThread.id);
  }, [storageKey, realUser?.name, rememberedName]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(threads.slice(0, 10)));
    } catch {
      // ignore
    }
  }, [threads, storageKey]);

  const currentThread =
    threads.find((th) => th.id === activeThreadId) || threads[0];
  const messages = currentThread?.messages || [buildWelcomeMessage(activeUserName)];

  useEffect(() => {
    // Strictly scroll ONLY the internal chat container when the user has sent/received a message.
    // Never call scrollIntoView(), which would scroll the entire browser document/window.
    if (!hasUserInteractedRef.current) return;
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, loading]);

  const ArrowIcon = lang === 'ar' ? ChevronLeft : ChevronRight;

  const speakReplyIfEnabled = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const startNewThread = () => {
    const newId = `thread-${Date.now()}`;
    const newThread: AssistantThread = {
      id: newId,
      titleAr: 'محادثة جديدة',
      updatedAt: 'الآن',
      messages: [buildWelcomeMessage(activeUserName)],
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
    setShowThreadsList(false);
  };

  const clearHistory = () => {
    const fresh: AssistantThread = {
      id: 'thread-default',
      titleAr: 'المحادثة الحالية',
      updatedAt: 'الآن',
      messages: [buildWelcomeMessage(activeUserName)],
    };
    setThreads([fresh]);
    setActiveThreadId(fresh.id);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const updateCurrentThreadMessages = (
    updater: (prevMsgs: ChatMessage[]) => ChatMessage[],
    newTitleCandidate?: string
  ) => {
    setThreads((prev) =>
      prev.map((th) => {
        if (th.id !== currentThread.id) return th;
        const nextMsgs = updater(th.messages);
        return {
          ...th,
          titleAr:
            th.titleAr === 'المحادثة الحالية' || th.titleAr === 'محادثة جديدة'
              ? newTitleCandidate?.slice(0, 32) || th.titleAr
              : th.titleAr,
          updatedAt: 'الآن',
          messages: nextMsgs.slice(-30),
        };
      })
    );
  };

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;
    hasUserInteractedRef.current = true;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      textAr: trimmed,
      textEn: trimmed,
    };

    const historyPayload = messages.slice(-8).map((m) => ({
      sender: m.sender,
      text: lang === 'ar' ? m.textAr : m.textEn,
    }));
    const userMessageCount = messages.filter((m) => m.sender === 'user').length;

    updateCurrentThreadMessages((prev) => [...prev, userMsg], trimmed);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          historyCount: userMessageCount,
          history: historyPayload,
          userName: activeUserName || undefined,
          userRole: realUser?.accountType || undefined,
          userCity: realUser?.city || undefined,
          userCountry: realUser?.country || undefined,
        }),
      });
      const data = await res.json();

      if (data.detectedUserName && !realUser?.name) {
        setRememberedName(data.detectedUserName);
        try {
          localStorage.setItem(
            'plastico_assistant_guest_name_v1',
            String(data.detectedUserName)
          );
        } catch {
          // ignore
        }
      }

      const replyAr =
        data.replyAr ||
        'أهلاً بك! لقد حددت لك القسم والنتائج الأنسب لطلبك داخل منصة بلاستيكو:';
      const replyEn =
        data.replyEn ||
        'I have identified the best PLASTICO results and section for your request:';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        textAr: replyAr,
        textEn: replyEn,
        followUpChipsAr: Array.isArray(data.followUpQuestionsAr)
          ? data.followUpQuestionsAr.slice(0, 3)
          : undefined,
        matchedItems: Array.isArray(data.matchedItems)
          ? data.matchedItems
          : undefined,
        recommendation: data.recommendation || undefined,
      };
      updateCurrentThreadMessages((prev) => [...prev, botMsg]);
      speakReplyIfEnabled(lang === 'ar' ? replyAr : replyEn);
    } catch {
      updateCurrentThreadMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'assistant',
          textAr: 'أهلاً بك! يمكنك الانتقال مباشرة إلى السوق الصناعي أو دليل الموردين من البطاقة التالية:',
          textEn: 'You can go directly to the Industrial Marketplace from the card below:',
          recommendation: {
            categoryTitleAr: 'السوق الصناعي المتكامل',
            categoryTitleEn: 'Industrial Marketplace',
            descriptionAr: 'تصفح الماكينات، السخانات، الخامات، والمعدات المساعدة.',
            descriptionEn: 'Browse machinery, heaters, raw materials, and auxiliary gear.',
            buttonLabelAr: 'افتح السوق الصناعي',
            buttonLabelEn: 'Open Marketplace',
            targetRoute: '/app/market',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderConversationPanel = () => (
    <div
      data-testid="smart-assistant-panel"
      className="bg-white rounded-2xl border border-[#DFE7F1] shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#071A33] text-white px-3.5 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <PlasticoRobotAvatar size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
                {t('مساعد بلاستيكو الذكي', 'PLASTICO Smart Assistant')}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              {activeUserName
                ? t(`مرحباً ${activeUserName} • متصل بقاعدة البيانات`, `Hi ${activeUserName} • Connected to DB`)
                : t('محادثة ذكية وبحث مباشر في قاعدة البيانات', 'Natural AI chat & live DB search')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={startNewThread}
            title={t('محادثة جديدة', 'New conversation')}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {threads.length > 1 && (
            <button
              type="button"
              onClick={() => setShowThreadsList((p) => !p)}
              title={t('سجل المحادثات', 'Saved threads')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showThreadsList
                  ? 'bg-[#1769E8] text-white'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const next = !ttsEnabled;
              setTtsEnabled(next);
              if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            title={t('قراءة الردود صوتياً (اختياري)', 'Read replies aloud (optional)')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              ttsEnabled
                ? 'bg-[#27BED6] text-[#071A33]'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            {ttsEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
          {messages.length > 1 && (
            <button
              type="button"
              onClick={clearHistory}
              title={t('مسح المحادثة', 'Clear chat')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {mode === 'floating' && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label={t('إغلاق المساعد', 'Close assistant')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Saved Threads Selector Drawer */}
      {showThreadsList && (
        <div className="bg-[#0B2240] text-white px-3 py-2.5 border-b border-white/10 space-y-1.5 max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#27BED6]">
            <span>{t('محادثاتك السابقة مع المساعد:', 'Your Conversation Threads:')}</span>
            <button
              type="button"
              onClick={startNewThread}
              className="text-[#FF8A2A] hover:underline font-extrabold cursor-pointer"
            >
              {t('+ محادثة جديدة', '+ New Chat')}
            </button>
          </div>
          {threads.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => {
                setActiveThreadId(th.id);
                setShowThreadsList(false);
              }}
              className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between gap-2 cursor-pointer ${
                th.id === currentThread.id
                  ? 'bg-[#1769E8] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200'
              }`}
            >
              <span className="truncate">{th.titleAr}</span>
              <span className="text-[10px] opacity-75 shrink-0">
                {th.messages.length} {t('رسائل', 'msgs')}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="p-3.5 sm:p-4 space-y-3 max-h-[340px] sm:max-h-[390px] overflow-y-auto bg-[#F4F7FC]"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[94%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#1769E8] text-white font-semibold'
                  : 'bg-white text-[#13243B] border border-[#DFE7F1] shadow-2xs font-medium'
              }`}
            >
              <p className="break-words whitespace-pre-line">
                {lang === 'ar' ? m.textAr : m.textEn}
              </p>

              {/* Live Matched Results */}
              {m.matchedItems && m.matchedItems.length > 0 && (
                <div className="mt-2.5 space-y-2" data-testid="assistant-matched-items">
                  {m.matchedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (mode === 'floating') setIsOpen(false);
                        navigate(item.route);
                      }}
                      className="w-full text-start p-2.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/80 border border-[#DFE7F1] hover:border-[#1769E8] transition-all flex items-start justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold text-[#071A33] leading-snug">
                          {lang === 'ar' ? item.titleAr : item.titleEn}
                        </div>
                        <div className="text-[11px] text-[#718096] mt-0.5 leading-snug">
                          {lang === 'ar' ? item.subtitleAr : item.subtitleEn}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#1769E8]/10 text-[#1769E8] text-[10px] font-extrabold shrink-0">
                        {lang === 'ar' ? item.badgeAr : item.badgeEn}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {m.recommendation && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#071A33] text-white border border-[#1769E8]/40">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#27BED6] mb-1">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t('توجيه مباشر مع تطبيق الفلتر', 'Direct Filtered Action')}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">
                    {lang === 'ar'
                      ? m.recommendation.categoryTitleAr
                      : m.recommendation.categoryTitleEn}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {lang === 'ar'
                      ? m.recommendation.descriptionAr
                      : m.recommendation.descriptionEn}
                  </p>
                  <button
                    type="button"
                    data-testid="assistant-action-btn"
                    onClick={() => {
                      const route = m.recommendation!.targetRoute;
                      if (mode === 'floating') setIsOpen(false);
                      navigate(route);
                    }}
                    className="mt-2.5 w-full py-2 px-3 rounded-lg bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>
                      {lang === 'ar'
                        ? m.recommendation.buttonLabelAr
                        : m.recommendation.buttonLabelEn}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {m.followUpChipsAr && m.followUpChipsAr.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {m.followUpChipsAr.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => void sendMessage(chip)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#1769E8] hover:text-white text-[#13243B] border border-[#DFE7F1] text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{chip}</span>
                    <ArrowIcon className="w-3 h-3 opacity-70" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#DFE7F1] text-xs font-bold text-[#718096]">
            <span className="w-2 h-2 rounded-full bg-[#1769E8] animate-pulse" />
            <span>{t('يكتب المساعد الرد الآن...', 'Assistant is typing...')}</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(inputValue);
        }}
        className="p-2.5 sm:p-3 bg-white border-t border-[#DFE7F1] flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={toggleVoiceInput}
          title={t('التحدث بالصوت (عند الضغط فقط)', 'Voice input (on click only)')}
          className={`p-2 rounded-xl border transition-colors shrink-0 cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
              : 'bg-[#F4F7FC] hover:bg-slate-200 text-[#13243B] border-[#DFE7F1]'
          }`}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4 text-[#1769E8]" />
          )}
        </button>
        <input
          type="text"
          data-testid="assistant-chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t(
            'تحدث طبيعياً أو ابحث (مثال: أهلاً، محتاج ماكينة حقن)...',
            'Chat naturally or search (e.g., Hello, I need an injection machine)...'
          )}
          className="flex-1 bg-[#F4F7FC] border border-[#DFE7F1] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#13243B] placeholder:text-[#718096] focus:outline-none focus:border-[#1769E8]"
        />
        <button
          type="submit"
          data-testid="assistant-send-btn"
          disabled={loading || !inputValue.trim()}
          className="px-3.5 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
        >
          <span>{t('إرسال', 'Send')}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );

  if (mode === 'embedded') {
    return renderConversationPanel();
  }

  return (
    <div className="fixed bottom-20 lg:bottom-5 end-3.5 sm:end-5 z-40 flex flex-col items-end">
      {isOpen ? (
        <div className="w-[calc(100vw-1.75rem)] sm:w-[385px] max-w-[385px]">
          {renderConversationPanel()}
        </div>
      ) : (
        <button
          type="button"
          data-testid="open-assistant-fab"
          onClick={() => setIsOpen(true)}
          aria-label={t('فتح مساعد بلاستيكو الذكي', 'Open PLASTICO Smart Assistant')}
          title={t('مساعد بلاستيكو الذكي', 'PLASTICO Smart Assistant')}
          className="group relative w-12 h-12 rounded-full bg-[#071A33] hover:bg-[#0D284D] shadow-lg border-2 border-[#27BED6]/70 flex items-center justify-center transition-transform duration-200 hover:scale-105 cursor-pointer"
        >
          <PlasticoRobotAvatar size="md" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#071A33]" />
        </button>
      )}
    </div>
  );
};

export default SmartPlasticoAssistant;
