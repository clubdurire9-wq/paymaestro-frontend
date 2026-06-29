'use client';

import React from 'react';

interface MapEmbedProps {
  lat: number;
  lon: number;
  country?: string;
  city?: string;
  className?: string;
}

export default function MapEmbed({ lat, lon, country, city, className = '' }: MapEmbedProps) {
  if (!lat && !lon) {
    return (
      <div className={`bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm ${className}`}>
        Localisation non disponible
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&center=${lat},${lon}&zoom=10&maptype=roadmap`;

  // Fallback sans API key — utilise l'URL embed basique
  const fallbackUrl = `https://www.google.com/maps?q=${lat},${lon}&output=embed`;

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <iframe
        title={`Carte - ${city || ''} ${country || ''}`}
        src={fallbackUrl}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '200px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
        {city && `${city}, `}{country || ''}
      </div>
    </div>
  );
}
