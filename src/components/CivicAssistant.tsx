import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TabType } from '../types';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  FilePlus, 
  Calculator, 
  MapPin, 
  MessageSquare
} from 'lucide-react';

interface CivicAssistantProps {
  setActiveTab: (tab: TabType) => void;
}

export const CivicAssistant: React.FC<CivicAssistantProps> = ({ setActiveTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: 'Kusheh! I am your Bo Civic Assistant, trained on Bo District Council services, chiefdom guidelines, property rates, and community reports. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    "What are the 2026 property rate zones in Bo District?",
    "How do I report a broken water pump in Tikonko or Baoma?",
    "Where is the Bo District Council main office located?",
    "What are the market sanitation bylaws for chiefdom traders?",
    "Who is the Paramount Chief of Kakua Chiefdom?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          history: messages.slice(-6)
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.text || 'Thank you for contacting Bo District Council. Is there anything else you need?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Network response error');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Kusheh! I encountered a temporary connection glitch. You can still use the direct tools on the portal to calculate property rates or submit service requests.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800 font-bold">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Bo Civic Assistant (AI Guide)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Instant AI answers about chiefdom boundaries, rate payments, public health services, and council procedures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('report')}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            Submit Issue Report
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Rate Calculator
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
        {/* Chat Messages Container */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-emerald-950 shadow-sm'
                    : 'bg-emerald-900 text-white shadow'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-emerald-950 font-medium rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    msg.sender === 'user' ? 'text-emerald-950/70 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                Bo Civic Assistant is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Sample Prompts */}
        <div className="bg-white border-t border-slate-100 p-3 space-y-2">
          <div className="text-[11px] font-bold uppercase text-slate-400 px-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Citizen Prompts:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors whitespace-nowrap shrink-0"
                id={`assistant-sample-btn-${idx}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="bg-white p-3 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question about Bo District Council services, rates, or chiefdoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              id="assistant-chat-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs md:text-sm rounded-xl shadow transition-colors flex items-center gap-1.5 shrink-0"
              id="assistant-chat-send-btn"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
