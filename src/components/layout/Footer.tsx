import React from 'react';
import { Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <span className="text-lg font-bold text-slate-900">PayMaestro</span>
            <p className="mt-4 text-sm text-slate-500 max-w-sm leading-relaxed">
              La passerelle sécurisée de référence pour retirer vos fonds PayPal directement et instantanément vers vos comptes Mobile Money (MTN, Orange, Wave, Moov, Airtel, Safaricom) en Afrique.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aide & Support</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="mailto:support@paymaestro.com" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-violet-600 transition-colors">
                  <Mail className="w-4 h-4" />
                  support@paymaestro.com
                </a>
              </li>
              <li>
                <span className="text-xs text-slate-400 block mt-1">Disponible 24h/24 & 7j/7</span>
              </li>
            </ul>
          </div>

          {/* Legal / Security */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sécurité</h4>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>PCI-DSS Conforme</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Cryptage SSL 256 bits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} PayMaestro. Tous droits réservés.
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            Fait avec <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> pour les créateurs africains.
          </p>
        </div>
      </div>
    </footer>
  );
}