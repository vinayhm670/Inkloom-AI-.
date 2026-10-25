import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  X,
  ShieldCheck,
  BookOpen,
  ArrowDown,
  Info,
  Radio,
  Headphones,
  MessageSquare,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { CopilotMessage, BrandProfile } from '../types';
import { sendCopilotMessage } from '../services/api';

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: BrandProfile[];
  initialPrompt?: string;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({
  isOpen,
  onClose,
  brands,
  initialPrompt,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    brands.find((b) => b.isDemo)?.id || brands[0]?.id || ''
  );
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `### Welcome to **INKLOOM Copilot & Voice Assistant** 👋

I am your real-time brand governance AI assistant. I can:
- **Audit Drafts:** Check copy against verified facts (like **Fact ID F-014** 99.9% uptime SLA) and prohibited terminology.
- **Explain Governance Findings:** Breakdown why specific superlatives or names like *"Acme Cloud"* are flagged.
- **Generate Compliant Copy:** Suggest compliant marketing headlines and ad copy.
- **Voice Assistant:** Tap the **Voice Assistant** tab or microphone to talk hands-free!

Try asking one of the suggested prompts below, or start a voice query!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourcesCited: ['INKLOOM Governance Engine', 'Brand Facts Repository'],
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice Assistant states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [ttsPlayingId, setTtsPlayingId] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(true);
  const [continuousVoice, setContinuousVoice] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Suggested prompt pills
  const suggestedPrompts = [
    "Audit this: 'Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.'",
    'What is the approved uptime SLA for Acme Vault and Fact ID?',
    'Suggest 3 compliant headlines for Acme Vault security launch',
    'Explain the 8-step brand governance workflow',
    'Write a Python function to check text contrast ratio (WCAG 4.5:1)',
  ];

  // Prevent background scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
        setVoiceTranscript(transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setVoiceStatus('idle');
      };

      rec.onend = () => {
        setIsRecording(false);
        if (voiceTranscript.trim() && mode === 'voice') {
          // Auto send recognized speech in voice mode
          handleSendMessage(voiceTranscript);
        } else {
          setVoiceStatus('idle');
        }
      };

      recognitionRef.current = rec;
    }
  }, [mode, voiceTranscript]);

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputMessage(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPrompt, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && mode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, mode]);

  // Voice recognition toggle
  const toggleRecording = () => {
    if (!speechSupported) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setVoiceStatus('idle');
    } else {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          setTtsPlayingId(null);
        }
        setVoiceTranscript('');
        recognitionRef.current?.start();
        setIsRecording(true);
        setVoiceStatus('listening');
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setIsRecording(false);
        setVoiceStatus('idle');
      }
    }
  };

  // Text-to-Speech toggle
  const toggleSpeechPlayback = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (ttsPlayingId === msgId) {
      window.speechSynthesis.cancel();
      setTtsPlayingId(null);
      setVoiceStatus('idle');
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleanText = text
        .replace(/#+\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`{1,3}[^`]*`{1,3}/g, 'code snippet')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.startsWith('en')
      );
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => {
        setTtsPlayingId(msgId);
        setVoiceStatus('speaking');
      };
      utterance.onend = () => {
        setTtsPlayingId(null);
        setVoiceStatus('idle');
        if (continuousVoice && mode === 'voice') {
          setTimeout(() => toggleRecording(), 400);
        }
      };
      utterance.onerror = () => {
        setTtsPlayingId(null);
        setVoiceStatus('idle');
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop TTS on close
  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTtsPlayingId(null);
      setVoiceStatus('idle');
    }
  }, [isOpen]);

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      brandId: selectedBrandId,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setVoiceStatus('processing');

    try {
      const response = await sendCopilotMessage(
        [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: text },
        ],
        selectedBrandId
      );

      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        brandId: selectedBrandId,
        sourcesCited: response.sourcesCited,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If auto-speak or voice mode is enabled, read response aloud
      if ((mode === 'voice' || autoSpeakEnabled) && 'speechSynthesis' in window) {
        toggleSpeechPlayback(assistantMsg.id, assistantMsg.content);
      } else {
        setVoiceStatus('idle');
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: CopilotMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `**Notice:** ${err.message || 'Unable to connect to Copilot service. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setVoiceStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewConversation = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTtsPlayingId(null);
      setVoiceStatus('idle');
    }
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: `### New Conversation Started 🔄\n\nAsk me any brand governance or general question. I have full context on **${
          brands.find((b) => b.id === selectedBrandId)?.name || 'Acme Vault'
        }**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in touch-none">
      <div className="w-full h-[100dvh] sm:h-[88vh] sm:max-h-[820px] sm:max-w-2xl bg-slate-950 border-0 sm:border sm:border-slate-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header - Fixed & Touch Safe */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white">INKLOOM Copilot</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-mono">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Brand facts &amp; real-time voice intelligence
              </p>
            </div>
          </div>

          {/* Mode Switcher: Chat vs Voice Assistant */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMode('chat')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                mode === 'chat'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Chat</span>
            </button>
            <button
              onClick={() => setMode('voice')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                mode === 'voice'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-yellow-300" />
              <span>Voice</span>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Brand Context Switcher */}
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] sm:text-[11px] font-medium text-slate-200 focus:outline-none max-w-[90px] sm:max-w-none"
              title="Target Brand Knowledge Context"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* New Conversation Button */}
            <button
              onClick={handleNewConversation}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Start New Conversation"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VIEW 1: DEDICATED FULL-SCREEN VOICE ASSISTANT */}
        {mode === 'voice' ? (
          <div className="flex-1 flex flex-col justify-between items-center p-6 text-center space-y-6 overflow-y-auto">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Interactive Voice Assistant
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
                Talk to INKLOOM AI
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Ask about Acme Vault facts, audit marketing statements, or request compliant headlines aloud.
              </p>
            </div>

            {/* Voice Audio Waveform Visualizer & Central Orb */}
            <div className="relative flex flex-col items-center justify-center my-4">
              {/* Outer Pulsing Waves */}
              <div
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-300 ${
                  voiceStatus === 'listening'
                    ? 'bg-rose-500/20 ring-8 ring-rose-500/30 animate-pulse'
                    : voiceStatus === 'speaking'
                    ? 'bg-sky-500/20 ring-8 ring-sky-500/30'
                    : voiceStatus === 'processing'
                    ? 'bg-indigo-500/20 ring-8 ring-indigo-500/30 animate-spin-slow'
                    : 'bg-slate-900 border border-slate-800'
                }`}
              >
                {/* Central Button */}
                <button
                  onClick={toggleRecording}
                  disabled={!speechSupported}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer ${
                    voiceStatus === 'listening'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white scale-105'
                      : voiceStatus === 'speaking'
                      ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
                      : voiceStatus === 'processing'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 text-white hover:scale-105'
                  }`}
                  aria-label="Voice Assistant Microphone"
                >
                  {voiceStatus === 'listening' ? (
                    <MicOff className="w-8 h-8" />
                  ) : voiceStatus === 'speaking' ? (
                    <Volume2 className="w-8 h-8 animate-pulse" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                    {voiceStatus === 'listening'
                      ? 'Listening'
                      : voiceStatus === 'speaking'
                      ? 'Speaking'
                      : voiceStatus === 'processing'
                      ? 'Thinking'
                      : 'Tap to Speak'}
                  </span>
                </button>
              </div>

              {/* Soundwave bars active when listening or speaking */}
              {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
                <div className="flex items-center gap-1.5 mt-6 h-8">
                  <div className="w-1.5 h-6 bg-sky-400 rounded-full animate-voice-bar-1" />
                  <div className="w-1.5 h-8 bg-indigo-400 rounded-full animate-voice-bar-2" />
                  <div className="w-1.5 h-5 bg-purple-400 rounded-full animate-voice-bar-3" />
                  <div className="w-1.5 h-7 bg-emerald-400 rounded-full animate-voice-bar-4" />
                  <div className="w-1.5 h-6 bg-sky-400 rounded-full animate-voice-bar-5" />
                </div>
              )}
            </div>

            {/* Live Transcript & Spoken Answer Box */}
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                  <span>
                    {voiceStatus === 'listening'
                      ? 'Live Speech Transcription:'
                      : voiceStatus === 'speaking'
                      ? 'Spoken Assistant Response:'
                      : 'Voice Transcript Preview:'}
                  </span>
                </span>
                {voiceStatus === 'speaking' && (
                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                      setTtsPlayingId(null);
                      setVoiceStatus('idle');
                    }}
                    className="text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Stop Audio
                  </button>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-sans text-slate-200 min-h-[64px] max-h-36 overflow-y-auto leading-relaxed text-xs sm:text-sm">
                {voiceTranscript ? (
                  <span>&quot;{voiceTranscript}&quot;</span>
                ) : latestAssistantMsg && voiceStatus === 'speaking' ? (
                  <span>{latestAssistantMsg.content.slice(0, 240)}...</span>
                ) : (
                  <span className="text-slate-500 italic">
                    Tap the microphone button above and say: &quot;What is the approved SLA for Acme Vault?&quot;
                  </span>
                )}
              </div>
            </div>

            {/* Quick Voice Command Chips */}
            <div className="w-full max-w-md space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block text-center">
                Try saying or tapping:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  "Audit the Acme Cloud sample statement",
                  "What is Fact F-014 uptime SLA?",
                  "Suggest 3 compliant headlines",
                  "Explain the 8-step workflow",
                ].map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(cmd)}
                    className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500 hover:bg-slate-800 text-[11px] text-slate-300 transition-colors cursor-pointer"
                  >
                    🗣️ {cmd}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-4 pt-2">
              <span>Web Speech API Speech-to-Text &amp; Voice Synthesis</span>
              <button
                onClick={() => setMode('chat')}
                className="text-sky-400 underline font-semibold"
              >
                Switch to Text Chat
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: REGULAR CHAT INTERFACE WITH FULL MOBILE ADAPTATION */
          <>
            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 text-xs scroll-smooth">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 leading-relaxed ${
                        isUser
                          ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-sm shadow-md'
                          : msg.isError
                          ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {/* Markdown Text */}
                      <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed break-words">
                        {msg.content}
                      </div>

                      {/* Sources Cited */}
                      {!isUser && msg.sourcesCited && msg.sourcesCited.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                          <BookOpen className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="font-semibold text-slate-300">Sources:</span>
                          {msg.sourcesCited.map((src, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-sky-300 truncate max-w-[200px]"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Controls (Copy & TTS) */}
                    {!isUser && (
                      <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {'speechSynthesis' in window && (
                          <button
                            onClick={() => toggleSpeechPlayback(msg.id, msg.content)}
                            className={`hover:text-slate-300 flex items-center gap-1 transition-colors ${
                              ttsPlayingId === msg.id ? 'text-sky-400 font-semibold' : ''
                            }`}
                            title="Read aloud"
                          >
                            {ttsPlayingId === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3 text-sky-400 animate-pulse" />
                                <span>Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}

                        <span>{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Skeleton */}
              {isLoading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs w-fit">
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  <span>INKLOOM Copilot is reasoning with brand context...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Pills (only if 1 or 2 messages) */}
            {messages.length <= 2 && (
              <div className="px-3 sm:px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex items-center gap-2 shrink-0 scrollbar-none">
                <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                  Suggestions:
                </span>
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800 text-[11px] text-slate-300 whitespace-nowrap transition-colors shrink-0"
                  >
                    {p.length > 40 ? p.substring(0, 40) + '...' : p}
                  </button>
                ))}
              </div>
            )}

            {/* Composer Input Bar - Sticky & Safe on Mobile */}
            <div className="p-2.5 sm:p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 space-y-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {/* Active Voice Recording Notice */}
              {isRecording && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Listening... Speak your prompt</span>
                  </div>
                  <button
                    onClick={toggleRecording}
                    className="text-[11px] font-bold underline hover:text-white"
                  >
                    Stop
                  </button>
                </div>
              )}

              <div className="flex items-end gap-1.5 sm:gap-2 bg-slate-950 rounded-xl border border-slate-700 focus-within:border-sky-500 p-1.5 sm:p-2 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask Copilot or audit marketing copy..."
                  className="flex-1 bg-transparent text-slate-100 text-xs sm:text-sm focus:outline-none resize-none max-h-28 leading-relaxed px-1 min-h-[36px]"
                />

                {/* Voice Input Microphone */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isRecording ? 'Stop recording' : 'Voice Assistant (Speech to Text)'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-400" />}
                  </button>
                )}

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:opacity-40 disabled:hover:bg-sky-500 transition-all cursor-pointer shadow-sm shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                <button
                  onClick={() => setMode('voice')}
                  className="text-sky-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Switch to Hands-Free Voice Assistant</span>
                </button>
                <span className="hidden sm:inline">Shift + Enter for new lines</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
