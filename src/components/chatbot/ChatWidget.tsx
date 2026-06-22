'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "Bonjour ! 👋 Je suis l'assistant PayMaestro. Comment puis-je vous aider ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('paymaestro_token') : null;

      const res = await fetch(`${API_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: messageText, sessionId }),
      });

      const data = await res.json();

      if (data.success) {
        const botMessage: Message = {
          role: 'bot',
          content: data.data?.reply || "Désolé, je n'ai pas compris.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Erreur chatbot');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Désolé, le service est momentanément indisponible. Veuillez réessayer.',
          timestamp: new Date(),
        },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-all duration-300 flex items-center justify-center animate-bounce"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-violet-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">PayMaestro Assistant</h3>
                <p className="text-xs text-violet-200">En ligne</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
                  }`}
                >
                  {msg.content}
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-violet-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                disabled={loading}
              />
              <Button size="sm" onClick={sendMessage} disabled={loading || !input.trim()} className="rounded-xl">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}