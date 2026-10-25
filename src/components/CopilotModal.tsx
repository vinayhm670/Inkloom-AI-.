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
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `### Welcome to **INKLOOM Copilot** 👋

I am your real-time brand governance and AI copilot. I can:
- **Audit Drafts:** Check copy against verified facts (like **Fact ID F-014** 99.9% uptime SLA) and prohibited terminology.
- **Explain Governance Findings:** Breakdown why specific superlatives or names like *"Acme Cloud"* are flagged.
- **Generate Compliant Copy:** Suggest compliant marketing headlines and ad copy.
- **Answer General Questions:** Help with programming, debugging code, summarizing text, or technical explanations.

Try asking one of the suggested prompts below, or type your own question!`,
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
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

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
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Voice recognition toggle
  const toggleRecording = () => {
    if (!speechSupported) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  // Text-to-Speech toggle
  const toggleSpeechPlayback = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (ttsPlayingId === msgId) {
      window.speechSynthesis.cancel();
      setTtsPlayingId(null);
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
      utterance.onend = () => setTtsPlayingId(null);
      utterance.onerror = () => setTtsPlayingId(null);
      setTtsPlayingId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop TTS on close
  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTtsPlayingId(null);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full h-full sm:h-[88vh] sm:max-h-[820px] sm:max-w-2xl bg-slate-950 border border-slate-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">INKLOOM Copilot</span>
                <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-mono">
                  LIVE AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Grounding against verified company facts &amp; policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Brand Context Switcher */}
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-200 focus:outline-none"
              title="Target Brand Knowledge Context"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  Context: {b.name}
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

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scroll-smooth">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 leading-relaxed ${
                    isUser
                      ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-sm shadow-md'
                      : msg.isError
                      ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {/* Clean Markdown renderer for text */}
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Sources Cited */}
                  {!isUser && msg.sourcesCited && msg.sourcesCited.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                      <BookOpen className="w-3 h-3 text-sky-400" />
                      <span className="font-semibold text-slate-300">Sources:</span>
                      {msg.sourcesCited.map((src, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-sky-300"
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
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
              Suggestions:
            </span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800 text-[11px] text-slate-300 whitespace-nowrap transition-colors"
              >
                {p.length > 45 ? p.substring(0, 45) + '...' : p}
              </button>
            ))}
          </div>
        )}

        {/* Composer Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur shrink-0 space-y-2">
          {/* Active Voice Recording Notice */}
          {isRecording && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Listening... Speak your prompt or query</span>
              </div>
              <button
                onClick={toggleRecording}
                className="text-[11px] font-bold underline hover:text-white"
              >
                Stop
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-slate-950 rounded-xl border border-slate-700 focus-within:border-sky-500 p-2 transition-colors">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask Copilot anything or audit marketing copy... (Enter to send, Shift+Enter for newline)"
              className="flex-1 bg-transparent text-slate-100 text-xs sm:text-sm focus:outline-none resize-none max-h-32 leading-relaxed px-1"
            />

            {/* Voice Input Microphone */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input (Speech to Text)'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:opacity-40 disabled:hover:bg-sky-500 transition-all cursor-pointer shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>Powered by Gemini 3.8 Flash &amp; INKLOOM RAG</span>
            <span>Shift + Enter for new lines</span>
          </div>
        </div>
      </div>
    </div>
  );
};
