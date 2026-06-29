// src/data/countries.ts
// 54 pays africains - Source unique pour toute l'application

export interface CountryData {
  code: string;        // Code devise ISO
  flag: string;        // Emoji drapeau
  country: string;     // Nom du pays
  rate: number;        // Taux de change approximatif (1 USD = X)
  countryCode: string; // Indicatif téléphonique (+225, +237...)
  operators: string[]; // Opérateurs Mobile Money
  available: boolean;  // Retrait disponible ou bientôt
  iso2: string;        // Code pays ISO 3166-1 alpha-2 (pour flagcdn)
}

export const ALL_COUNTRIES: CountryData[] = [
  // ==========================================
  // PAYS DISPONIBLES (retrait actif)
  // ==========================================
  { code: 'XOF', flag: '🇨🇮', country: 'Côte d\'Ivoire', rate: 603.5, countryCode: '+225', operators: ['Orange', 'MTN', 'Moov', 'Wave'], available: true, iso2: 'ci' },
  { code: 'XOF', flag: '🇸🇳', country: 'Sénégal', rate: 603.5, countryCode: '+221', operators: ['Orange', 'Free', 'Wave'], available: true, iso2: 'sn' },
  { code: 'XAF', flag: '🇨🇲', country: 'Cameroun', rate: 610.2, countryCode: '+237', operators: ['MTN', 'Orange'], available: true, iso2: 'cm' },
  { code: 'GHS', flag: '🇬🇭', country: 'Ghana', rate: 15.75, countryCode: '+233', operators: ['MTN', 'Airtel', 'Telecel'], available: true, iso2: 'gh' },
  { code: 'KES', flag: '🇰🇪', country: 'Kenya', rate: 131.5, countryCode: '+254', operators: ['Safaricom', 'Airtel'], available: true, iso2: 'ke' },
  { code: 'NGN', flag: '🇳🇬', country: 'Nigeria', rate: 1620.3, countryCode: '+234', operators: ['MTN', 'Airtel', 'Glo', '9mobile'], available: true, iso2: 'ng' },
  { code: 'UGX', flag: '🇺🇬', country: 'Ouganda', rate: 3850, countryCode: '+256', operators: ['MTN', 'Airtel'], available: true, iso2: 'ug' },
  { code: 'RWF', flag: '🇷🇼', country: 'Rwanda', rate: 1350, countryCode: '+250', operators: ['MTN', 'Airtel'], available: true, iso2: 'rw' },
  { code: 'TZS', flag: '🇹🇿', country: 'Tanzanie', rate: 2550, countryCode: '+255', operators: ['M-Pesa', 'Tigo', 'Airtel'], available: true, iso2: 'tz' },
  { code: 'CDF', flag: '🇨🇩', country: 'RDC', rate: 2850, countryCode: '+243', operators: ['Orange', 'Airtel', 'M-Pesa'], available: true, iso2: 'cd' },

  // ==========================================
  // AFRIQUE DU NORD
  // ==========================================
  { code: 'DZD', flag: '🇩🇿', country: 'Algérie', rate: 135, countryCode: '+213', operators: ['Mobilis', 'Djezzy', 'Ooredoo'], available: false, iso2: 'dz' },
  { code: 'EGP', flag: '🇪🇬', country: 'Égypte', rate: 48.5, countryCode: '+20', operators: ['Orange', 'Vodafone', 'Etisalat'], available: false, iso2: 'eg' },
  { code: 'LYD', flag: '🇱🇾', country: 'Libye', rate: 4.85, countryCode: '+218', operators: ['Libyana', 'Al-Madar'], available: false, iso2: 'ly' },
  { code: 'MAD', flag: '🇲🇦', country: 'Maroc', rate: 9.95, countryCode: '+212', operators: ['Maroc Telecom', 'Orange', 'Inwi'], available: false, iso2: 'ma' },
  { code: 'SDG', flag: '🇸🇩', country: 'Soudan', rate: 601, countryCode: '+249', operators: ['Zain', 'MTN', 'Sudani'], available: false, iso2: 'sd' },
  { code: 'TND', flag: '🇹🇳', country: 'Tunisie', rate: 3.10, countryCode: '+216', operators: ['Tunisie Telecom', 'Ooredoo', 'Orange'], available: false, iso2: 'tn' },

  // ==========================================
  // AFRIQUE DE L'OUEST
  // ==========================================
  { code: 'XOF', flag: '🇧🇯', country: 'Bénin', rate: 603.5, countryCode: '+229', operators: ['MTN', 'Moov'], available: false, iso2: 'bj' },
  { code: 'XOF', flag: '🇧🇫', country: 'Burkina Faso', rate: 603.5, countryCode: '+226', operators: ['Orange', 'Moov', 'Telecel'], available: false, iso2: 'bf' },
  { code: 'CVE', flag: '🇨🇻', country: 'Cap-Vert', rate: 102, countryCode: '+238', operators: ['CVMóvel', 'Unitel T+'], available: false, iso2: 'cv' },
  { code: 'GMD', flag: '🇬🇲', country: 'Gambie', rate: 68, countryCode: '+220', operators: ['Africell', 'QCell'], available: false, iso2: 'gm' },
  { code: 'GNF', flag: '🇬🇳', country: 'Guinée', rate: 8620, countryCode: '+224', operators: ['Orange', 'MTN', 'Cellcom'], available: false, iso2: 'gn' },
  { code: 'LRD', flag: '🇱🇷', country: 'Liberia', rate: 195, countryCode: '+231', operators: ['Orange', 'Lonestar'], available: false, iso2: 'lr' },
  { code: 'XOF', flag: '🇲🇱', country: 'Mali', rate: 603.5, countryCode: '+223', operators: ['Orange', 'Malitel'], available: false, iso2: 'ml' },
  { code: 'MRU', flag: '🇲🇷', country: 'Mauritanie', rate: 39.5, countryCode: '+222', operators: ['Mauritel', 'Chinguitel'], available: false, iso2: 'mr' },
  { code: 'XOF', flag: '🇳🇪', country: 'Niger', rate: 603.5, countryCode: '+227', operators: ['Airtel', 'Moov', 'Orange'], available: false, iso2: 'ne' },
  { code: 'SLL', flag: '🇸🇱', country: 'Sierra Leone', rate: 22.5, countryCode: '+232', operators: ['Orange', 'Africell'], available: false, iso2: 'sl' },
  { code: 'XOF', flag: '🇹🇬', country: 'Togo', rate: 603.5, countryCode: '+228', operators: ['Togocel', 'Moov'], available: false, iso2: 'tg' },

  // ==========================================
  // AFRIQUE CENTRALE
  // ==========================================
  { code: 'AOA', flag: '🇦🇴', country: 'Angola', rate: 910, countryCode: '+244', operators: ['Unitel', 'Movicel'], available: false, iso2: 'ao' },
  { code: 'XAF', flag: '🇨🇫', country: 'République centrafricaine', rate: 610.2, countryCode: '+236', operators: ['Orange', 'Telecel'], available: false, iso2: 'cf' },
  { code: 'XAF', flag: '🇹🇩', country: 'Tchad', rate: 610.2, countryCode: '+235', operators: ['Airtel', 'Moov'], available: false, iso2: 'td' },
  { code: 'XAF', flag: '🇨🇬', country: 'Congo', rate: 610.2, countryCode: '+242', operators: ['MTN', 'Airtel'], available: false, iso2: 'cg' },
  { code: 'XAF', flag: '🇬🇦', country: 'Gabon', rate: 610.2, countryCode: '+241', operators: ['Airtel', 'Moov'], available: false, iso2: 'ga' },
  { code: 'XAF', flag: '🇬🇶', country: 'Guinée équatoriale', rate: 610.2, countryCode: '+240', operators: ['Muni', 'Gecomsa'], available: false, iso2: 'gq' },
  { code: 'STN', flag: '🇸🇹', country: 'Sao Tomé-et-Principe', rate: 22.5, countryCode: '+239', operators: ['CST', 'Unitel'], available: false, iso2: 'st' },

  // ==========================================
  // AFRIQUE DE L'EST
  // ==========================================
  { code: 'BIF', flag: '🇧🇮', country: 'Burundi', rate: 2880, countryCode: '+257', operators: ['Econet', 'Lumitel'], available: false, iso2: 'bi' },
  { code: 'KMF', flag: '🇰🇲', country: 'Comores', rate: 450, countryCode: '+269', operators: ['Telma', 'Comores Telecom'], available: false, iso2: 'km' },
  { code: 'DJF', flag: '🇩🇯', country: 'Djibouti', rate: 178, countryCode: '+253', operators: ['Djibouti Telecom'], available: false, iso2: 'dj' },
  { code: 'ERN', flag: '🇪🇷', country: 'Érythrée', rate: 15, countryCode: '+291', operators: ['Eritel'], available: false, iso2: 'er' },
  { code: 'ETB', flag: '🇪🇹', country: 'Éthiopie', rate: 56, countryCode: '+251', operators: ['Ethio Telecom'], available: false, iso2: 'et' },
  { code: 'MGA', flag: '🇲🇬', country: 'Madagascar', rate: 4400, countryCode: '+261', operators: ['Airtel', 'Orange', 'Telma'], available: false, iso2: 'mg' },
  { code: 'MWK', flag: '🇲🇼', country: 'Malawi', rate: 1730, countryCode: '+265', operators: ['Airtel', 'TNM'], available: false, iso2: 'mw' },
  { code: 'MUR', flag: '🇲🇺', country: 'Maurice', rate: 46, countryCode: '+230', operators: ['my.t', 'Emtel'], available: false, iso2: 'mu' },
  { code: 'MZN', flag: '🇲🇿', country: 'Mozambique', rate: 64, countryCode: '+258', operators: ['Vodacom', 'Tmcel'], available: false, iso2: 'mz' },
  { code: 'SCR', flag: '🇸🇨', country: 'Seychelles', rate: 13.5, countryCode: '+248', operators: ['Cable & Wireless', 'Airtel'], available: false, iso2: 'sc' },
  { code: 'SOS', flag: '🇸🇴', country: 'Somalie', rate: 570, countryCode: '+252', operators: ['Hormuud', 'Telesom'], available: false, iso2: 'so' },
  { code: 'SSP', flag: '🇸🇸', country: 'Soudan du Sud', rate: 130, countryCode: '+211', operators: ['MTN', 'Zain'], available: false, iso2: 'ss' },
  { code: 'ZMW', flag: '🇿🇲', country: 'Zambie', rate: 27.5, countryCode: '+260', operators: ['MTN', 'Airtel', 'Zamtel'], available: false, iso2: 'zm' },
  { code: 'ZWL', flag: '🇿🇼', country: 'Zimbabwe', rate: 322, countryCode: '+263', operators: ['Econet', 'NetOne', 'Telecel'], available: false, iso2: 'zw' },

  // ==========================================
  // AFRIQUE AUSTRALE
  // ==========================================
  { code: 'BWP', flag: '🇧🇼', country: 'Botswana', rate: 13.6, countryCode: '+267', operators: ['Mascom', 'Orange', 'BTC'], available: false, iso2: 'bw' },
  { code: 'SZL', flag: '🇸🇿', country: 'Eswatini', rate: 18.5, countryCode: '+268', operators: ['MTN', 'Eswatini Mobile'], available: false, iso2: 'sz' },
  { code: 'LSL', flag: '🇱🇸', country: 'Lesotho', rate: 18.5, countryCode: '+266', operators: ['Vodacom', 'Econet'], available: false, iso2: 'ls' },
  { code: 'NAD', flag: '🇳🇦', country: 'Namibie', rate: 18.5, countryCode: '+264', operators: ['MTC', 'Telecom Namibia'], available: false, iso2: 'na' },
  { code: 'ZAR', flag: '🇿🇦', country: 'Afrique du Sud', rate: 18.5, countryCode: '+27', operators: ['Vodacom', 'MTN', 'Cell C', 'Telkom'], available: false, iso2: 'za' },
];

// ==========================================
// UTILITAIRES
// ==========================================

// Pays disponibles pour retrait immédiat
export const AVAILABLE_COUNTRIES = ALL_COUNTRIES.filter(c => c.available);

// Pays "bientôt disponibles"
export const COMING_SOON_COUNTRIES = ALL_COUNTRIES.filter(c => !c.available);

// Liste des indicatifs téléphoniques (sans doublons)
export const COUNTRY_CODES = [...new Map(ALL_COUNTRIES.map(c => [c.countryCode, { code: c.countryCode, country: c.country, flag: c.flag }])).values()];

// Liste pour la page d'accueil (tous les pays, sans doublons de nom) - AJOUT DE countryCode
export const HOME_COUNTRIES = [...new Map(ALL_COUNTRIES.map(c => [c.country, { name: c.country, flag: c.flag, countryCode: c.countryCode }])).values()];

// Taux de change uniques par devise (avec code pays ISO2 pour flagcdn)
const CURRENCY_ISO2: Record<string, string> = {
  XOF: 'ci', XAF: 'cm', GHS: 'gh', KES: 'ke', NGN: 'ng',
  UGX: 'ug', RWF: 'rw', TZS: 'tz', CDF: 'cd', DZD: 'dz',
  EGP: 'eg', LYD: 'ly', MAD: 'ma', SDG: 'sd', TND: 'tn',
  CVE: 'cv', GMD: 'gm', GNF: 'gn', LRD: 'lr', MRU: 'mr',
  SLL: 'sl', AOA: 'ao', STN: 'st', BIF: 'bi', KMF: 'km',
  DJF: 'dj', ERN: 'er', ETB: 'et', MGA: 'mg', MWK: 'mw',
  MUR: 'mu', MZN: 'mz', SCR: 'sc', SOS: 'so', SSP: 'ss',
  ZMW: 'zm', ZWL: 'zw', BWP: 'bw', SZL: 'sz', LSL: 'ls',
  NAD: 'na', ZAR: 'za',
};

export const LIVE_RATES = [...new Map(ALL_COUNTRIES.map(c => [c.code, { currency: c.code, rate: c.rate, flag: c.flag, name: c.code, iso2: CURRENCY_ISO2[c.code] || 'ci' }])).values()];

// Nombre total de pays
export const TOTAL_COUNTRIES = new Set(ALL_COUNTRIES.map(c => c.country)).size;
export const ACTIVE_COUNTRIES = AVAILABLE_COUNTRIES.length;
export const COMING_SOON_COUNT = COMING_SOON_COUNTRIES.length;