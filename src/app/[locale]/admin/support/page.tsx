'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { MessageCircle, Send, User, Clock, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminSupportPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadTickets(); }, []);
  useEffect(() => {
    if (selectedTicket) loadMessages(selectedTicket.id);
  }, [selectedTicket]);

  // Rafraîchir les tickets toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTickets = async () => {
    const res = await fetch(`${API_URL}/support/tickets`, { headers });
    const d = await res.json();
    if (d.success) setTickets(d.data);
    setLoading(false);
  };

  const loadMessages = async (ticketId: number) => {
    const res = await fetch(`${API_URL}/support/messages/${ticketId}`, { headers });
    const d = await res.json();
    if (d.success) setMessages(d.data);
  };

  const handleAssign = async (ticketId: number) => {
    await fetch(`${API_URL}/support/assign`, { method: 'POST', headers, body: JSON.stringify({ ticketId }) });
    loadTickets();
  };

  const handleResolve = async (ticketId: number) => {
    await fetch(`${API_URL}/support/resolve`, { method: 'POST', headers, body: JSON.stringify({ ticketId }) });
    setSelectedTicket(null);
    loadTickets();
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    await fetch(`${API_URL}/support/message`, {
      method: 'POST', headers,
      body: JSON.stringify({ ticketId: selectedTicket.id, message: newMessage }),
    });
    setNewMessage('');
    loadMessages(selectedTicket.id);
  };

  const priorityColor: any = { LOW: 'bg-gray-100', MEDIUM: 'bg-blue-100', HIGH: 'bg-orange-100', URGENT: 'bg-red-100 text-red-800' };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <MessageCircle className="w-8 h-8 text-violet-600" />
        Support Live
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        {/* Liste des tickets */}
        <Card className="lg:col-span-1 overflow-y-auto">
          <CardHeader><CardTitle>Tickets ouverts ({tickets.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedTicket?.id === ticket.id ? 'bg-violet-100 border-2 border-violet-400' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold truncate">{ticket.user_name || ticket.user_email}</p>
                    <p className="text-xs text-slate-400 truncate">{ticket.subject || 'Sans sujet'}</p>
                  </div>
                  <Badge className={priorityColor[ticket.priority]}>
                    {ticket.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(ticket.created_at).toLocaleTimeString('fr-FR')}
                  {ticket.assigned_to && <span>• {ticket.assigned_to}</span>}
                </div>
              </button>
            ))}
            {tickets.length === 0 && <p className="text-slate-400 text-center py-8">Aucun ticket en attente 🎉</p>}
          </CardContent>
        </Card>

        {/* Conversation */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {selectedTicket.user_name || selectedTicket.user_email}
                  </CardTitle>
                  <div className="flex gap-2">
                    {!selectedTicket.assigned_to && (
                      <Button size="sm" onClick={() => handleAssign(selectedTicket.id)}>Prendre en charge</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleResolve(selectedTicket.id)} icon={<CheckCircle2 className="w-4 h-4" />}>
                      Résoudre
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 p-4">
                {messages.map(msg => {
                  const newImages = msg.metadata?.images || [];
                  const legacyImage = msg.metadata?.imageBase64
                    ? [{ imageBase64: msg.metadata.imageBase64, mimeType: msg.metadata.mimeType || 'image/png', filename: msg.metadata.filename || 'image' }]
                    : [];
                  const allImages = [...newImages, ...legacyImage];
                  const isImageOnly = msg.message === '[IMAGE]';
                  return (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.sender_type === 'ADMIN' ? 'bg-violet-600 text-white' :
                        msg.sender_type === 'BOT' ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {msg.sender_type === 'ADMIN' && <p className="text-[10px] opacity-70">Admin</p>}
                        {msg.sender_type === 'BOT' && <p className="text-[10px] opacity-70">🤖 Escalade automatique</p>}
                        
                        {allImages.length > 0 && (
                          <div className={`flex flex-wrap gap-2 ${!isImageOnly && msg.message ? 'mb-2' : ''}`}>
                            {allImages.map((img: any, i: number) => (
                              <button key={i}
                                onClick={() => setLightbox(`data:${img.mimeType || 'image/png'};base64,${img.imageBase64}`)}
                                className="p-0 border-0 bg-transparent cursor-pointer"
                              >
                                <img
                                  src={`data:${img.mimeType || 'image/png'};base64,${img.imageBase64}`}
                                  alt={img.filename || `Image ${i+1}`}
                                  className="w-20 h-20 object-cover rounded-xl cursor-pointer hover:opacity-80 border border-slate-200 block"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {!isImageOnly && msg.message && (
                          <p className="text-sm break-words">{msg.message}</p>
                        )}
                        
                        <p className="text-[10px] opacity-50 text-right mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Votre réponse..."
                  className="flex-1 px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                />
                <Button onClick={handleSend} disabled={!newMessage.trim()} icon={<Send className="w-4 h-4" />}>
                  Envoyer
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Sélectionnez un ticket pour voir la conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightbox}
              alt="Image zoom"
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}