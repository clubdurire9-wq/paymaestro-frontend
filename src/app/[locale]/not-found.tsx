'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Decorative blob */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-6 max-w-md mx-auto">
        {/* 404 Number */}
        <div className="text-8xl font-black text-slate-100 leading-none select-none">
          404
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
          <Home className="w-8 h-8" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Page introuvable
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            La page que vous recherchez n&apos;existe pas ou a été déplacée. Vérifiez l&apos;URL ou retournez à l&apos;accueil.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-2xl hover:bg-violet-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-violet-200"
          >
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
