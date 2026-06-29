'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Paperclip, Image, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  images?: { data: string; mimeType: string; filename: string }[];
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "Je suis PayMaestro Assistant, le chatbot officiel de PayMaestro. Je suis là pour vous aider à utiliser nos services financiers (portefeuille, transferts, retraits, etc.) et répondre à vos questions. L'IA peut faire des erreurs. Veuillez vérifier les informations importantes.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [allPreviews, setAllPreviews] = useState<string[]>([]);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gérer la sélection d'images (avec accumulation)
  const handleImageSelect = (files: FileList) => {
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const file = files[i];
      
      // Vérifier si on ne dépasse pas 10 au total
      if (allFiles.length + newFiles.length >= 10) break;
      
      newFiles.push(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        // Mettre à jour quand tous les fichiers sont lus
        if (newPreviews.length === newFiles.length) {
          setAllFiles(prev => [...prev, ...newFiles].slice(0, 10));
          setAllPreviews(prev => [...prev, ...newPreviews].slice(0, 10));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer une image spécifique
  const removeImage = (index: number) => {
    setAllFiles(prev => prev.filter((_, i) => i !== index));
    setAllPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Envoyer toutes les images
  const handleSendImages = async () => {
    if (allFiles.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    allFiles.forEach(file => {
      formData.append('screenshots', file);
    });
    formData.append('context', input || 'Problème utilisateur');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

    try {
      const res = await fetch(`${API_URL}/chatbot/upload-screenshots`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'user',
            content: `📸 ${allFiles.length} image(s) envoyée(s)${input ? ': ' + input : ''}`,
            timestamp: new Date(),
            images: allFiles.map((file, i) => ({
              data: allPreviews[i],
              mimeType: file.type,
              filename: file.name,
            })),
          },
          {
            role: 'bot',
            content: data.data?.reply || 'Images reçues. Analyse en cours...',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Erreur upload images:', error);
    }

    setAllFiles([]);
    setAllPreviews([]);
    setInput('');
    setUploading(false);
  };

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
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : null;

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
          {/* Header */}
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

          {/* Messages */}
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
                  {/* Afficher les images dans le message */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.images.map((img, j) => (
                        <img
                          key={j}
                          src={img.data}
                          alt={img.filename}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(img.data)}
                        />
                      ))}
                    </div>
                  )}
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

          {/* Zone d'upload d'images (prévisualisation avec accumulation) */}
          {allPreviews.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">{allPreviews.length}/10 image(s)</span>
                <button
                  onClick={() => { setAllFiles([]); setAllPreviews([]); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Tout supprimer
                </button>
                <button
                  onClick={handleSendImages}
                  disabled={uploading}
                  className="text-xs bg-violet-600 text-white px-3 py-1 rounded-lg ml-auto"
                >
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : `Envoyer (${allPreviews.length})`}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allPreviews.map((img, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={img} className="w-14 h-14 object-cover rounded-lg border" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input + bouton image */}
          <div className="p-3 bg-white border-t border-gray-200">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleImageSelect(e.target.files)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-violet-500 transition-colors"
                title="Ajouter des images"
              >
                <Paperclip className="w-5 h-5" />
              </button>
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

            {/* ⚠️ Message d'avertissement discret */}
            <p className="text-xs text-gray-400 text-center mt-2">
              PayMaestro Assistant est une IA et peut générer des erreurs. Veuillez vérifier les informations importantes.
            </p>
          </div>
        </div>
      )}
    </>
  );
}