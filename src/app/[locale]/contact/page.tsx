'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Mail, MessageSquare, User, Loader2, AlertTriangle, Send, Clock, CheckCircle2, HeadphonesIcon, Paperclip, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface ChatMessage {
  id: number;
  ticket_id: number;
  sender_type: 'USER' | 'ADMIN' | 'BOT';
  sender_email: string | null;
  message: string;
  created_at: string;
  metadata?: { imageBase64?: string; mimeType?: string; filename?: string } | null;
}

export default function ContactPage() {
  const locale = useLocale();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [ticketId, setTicketId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [ticketStatus, setTicketStatus] = useState<string>('OPEN');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [allPreviews, setAllPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!ticketId) return;
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const msgsRes = await api.chatbot.getTicketMessages(ticketId);
        setChatMessages(msgsRes.messages || []);
        if (msgsRes.ticket) {
          setTicketStatus(msgsRes.ticket.status);
          if (msgsRes.ticket.assigned_to) {
            setAgentName(msgsRes.ticket.assigned_to.split('@')[0]);
          }
        }
      } catch {}
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [ticketId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < Math.min(files.length, 10 - allFiles.length); i++) {
      const file = files[i];
      allFiles.push(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAllPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    }
    setAllFiles([...allFiles]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setAllFiles(prev => prev.filter((_, i) => i !== index));
    setAllPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendImages = async () => {
    if (allFiles.length === 0 || !ticketId) return;
    setUploading(true);
    try {
      await api.chatbot.uploadTicketImages(ticketId, allFiles, userEmail);
      const msgsRes = await api.chatbot.getTicketMessages(ticketId);
      setChatMessages(msgsRes.messages || []);
      if (msgsRes.ticket) {
        setTicketStatus(msgsRes.ticket.status);
        if (msgsRes.ticket.assigned_to) setAgentName(msgsRes.ticket.assigned_to.split('@')[0]);
      }
    } catch {}
    setAllFiles([]);
    setAllPreviews([]);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await api.contact.create({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setTicketId(res.ticketId);
      setUserEmail(email.trim());
      setSessionId(res.sessionId);
      setChatMessages([{
        id: -1,
        ticket_id: res.ticketId,
        sender_type: 'BOT',
        sender_email: null,
        message: `Patientez quelques minutes, un agent va prendre en charge votre demande.`,
        created_at: new Date().toISOString(),
      }]);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'envoi. Réessayez plus tard.');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !ticketId || chatLoading) return;
    const text = chatInput.trim();
    setChatInput('');
    setChatLoading(true);
    try {
      await api.chatbot.sendTicketMessage(ticketId, text, userEmail);
      const msgsRes = await api.chatbot.getTicketMessages(ticketId);
      setChatMessages(msgsRes.messages || []);
      if (msgsRes.ticket) {
        setTicketStatus(msgsRes.ticket.status);
        if (msgsRes.ticket.assigned_to) setAgentName(msgsRes.ticket.assigned_to.split('@')[0]);
      }
    } catch {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        ticket_id: ticketId,
        sender_type: 'BOT',
        sender_email: null,
        message: 'Erreur lors de l\'envoi du message. Réessayez.',
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (ticketId) {
    const isResolved = ticketStatus === 'RESOLVED' || ticketStatus === 'CLOSED';
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
              {isResolved ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <MessageSquare className="w-7 h-7 text-violet-600 dark:text-violet-400" />
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {isResolved ? 'Ticket résolu' : 'Support en direct'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isResolved
                ? 'Ce ticket est fermé. Merci de nous avoir contactés.'
                : agentName
                  ? `Vous discutez avec ${agentName}`
                  : `Ticket #${ticketId} — En attente d\'un agent...`}
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div ref={messagesContainerRef} className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-900 rounded-t-2xl">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender_type === 'USER'
                        ? 'bg-violet-600 text-white rounded-br-md'
                        : msg.sender_type === 'ADMIN'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded-bl-md'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-bl-md'
                    }`}>
                      {msg.message === '[IMAGE]' && msg.metadata?.imageBase64 ? (
                        <div>
                          <img
                            src={`data:${msg.metadata.mimeType || 'image/png'};base64,${msg.metadata.imageBase64}`}
                            alt={msg.metadata.filename || 'Image'}
                            className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                            onClick={() => window.open(`data:${msg.metadata.mimeType || 'image/png'};base64,${msg.metadata.imageBase64}`)}
                          />
                          <p className="text-[10px] mt-1 opacity-70">{msg.metadata.filename || 'Image'}</p>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      )}
                      <p className={`text-[10px] mt-1 ${
                        msg.sender_type === 'USER' ? 'text-violet-200' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {!isResolved && !agentName && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
                    <Clock className="w-4 h-4 shrink-0" />
                    Un agent va bientôt vous rejoindre...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {!isResolved ? (
                <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl">
                  {/* Image previews */}
                  {allPreviews.length > 0 && (
                    <div className="px-3 pt-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{allPreviews.length}/10</span>
                        <button onClick={() => { setAllFiles([]); setAllPreviews([]); }} className="text-xs text-red-500 hover:underline">Tout supprimer</button>
                        <button onClick={handleSendImages} disabled={uploading} className="text-xs bg-violet-600 text-white px-3 py-1 rounded-lg ml-auto">
                          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : `Envoyer (${allPreviews.length})`}
                        </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {allPreviews.map((img, i) => (
                          <div key={i} className="relative shrink-0">
                            <img src={img} className="w-14 h-14 object-cover rounded-lg border dark:border-slate-600" />
                            <button onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-3 flex gap-2">
                    <input type="file" ref={fileInputRef} accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 dark:text-slate-400 hover:text-violet-500 transition-colors shrink-0" title="Ajouter des images">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <Input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      placeholder="Tapez votre message..."
                      disabled={chatLoading}
                    />
                    <Button size="sm" onClick={handleSendMessage} disabled={chatLoading || !chatInput.trim()} className="rounded-xl shrink-0">
                      {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ce ticket est fermé. Si vous avez besoin d'aide, créez un nouveau ticket.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            Ticket #{ticketId} · {ticketStatus === 'OPEN' ? 'En attente' : ticketStatus === 'IN_PROGRESS' ? 'En cours' : 'Résolu'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
            <HeadphonesIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contacter le Support</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Une question, un problème ? Décrivez-nous tout et un agent vous répond en direct.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nom <span className="text-slate-400 dark:text-slate-500">(optionnel)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" className="pl-10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@email.com" required className="pl-10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Sujet <span className="text-slate-400 dark:text-slate-500">(optionnel)</span>
                </label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Problème de retrait" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Décrivez votre demande en quelques lignes..."
                  required
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={sending || !email.trim() || !message.trim()} className="w-full">
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Envoi en cours...</>
                ) : 'Envoyer'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Notre équipe est disponible 24h/24 et 7j/7.
        </p>
      </div>
    </div>
  );
}
