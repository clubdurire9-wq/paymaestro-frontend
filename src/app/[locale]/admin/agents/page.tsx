'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { 
  Users, Circle, MessageCircle, Send, Loader2, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminAgentsPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [agents, setAgents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'chat'>('monitoring');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Rafraîchir toutes les 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadData = async () => {
    const [agentsRes, unreadRes] = await Promise.all([
      fetch(`${API_URL}/agent/status`, { headers }),
      fetch(`${API_URL}/agent/chat/unread`, { headers }),
    ]);
    if (agentsRes.ok) setAgents((await agentsRes.json()).data || []);
    if (unreadRes.ok) setUnread((await unreadRes.json()).data?.unread || 0);
    setLoading(false);
  };

  const loadMessages = async () => {
    const res = await fetch(`${API_URL}/agent/chat/messages?page=${page}`, { headers });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.data || []);
      setTotalPages(data.totalPages || 1);
    }
  };

  const handleReply = (msg: any) => {
    setReplyTo({ email: msg.sender_email, name: msg.sender_name });
    setNewMessage(`@${msg.sender_name} `);
  };

  const handleSendWithImages = async () => {
    if (!newMessage.trim() && (!images || images.length === 0)) return;

    const formData = new FormData();
    formData.append('message', newMessage);
    formData.append('isUrgent', String(isUrgent));
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    await fetch(`${API_URL}/agent/chat/send-with-images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setNewMessage('');
    setImages(null);
    setPreviewImages([]);
    setReplyTo(null);
    setIsUrgent(false);
    loadMessages();
  };

  const handleImageSelect = (files: FileList) => {
    setImages(files);
    const previews: string[] = [];
    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const reader = new FileReader();
      reader.onload = (e) => previews.push(e.target?.result as string);
      reader.readAsDataURL(files[i]);
    }
    setPreviewImages(previews);
  };

  const handleClearChat = async () => {
    if (!confirm('Vider tout l\'historique du chat ?')) return;
    await fetch(`${API_URL}/agent/chat/clear`, { 
      method: 'DELETE', 
      headers: { Authorization: `Bearer ${token}` } 
    });
    loadMessages();
  };

  const onlineCount = agents.filter(a => a.status === 'active').length;
  const inactiveCount = agents.filter(a => a.status === 'inactive').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8 text-violet-600" /> Équipe
        </h1>
        <Button variant="outline" onClick={() => { loadData(); if (activeTab === 'chat') loadMessages(); }} icon={<RefreshCw className="w-4 h-4" />}>
          Rafraîchir
        </Button>
      </div>

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200"><CardContent className="p-4 text-center">
          <Circle className="w-6 h-6 text-green-500 mx-auto mb-1" fill="currentColor" />
          <p className="text-2xl font-extrabold text-green-700">{onlineCount}</p>
          <p className="text-xs text-green-600">En ligne actifs</p>
        </CardContent></Card>
        <Card className="bg-orange-50 border-orange-200"><CardContent className="p-4 text-center">
          <Clock className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-orange-700">{inactiveCount}</p>
          <p className="text-xs text-orange-600">Inactifs</p>
        </CardContent></Card>
        <Card className="bg-red-50 border-red-200"><CardContent className="p-4 text-center">
          <Circle className="w-6 h-6 text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-red-700">{offlineCount}</p>
          <p className="text-xs text-red-600">Hors ligne</p>
        </CardContent></Card>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        <button onClick={() => { setActiveTab('monitoring'); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'monitoring' ? 'bg-white shadow' : 'text-slate-500'}`}>
          📊 Monitoring
        </button>
        <button onClick={() => { setActiveTab('chat'); loadMessages(); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'chat' ? 'bg-white shadow' : 'text-slate-500'}`}>
          💬 Chat interne {unread > 0 && <Badge className="ml-2 bg-red-500 text-white">{unread}</Badge>}
        </button>
      </div>

      {/* MONITORING */}
      {activeTab === 'monitoring' && (
        <Card>
          <CardHeader><CardTitle>Agents en direct</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agents.map(agent => (
                <div key={agent.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                  agent.status === 'active' ? 'bg-green-50 border-green-300' :
                  agent.status === 'inactive' ? 'bg-orange-50 border-orange-300' :
                  'bg-red-50 border-red-300'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{agent.statusLabel}</span>
                      <span className="font-bold">{agent.name}</span>
                      <Badge className="text-[10px]">{agent.role}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{agent.email}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>🎫 Tickets: <strong>{agent.tickets_resolved_today || 0}</strong> aujourd'hui</p>
                    <p>💰 Remboursements: <strong>{agent.refunds_processed_today || 0}</strong></p>
                    {agent.minutesInactive && agent.status === 'inactive' && (
                      <p className="text-orange-600 mt-1">⏱️ Inactif depuis {agent.minutesInactive} min</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CHAT INTERNE */}
      {activeTab === 'chat' && (
        <Card className="flex flex-col h-[600px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>💬 Chat Interne — Équipe PayMaestro</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  ←
                </Button>
                <span className="text-sm text-slate-500">{page}/{totalPages}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_email === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.is_urgent 
                    ? 'bg-red-100 border-2 border-red-300 text-red-900' 
                    : msg.sender_email === 'admin' 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-slate-100 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold">{msg.sender_name}</span>
                    <span className="text-[10px] opacity-60">{msg.sender_email}</span>
                    {msg.is_urgent && <AlertTriangle className="w-3 h-3 text-red-600" />}
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  
                  {/* Affichage des images dans les messages */}
                  {msg.images && JSON.parse(msg.images || '[]').map((img: any, i: number) => (
                    <img 
                      key={i} 
                      src={`data:${img.mimeType};base64,${img.data}`}
                      className="max-w-[200px] rounded-lg mt-2 cursor-pointer hover:opacity-90"
                      onClick={() => window.open(`data:${img.mimeType};base64,${img.data}`)} 
                    />
                  ))}
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {/* Bouton répondre */}
                    {msg.sender_email !== 'admin' && (
                      <button 
                        onClick={() => handleReply(msg)}
                        className="text-[10px] text-violet-500 hover:underline"
                      >
                        ↩️ Répondre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </CardContent>
          <div className="p-4 border-t">
            <div className="flex gap-2 mb-2">
              <button onClick={() => setIsUrgent(!isUrgent)}
                className={`text-xs px-3 py-1 rounded-lg ${isUrgent ? 'bg-red-500 text-white' : 'bg-slate-100'}`}>
                {isUrgent ? '🔴 Urgent' : '⚪ Normal'}
              </button>
              {replyTo && (
                <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-lg flex items-center gap-1">
                  Réponse à {replyTo.name}
                  <button onClick={() => { setReplyTo(null); setNewMessage(''); }} className="ml-1">✕</button>
                </span>
              )}
            </div>
            
            {/* Upload images */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple 
              className="hidden"
              onChange={(e) => e.target.files && handleImageSelect(e.target.files)} 
            />

            {previewImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {previewImages.map((img, i) => (
                  <img key={i} src={img} className="w-12 h-12 object-cover rounded-lg border" />
                ))}
                <button 
                  onClick={() => { setImages(null); setPreviewImages([]); }}
                  className="text-xs text-red-500"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-100 rounded-lg text-xs hover:bg-slate-200"
              >
                📷 ({images?.length || 0})
              </button>
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendWithImages()}
                placeholder={replyTo ? `Répondre à ${replyTo.name}...` : 'Message à l\'équipe...'}
                className="flex-1 px-4 py-3 border rounded-xl text-sm" 
              />
              <Button 
                onClick={handleSendWithImages} 
                disabled={!newMessage.trim() && !images}
                icon={<Send className="w-4 h-4" />}
              >
                Envoyer
              </Button>
            </div>

            {/* Bouton vider le chat (ADMIN) */}
            <button 
              onClick={handleClearChat}
              className="text-xs text-red-500 hover:underline mt-2"
            >
              🗑️ Vider l'historique
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}