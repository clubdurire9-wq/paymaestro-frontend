'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { 
  Users, Circle, MessageCircle, Send, Loader2, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, Shield, DollarSign,
  UserPlus, X, Search, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isAdminEmail } from '@/hooks/useAdmin';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export default function AdminAgentsPage() {
  const locale = useLocale();
  const toast = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const authHeader = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [agents, setAgents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'chat' | 'payroll'>('monitoring');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payroll state
  const [payrollAgents, setPayrollAgents] = useState<any[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addUser, setAddUser] = useState<any>(null);
  const [addGrade, setAddGrade] = useState('');
  const [addSalary, setAddSalary] = useState('');
  const [addCurrency, setAddCurrency] = useState('USD');
  const [customGrade, setCustomGrade] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  // Mass email state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<any>(null);
  const [searchUserFilter, setSearchUserFilter] = useState('');

  let currentUserEmail = '';
  if (typeof window !== 'undefined') {
    try {
      const storedUser = sessionStorage.getItem('pm_auth_user');
      currentUserEmail = storedUser ? JSON.parse(storedUser)?.email ?? '' : '';
    } catch {
      currentUserEmail = '';
    }
  }
  const isAdmin = isAdminEmail(currentUserEmail);

  const grades = [
    'Agent Support',
    'Agent Senior',
    'Team Lead',
    'Manager',
    'Superviseur',
    'Expert Compliance',
  ];

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadData = async () => {
    const [agentsRes, unreadRes] = await Promise.all([
      fetch(`${API_URL}/agent/status`, { headers: authHeader }),
      fetch(`${API_URL}/agent/chat/unread`, { headers: authHeader }),
    ]);
    if (agentsRes.ok) setAgents((await agentsRes.json()).data || []);
    if (unreadRes.ok) setUnread((await unreadRes.json()).data?.unread || 0);
    setLoading(false);
  };

  const loadPayrollAgents = async () => {
    setPayrollLoading(true);
    try {
      const data = await api.admin.getPayrollAgents();
      setPayrollAgents(data || []);
    } catch {}
    setPayrollLoading(false);
  };

  const loadMessages = async () => {
    const res = await fetch(`${API_URL}/agent/chat/messages?page=${page}`, { headers: authHeader });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.data || []);
      setTotalPages(data.totalPages || 1);
    }
  };

  const lookupAgentUser = async (email: string) => {
    if (!email.includes('@')) { setAddUser(null); return; }
    try {
      const users = await api.admin.searchUsers(email);
      const found = users?.find((u: any) => u.email === email);
      setAddUser(found || null);
    } catch {
      setAddUser(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => lookupAgentUser(addEmail), 500);
    return () => clearTimeout(timer);
  }, [addEmail]);

  const handleSaveAgent = async () => {
    if (!addUser || !addSalary) return;
    setSaving(true);
    try {
      const grade = addGrade === 'custom' ? customGrade : addGrade;
      await api.admin.setSalary({
        agentUserId: addUser.id,
        monthlySalary: parseFloat(addSalary),
        currency: addCurrency,
        grade: grade || null,
      });
      setAddEmail('');
      setAddUser(null);
      setAddGrade('');
      setAddSalary('');
      setCustomGrade('');
      toast.success('Agent ajouté avec succès');
      loadPayrollAgents();
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de l\'ajout de l\'agent');
    }
    setSaving(false);
  };

  const handleRemoveAgent = async (agentUserId: string) => {
    if (!confirm('Desactiver cet agent ? (fin de contrat)')) return;
    setRemoving(agentUserId);
    try {
      await api.admin.removeAgent(agentUserId);
      toast.success('Agent désactivé');
      loadPayrollAgents();
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la désactivation');
    }
    setRemoving(null);
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

    try {
      const res = await fetch(`${API_URL}/agent/chat/send-with-images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de l\'envoi du message');
      return;
    }

    setNewMessage('');
    setImages(null);
    setPreviewImages([]);
    setReplyTo(null);
    setIsUrgent(false);
    loadMessages();
  };

  const handleImageSelect = async (files: FileList) => {
    setImages(files);
    const maxFiles = Math.min(files.length, 10);
    const promises: Promise<string>[] = [];
    for (let i = 0; i < maxFiles; i++) {
      promises.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(files[i]);
      }));
    }
    const previews = await Promise.all(promises);
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

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-violet-600" />
          Agents
        </h1>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Rafraichir
        </Button>
      </div>

      {activeTab === 'monitoring' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 py-6">
              <Circle className="w-10 h-10 text-green-500" />
              <div>
                <p className="text-sm text-slate-500">En ligne</p>
                <p className="text-2xl font-bold">{onlineCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-6">
              <Clock className="w-10 h-10 text-orange-500" />
              <div>
                <p className="text-sm text-slate-500">Inactif</p>
                <p className="text-2xl font-bold">{inactiveCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-6">
              <Circle className="w-10 h-10 text-red-500" />
              <div>
                <p className="text-sm text-slate-500">Hors ligne</p>
                <p className="text-2xl font-bold">{offlineCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* ONGLETS */}
      <div className="flex bg-slate-100 rounded-xl p-1">
        <button onClick={() => setActiveTab('monitoring')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'monitoring' ? 'bg-white shadow' : 'text-slate-500'}`}>
          Monitoring
        </button>
        <button onClick={() => { setActiveTab('chat'); loadMessages(); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'chat' ? 'bg-white shadow' : 'text-slate-500'}`}>
          Chat interne {unread > 0 && <Badge className="ml-2 bg-red-500 text-white">{unread}</Badge>}
        </button>
        {isAdmin && (
          <button onClick={() => { setActiveTab('payroll'); loadPayrollAgents(); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'payroll' ? 'bg-white shadow' : 'text-slate-500'}`}>
            Remuneration
          </button>
        )}
        {isAdmin && (
          <button onClick={() => { setActiveTab('email'); setEmailResult(null); api.admin.listAllUsers().then(setAllUsers).catch(() => {}); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'email' ? 'bg-white shadow' : 'text-slate-500'}`}>
            Email
          </button>
        )}
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
                    <p> Tickets: <strong>{agent.tickets_resolved_today || 0}</strong> aujourd'hui</p>
                    <p> Remboursements: <strong>{agent.refunds_processed_today || 0}</strong></p>
                    {agent.minutesInactive && agent.status === 'inactive' && (
                      <p className="text-orange-600 mt-1"> Inactif depuis {agent.minutesInactive} min</p>
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
              <CardTitle> Chat Interne - Equipe PayMaestro</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>←</Button>
                <span className="text-sm text-slate-500">{page}/{totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>→</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_email === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.is_urgent ? 'bg-red-100 border-2 border-red-300 text-red-900' :
                  msg.sender_email === 'admin' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold">{msg.sender_name}</span>
                    <span className="text-[10px] opacity-60">{msg.sender_email}</span>
                    {msg.is_urgent && <AlertTriangle className="w-3 h-3 text-red-600" />}
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  
                  {(() => {
                    let imgs: any[] = [];
                    try {
                      imgs = typeof msg.images === 'string' ? JSON.parse(msg.images) : msg.images || [];
                    } catch { imgs = []; }
                    return imgs.map((img: any, i: number) => (
                      <img key={i} src={`data:${img.mimeType};base64,${img.data}`} className="max-w-[200px] rounded-lg mt-2 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(`data:${img.mimeType};base64,${img.data}`)} />
                    ));
                  })()}
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.sender_email !== 'admin' && (
                      <button onClick={() => handleReply(msg)} className="text-[10px] text-violet-500 hover:underline">
                        ↩️ Repondre
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
                  Reponse a {replyTo.name}
                  <button onClick={() => { setReplyTo(null); setNewMessage(''); }} className="ml-1">✕</button>
                </span>
              )}
            </div>
            
            <input type="file" ref={fileInputRef} accept="image/*" multiple className="hidden"
              onChange={(e) => e.target.files && handleImageSelect(e.target.files)} />

            {previewImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {previewImages.map((img, i) => (
                  <img key={i} src={img} className="w-12 h-12 object-cover rounded-lg border" />
                ))}
                <button onClick={() => { setImages(null); setPreviewImages([]); }} className="text-xs text-red-500">✕</button>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-slate-100 rounded-lg text-xs hover:bg-slate-200">
                📷 ({images?.length || 0})
              </button>
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendWithImages()}
                placeholder={replyTo ? `Repondre a ${replyTo.name}...` : 'Message a l\'equipe...'} className="flex-1 px-4 py-3 border rounded-xl text-sm" />
              <Button onClick={handleSendWithImages} disabled={!newMessage.trim() && !images} icon={<Send className="w-4 h-4" />}>
                Envoyer
              </Button>
            </div>

            <button onClick={handleClearChat} className="text-xs text-red-500 hover:underline mt-2">
              🗑️ Vider l'historique
            </button>
          </div>
        </Card>
      )}
      {/* REMUNERATION */}
      {activeTab === 'payroll' && isAdmin && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-violet-600" /> Ajouter un agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Email de l\'utilisateur</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="ex: agent@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                </div>
                {addUser && (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-sm">{addUser.name || addUser.email}</p>
                      <p className="text-xs text-slate-500">{addUser.email} - {addUser.role}</p>
                    </div>
                  </div>
                )}
                {!addUser && addEmail.includes('@') && (
                  <p className="text-xs text-amber-600 mt-1">Utilisateur non trouve avec cet email</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Grade / Titre</label>
                <select value={addGrade} onChange={(e) => setAddGrade(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                  <option value="">Selectionnez...</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                  <option value="custom">Personnalise...</option>
                </select>
                {addGrade === 'custom' && (
                  <input type="text" value={customGrade} onChange={(e) => setCustomGrade(e.target.value)}
                    placeholder="Entrez le grade personnalise"
                    className="w-full px-4 py-2.5 mt-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Salaire mensuel</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                    <input type="number" value={addSalary} onChange={(e) => setAddSalary(e.target.value)}
                      placeholder="0.00" min="0" step="0.01"
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                  </div>
                </div>
                <div className="w-24">
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Devise</label>
                  <select value={addCurrency} onChange={(e) => setAddCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="XAF">XAF</option>
                    <option value="XOF">XOF</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSaveAgent} disabled={!addUser || !addSalary || saving}
                icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}>
                {saving ? 'Enregistrement...' : 'Enregistrer agent'}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-violet-600" /> Agents remuneres
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payrollLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : payrollAgents.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun agent enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-2 font-semibold text-slate-500">Nom</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-500">Email</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-500">Grade</th>
                        <th className="text-right py-3 px-2 font-semibold text-slate-500">Salaire</th>
                        <th className="text-center py-3 px-2 font-semibold text-slate-500">Statut</th>
                        <th className="text-center py-3 px-2 font-semibold text-slate-500">Dernier paiement</th>
                        <th className="text-center py-3 px-2 font-semibold text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollAgents.map(agent => (
                        <tr key={agent.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2 font-medium">{agent.name}</td>
                          <td className="py-3 px-2 text-slate-500">{agent.email}</td>
                          <td className="py-3 px-2">
                            {agent.grade ? <Badge variant="violet">{agent.grade}</Badge> : <span className="text-slate-400">-</span>}
                          </td>
                          <td className="py-3 px-2 text-right font-bold">{agent.monthly_salary} {agent.currency}</td>
                          <td className="py-3 px-2 text-center">
                            {agent.is_active ? (
                              <Badge variant="success">Actif</Badge>
                            ) : (
                              <Badge variant="error">Desactive</Badge>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center text-xs text-slate-500">
                            {agent.last_paid_month || '-'}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {agent.is_active ? (
                              <button onClick={() => handleRemoveAgent(agent.user_id)}
                                disabled={removing === agent.user_id}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Desactiver l\'agent (fin de contrat)">
                                {removing === agent.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">Inactif</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === 'email' && isAdmin && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-violet-600" /> Envoyer un email en masse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Sujet</label>
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Sujet de l'email..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Message</label>
                <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Votre message..."
                  rows={5}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-y" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Destinataires ({selectedEmails.size} sélectionnés)</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={searchUserFilter} onChange={(e) => setSearchUserFilter(e.target.value)}
                      placeholder="Rechercher..."
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                    <button onClick={() => {
                      if (selectedEmails.size === allUsers.length) {
                        setSelectedEmails(new Set());
                      } else {
                        setSelectedEmails(new Set(allUsers.map(u => u.email)));
                      }
                    }} className="text-xs text-violet-600 hover:underline">
                      {selectedEmails.size === allUsers.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {allUsers
                    .filter(u => !searchUserFilter || u.name?.toLowerCase().includes(searchUserFilter.toLowerCase()) || u.email?.toLowerCase().includes(searchUserFilter.toLowerCase()))
                    .map(user => (
                      <label key={user.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={selectedEmails.has(user.email)}
                          onChange={(e) => {
                            const next = new Set(selectedEmails);
                            e.target.checked ? next.add(user.email) : next.delete(user.email);
                            setSelectedEmails(next);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name || 'Sans nom'}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </label>
                    ))}
                  {allUsers.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm">Aucun utilisateur trouvé</div>
                  )}
                </div>
              </div>
              <Button onClick={async () => {
                if (!emailSubject.trim() || !emailMessage.trim() || selectedEmails.size === 0) return;
                setSendingEmail(true);
                setEmailResult(null);
                try {
                  const result = await api.admin.sendMassEmail({
                    subject: emailSubject.trim(),
                    message: emailMessage.trim(),
                    recipientEmails: Array.from(selectedEmails),
                  });
                  setEmailResult(result);
                  if (result.sent > 0) {
                    setEmailSubject('');
                    setEmailMessage('');
                    setSelectedEmails(new Set());
                  }
                } catch (e: any) {
                  setEmailResult({ error: e.message || 'Erreur lors de l\'envoi' });
                }
                setSendingEmail(false);
              }} disabled={!emailSubject.trim() || !emailMessage.trim() || selectedEmails.size === 0 || sendingEmail}
                icon={sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}>
                {sendingEmail ? 'Envoi en cours...' : `Envoyer à ${selectedEmails.size} destinataire${selectedEmails.size > 1 ? 's' : ''}`}
              </Button>
              {emailResult && (
                <div className={`p-4 rounded-xl text-sm ${emailResult.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
                  {emailResult.error ? (
                    <p>❌ {emailResult.error}</p>
                  ) : (
                    <div className="space-y-1">
                      <p>✅ Email envoyé avec succès</p>
                      <p className="text-xs opacity-75">{emailResult.sent} envoyé{emailResult.sent > 1 ? 's' : ''}{emailResult.failed > 0 ? `, ${emailResult.failed} échoué${emailResult.failed > 1 ? 's' : ''}` : ''}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
