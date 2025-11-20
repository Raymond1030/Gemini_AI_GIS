import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  onSearch: (query: string) => void;
  onGenerate: (prompt: string) => void;
  loading: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'system';
  text: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSearch, onGenerate, loading }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'search' | 'generate'>('search');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', text: "Welcome to NeuroMap. I can help you find places or generate map layers. Try 'Find coffee shops' or switch mode to generate geometry." }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);

    if (mode === 'search') {
      onSearch(input);
    } else {
      onGenerate(input);
    }

    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode Toggle */}
      <div className="flex bg-slate-800 p-1 rounded-lg mb-4">
        <button
          onClick={() => setMode('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
            mode === 'search' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin size={14} /> Find Places
        </button>
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
            mode === 'generate' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} /> Gen Layer
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? mode === 'search' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-xs text-slate-400">Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'search' ? "Find restaurants, parks..." : "Draw a polygon around..."}
          className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl pl-4 pr-12 py-3 text-sm border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;