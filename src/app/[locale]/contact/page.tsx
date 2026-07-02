'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Mail, MessageSquare, User, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function ContactPage() {
  const locale = useLocale();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.contact.create({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'envoi. Réessayez plus tard.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-12 pb-12">
            <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Message envoyé</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              Votre demande a été transmise à notre équipe Support.
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Nous vous répondrons par email dans les plus brefs délais.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contacter le Support</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Une question, un problème ? Notre équipe vous répond par email.
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
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Votre nom"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@email.com"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Sujet <span className="text-slate-400 dark:text-slate-500">(optionnel)</span>
                </label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Ex: Problème de retrait"
                />
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
                  rows={5}
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
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Vous recevrez une réponse par email. Notre équipe est disponible 24h/24 et 7j/7.
        </p>
      </div>
    </div>
  );
}
