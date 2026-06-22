// ==========================================
// ZERO-DEPENDENCY ZOD POLYFILL / VALIDATOR
// ==========================================

class ZodError extends Error {
  errors: { path: (string | number)[]; message: string }[];
  constructor(errors: { path: (string | number)[]; message: string }[]) {
    super(JSON.stringify(errors));
    this.name = 'ZodError';
    this.errors = errors;
  }
}

interface Validator {
  validate: (val: any) => string | null;
}

const zNumber = () => {
  let validators: ((val: number) => string | null)[] = [
    (val) => (typeof val !== 'number' || isNaN(val) ? 'Le montant doit être un nombre.' : null),
  ];

  const self = {
    validate: (val: any) => {
      for (const fn of validators) {
        const err = fn(val);
        if (err) return err;
      }
      return null;
    },
    min: (minVal: number, msg: string) => {
      validators.push((val) => (val < minVal ? msg : null));
      return self;
    },
    max: (maxVal: number, msg: string) => {
      validators.push((val) => (val > maxVal ? msg : null));
      return self;
    },
  };

  return self;
};

const zString = () => {
  let validators: ((val: string) => string | null)[] = [
    (val) => (typeof val !== 'string' ? 'Veuillez saisir un texte.' : null),
  ];

  const self = {
    validate: (val: any) => {
      for (const fn of validators) {
        const err = fn(val);
        if (err) return err;
      }
      return null;
    },
    min: (minLen: number, msg: string) => {
      validators.push((val) => (val.length < minLen ? msg : null));
      return self;
    },
    max: (maxLen: number, msg: string) => {
      validators.push((val) => (val.length > maxLen ? msg : null));
      return self;
    },
    regex: (re: RegExp, msg: string) => {
      validators.push((val) => (!re.test(val) ? msg : null));
      return self;
    },
  };

  return self;
};

const zEnum = (values: string[], opts?: { errorMap?: () => { message: string } }) => {
  return {
    validate: (val: any) => {
      if (typeof val !== 'string' || !values.includes(val)) {
        return opts?.errorMap?.()?.message || 'Sélection invalide.';
      }
      return null;
    },
  };
};

const zObject = (shape: Record<string, Validator>) => {
  return {
    parse: (data: any) => {
      const errors: { path: (string | number)[]; message: string }[] = [];
      const result: any = {};

      if (!data || typeof data !== 'object') {
        throw new ZodError([{ path: [], message: 'Données invalides.' }]);
      }

      for (const key in shape) {
        const val = data[key];
        const err = shape[key].validate(val);
        if (err) {
          errors.push({ path: [key], message: err });
        } else {
          result[key] = val;
        }
      }

      if (errors.length > 0) {
        throw new ZodError(errors);
      }

      return result;
    },
    safeParse: (data: any) => {
      try {
        const parsed = zObject(shape).parse(data);
        return { success: true as const, data: parsed };
      } catch (err: any) {
        if (err instanceof ZodError) {
          return { success: false as const, error: err };
        }
        return { success: false as const, error: new ZodError([{ path: [], message: err.message }]) };
      }
    },
  };
};

export const z = {
  object: zObject,
  number: zNumber,
  string: zString,
  enum: zEnum,
};

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type TransactionStatus = 'PENDING' | 'PAYPAL_APPROVED' | 'MOBILE_MONEY_SENT' | 'FAILED';

export interface Transaction {
  id: string;
  date: string;
  amountUSD: number;
  receivedAmount: number;
  currency: string;
  status: TransactionStatus;
  reference: string;
  phone: string;
  paypalOrderId?: string;
  flutterwaveReference?: string;
  exchangeRate: number;
  errorReason?: string;
  timeline: {
    status: TransactionStatus;
    timestamp: string;
    description: string;
  }[];
}

export interface Stats {
  totalReceived: number;
  totalTransactions: number;
  successRate: number;
  pendingTransactions: number;
}

export type KYCStatus = 'NONE' | 'PENDING_AI' | 'PENDING_HUMAN' | 'APPROVED' | 'REJECTED';

export interface KYCDetails {
  status: KYCStatus;
  documentType?: string;
  submittedAt?: string;
  reason?: string;
}

export type MobileOperator = 'MTN' | 'Orange' | 'Wave' | 'Moov' | 'Airtel' | 'Safaricom';

export interface Wallet {
  id: string;
  phone: string;
  operator: MobileOperator;
  isDefault: boolean;
  countryCode: string;
}

export interface LiveRate {
  currency: string;
  name: string;
  rate: number;
  flag: string;
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

export const WithdrawSchema = z.object({
  amountUSD: z.number()
    .min(10, 'Le montant minimum est de 10 USD.')
    .max(2000, 'Le montant maximum est de 2000 USD.'),
  currency: z.enum(['XOF', 'XAF', 'GHS', 'KES', 'NGN'], {
    errorMap: () => ({ message: 'Veuillez choisir une devise valide.' }),
  }),
  phone: z.string()
    .min(8, 'Le numéro de téléphone est trop court.')
    .max(15, 'Le numéro de téléphone est trop long.')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Le format du numéro de téléphone est invalide. Exemple: +2250700000000'),
});

export const WalletSchema = z.object({
  phone: z.string()
    .min(8, 'Le numéro est trop court.')
    .max(15, 'Le numéro est trop long.')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Format invalide. Exemple: +2250700000000'),
  operator: z.enum(['MTN', 'Orange', 'Wave', 'Moov', 'Airtel', 'Safaricom'], {
    errorMap: () => ({ message: 'Veuillez choisir un opérateur valide.' }),
  }),
});

// ==========================================
// LIVE EXCHANGE RATES (FALLBACK)
// ==========================================

export const LIVE_RATES: LiveRate[] = [
  { currency: 'XOF', name: 'Franc CFA (BCEAO)', rate: 612.5, flag: '🇧🇯' },
  { currency: 'XAF', name: 'Franc CFA (BEAC)', rate: 612.5, flag: '🇨🇲' },
  { currency: 'GHS', name: 'Cedi ghanéen', rate: 14.8, flag: '🇬🇭' },
  { currency: 'KES', name: 'Shilling kényan', rate: 129.2, flag: '🇰🇪' },
  { currency: 'NGN', name: 'Naira nigérian', rate: 1540.0, flag: '🇳🇬' },
];

// ==========================================
// API CONFIGURATION
// ==========================================

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');

// ==========================================
// MOCK DATABASE & LOCALSTORAGE FALLBACK
// ==========================================

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-892401',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    amountUSD: 120.00,
    receivedAmount: 68400,
    currency: 'XOF',
    status: 'MOBILE_MONEY_SENT',
    reference: 'REF-MTN-94021',
    phone: '+2250748123456',
    paypalOrderId: 'PAY-8X720491B',
    flutterwaveReference: 'FLW-MOCK-99120',
    exchangeRate: 612.5,
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), description: 'Initiation du retrait' },
      { status: 'PAYPAL_APPROVED', timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(), description: 'Paiement PayPal validé' },
      { status: 'MOBILE_MONEY_SENT', timestamp: new Date(Date.now() - 3600000 * 3.7).toISOString(), description: 'Fonds transférés sur Mobile Money' },
    ],
  },
  {
    id: 'TX-892398',
    date: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    amountUSD: 50.00,
    receivedAmount: 688.2,
    currency: 'GHS',
    status: 'MOBILE_MONEY_SENT',
    reference: 'REF-WAVE-88204',
    phone: '+233201234567',
    paypalOrderId: 'PAY-3V983204X',
    flutterwaveReference: 'FLW-MOCK-98204',
    exchangeRate: 14.8,
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), description: 'Initiation du retrait' },
      { status: 'PAYPAL_APPROVED', timestamp: new Date(Date.now() - 86400000 * 1.49).toISOString(), description: 'Paiement PayPal validé' },
      { status: 'MOBILE_MONEY_SENT', timestamp: new Date(Date.now() - 86400000 * 1.45).toISOString(), description: 'Fonds transférés sur Mobile Money' },
    ],
  },
  {
    id: 'TX-892392',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    amountUSD: 250.00,
    receivedAmount: 30039,
    currency: 'KES',
    status: 'PENDING',
    reference: 'REF-MPESA-22041',
    phone: '+254712345678',
    paypalOrderId: 'PAY-1A908420C',
    exchangeRate: 129.2,
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), description: 'Initiation du retrait, en attente de validation PayPal' },
    ],
  },
  {
    id: 'TX-892381',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    amountUSD: 80.00,
    receivedAmount: 114268,
    currency: 'NGN',
    status: 'FAILED',
    reference: 'REF-AIRTEL-55012',
    phone: '+2348012345678',
    paypalOrderId: 'PAY-4B892014M',
    exchangeRate: 1540.0,
    errorReason: 'Le compte PayPal de l\'expéditeur a un litige en cours.',
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), description: 'Initiation du retrait' },
      { status: 'FAILED', timestamp: new Date(Date.now() - 86400000 * 6.9).toISOString(), description: 'Échec de la transaction' },
    ],
  },
];

const MOCK_WALLETS: Wallet[] = [
  { id: 'W-01', phone: '+2250748123456', operator: 'Orange', isDefault: true, countryCode: '+225' },
  { id: 'W-02', phone: '+2250567890123', operator: 'MTN', isDefault: false, countryCode: '+225' },
];

const getLocalStorageData = <T>(key: string, initialData: T): T => {
  if (typeof window === 'undefined') return initialData;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
};

const setLocalStorageData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// API CLIENT IMPLEMENTATION
// ==========================================

export const api = {
  // --- AUTHENTICATION ---
  getCurrentUser: async () => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('pm_auth_user');
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
    }
    return null;
  },

  // --- STATISTICS (via /dashboard/stats) ---
  getStats: async (): Promise<Stats> => {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          return {
            totalReceived: parseFloat(data.data.financials?.totalVolumeUSD || 0),
            totalTransactions: data.data.overview?.successfulTransactions || 0,
            successRate: parseFloat(data.data.overview?.successRate || 0),
            pendingTransactions: data.data.overview?.pendingTransactions || 0,
          };
        }
      }
    } catch (e) {
      console.warn('⚠️ Backend offline, using mock stats');
    }

    const txs = getLocalStorageData<Transaction[]>('pm_transactions', MOCK_TRANSACTIONS);
    const successfulTxs = txs.filter((t) => t.status === 'MOBILE_MONEY_SENT');
    const pendingTxs = txs.filter((t) => t.status === 'PENDING' || t.status === 'PAYPAL_APPROVED');
    const totalReceived = successfulTxs.reduce((acc, curr) => acc + curr.amountUSD, 0);
    const totalAttempted = txs.filter((t) => t.status !== 'PENDING').length;
    const successRate = totalAttempted > 0 ? (successfulTxs.length / totalAttempted) * 100 : 100;

    return {
      totalReceived,
      totalTransactions: successfulTxs.length,
      successRate,
      pendingTransactions: pendingTxs.length,
    };
  },

  // --- TRANSACTIONS (via /dashboard/transactions) ---
  getTransactions: async (filters?: { status?: string; currency?: string }): Promise<Transaction[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.currency && filters.currency !== 'ALL') params.append('currency', filters.currency);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_URL}/dashboard/transactions${query}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) return data.data;
      }
    } catch (e) {
      console.warn('⚠️ Backend offline, using mock transactions');
    }

    let txs = getLocalStorageData<Transaction[]>('pm_transactions', MOCK_TRANSACTIONS);
    if (filters?.status && filters.status !== 'ALL') {
      txs = txs.filter((t) => t.status === filters.status);
    }
    if (filters?.currency && filters.currency !== 'ALL') {
      txs = txs.filter((t) => t.currency === filters.currency);
    }
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getTransactionById: async (id: string): Promise<Transaction | null> => {
    try {
      const res = await fetch(`${API_URL}/dashboard/transactions/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) return data.data;
      }
    } catch (e) {}

    const txs = getLocalStorageData<Transaction[]>('pm_transactions', MOCK_TRANSACTIONS);
    return txs.find((t) => t.id === id) || null;
  },

  // --- ORDER CREATION (via /payments/create-order) ---
  createOrder: async (data: { amountUSD: number; currency: string; phone: string }): Promise<Transaction> => {
    const parsed = WithdrawSchema.parse(data);

    try {
      const res = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD: parsed.amountUSD,
          currencyCode: parsed.currency,
          phoneNumber: parsed.phone,
          userEmail: 'user@paymaestro.com',
        }),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback mock
    const ratesMap = new Map(LIVE_RATES.map((r) => [r.currency, r.rate]));
    const exchangeRate = ratesMap.get(parsed.currency) || 612.5;
    const netUSD = parsed.amountUSD * 0.93;
    const receivedAmount = Math.round(netUSD * exchangeRate);

    const newTx: Transaction = {
      id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      amountUSD: parsed.amountUSD,
      receivedAmount,
      currency: parsed.currency,
      status: 'PENDING',
      reference: `REF-${parsed.currency}-${Math.floor(10000 + Math.random() * 90000)}`,
      phone: parsed.phone,
      paypalOrderId: `PAY-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      exchangeRate,
      timeline: [
        { status: 'PENDING', timestamp: new Date().toISOString(), description: 'Initiation du retrait' },
      ],
    };

    const txs = getLocalStorageData<Transaction[]>('pm_transactions', MOCK_TRANSACTIONS);
    txs.unshift(newTx);
    setLocalStorageData('pm_transactions', txs);

    setTimeout(() => {
      const currentTxs = getLocalStorageData<Transaction[]>('pm_transactions', []);
      const match = currentTxs.find((t) => t.id === newTx.id);
      if (match) {
        match.status = 'PAYPAL_APPROVED';
        match.timeline.push({ status: 'PAYPAL_APPROVED', timestamp: new Date().toISOString(), description: 'Paiement PayPal validé.' });
        setLocalStorageData('pm_transactions', currentTxs);
        setTimeout(() => {
          const finalTxs = getLocalStorageData<Transaction[]>('pm_transactions', []);
          const finalMatch = finalTxs.find((t) => t.id === newTx.id);
          if (finalMatch) {
            finalMatch.status = 'MOBILE_MONEY_SENT';
            finalMatch.flutterwaveReference = `FLW-${Math.floor(100000 + Math.random() * 900000)}`;
            finalMatch.timeline.push({ status: 'MOBILE_MONEY_SENT', timestamp: new Date().toISOString(), description: 'Fonds transférés sur Mobile Money.' });
            setLocalStorageData('pm_transactions', finalTxs);
          }
        }, 10000);
      }
    }, 10000);

    return newTx;
  },

  // --- KYC (via /kyc) ---
  getKYCStatus: async (): Promise<KYCDetails> => {
    try {
      const res = await fetch(`${API_URL}/kyc/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) return data.data;
      }
    } catch (e) {}
    return getLocalStorageData<KYCDetails>('pm_kyc', { status: 'NONE' });
  },

  uploadKYC: async (documentType: string, file: File): Promise<KYCDetails> => {
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('document', file);
      const res = await fetch(`${API_URL}/kyc/upload`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) return data.data;
      }
    } catch (e) {}

    const newKyc: KYCDetails = { status: 'PENDING_AI', documentType, submittedAt: new Date().toISOString() };
    setLocalStorageData('pm_kyc', newKyc);
    setTimeout(() => {
      const currentKyc = getLocalStorageData<KYCDetails>('pm_kyc', { status: 'NONE' });
      if (currentKyc.status === 'PENDING_AI') {
        currentKyc.status = Math.random() > 0.3 ? 'APPROVED' : 'REJECTED';
        if (currentKyc.status === 'REJECTED') currentKyc.reason = 'Document illisible ou expiré.';
        setLocalStorageData('pm_kyc', currentKyc);
      }
    }, 8000);
    return newKyc;
  },

  resetKYC: async (): Promise<KYCDetails> => {
    const kyc = { status: 'NONE' as KYCStatus };
    setLocalStorageData('pm_kyc', kyc);
    return kyc;
  },

  // --- WALLETS (via /dashboard/wallets) ---
  getWallets: async (): Promise<Wallet[]> => {
    try {
      const res = await fetch(`${API_URL}/dashboard/wallets`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) return data.data;
      }
    } catch (e) {}
    return getLocalStorageData<Wallet[]>('pm_wallets', MOCK_WALLETS);
  },

  addWallet: async (data: { phone: string; operator: MobileOperator }): Promise<Wallet> => {
    const parsed = WalletSchema.parse(data);
    try {
      const res = await fetch(`${API_URL}/dashboard/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: parsed.phone, currencyCode: 'XOF' }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return d.data;
      }
    } catch (e) {}

    const wallets = getLocalStorageData<Wallet[]>('pm_wallets', MOCK_WALLETS);
    let countryCode = '+225';
    if (parsed.phone.startsWith('+233')) countryCode = '+233';
    else if (parsed.phone.startsWith('+254')) countryCode = '+254';
    else if (parsed.phone.startsWith('+234')) countryCode = '+234';
    else if (parsed.phone.startsWith('+221')) countryCode = '+221';

    const newWallet: Wallet = {
      id: `W-${Math.floor(10 + Math.random() * 90)}`,
      phone: parsed.phone,
      operator: parsed.operator,
      isDefault: wallets.length === 0,
      countryCode,
    };
    wallets.push(newWallet);
    setLocalStorageData('pm_wallets', wallets);
    return newWallet;
  },

  deleteWallet: async (id: string): Promise<boolean> => {
    try {
      await fetch(`${API_URL}/dashboard/wallets/${id}`, { method: 'DELETE' });
    } catch (e) {}
    let wallets = getLocalStorageData<Wallet[]>('pm_wallets', MOCK_WALLETS);
    wallets = wallets.filter((w) => w.id !== id);
    if (wallets.length > 0) wallets[0].isDefault = true;
    setLocalStorageData('pm_wallets', wallets);
    return true;
  },

  setDefaultWallet: async (id: string): Promise<Wallet | null> => {
    try {
      const res = await fetch(`${API_URL}/dashboard/wallets/${id}/default`, { method: 'PUT' });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) return d.data;
      }
    } catch (e) {}
    const wallets = getLocalStorageData<Wallet[]>('pm_wallets', MOCK_WALLETS);
    let updated: Wallet | null = null;
    wallets.forEach((w) => { w.isDefault = w.id === id; if (w.id === id) updated = w; });
    setLocalStorageData('pm_wallets', wallets);
    return updated;
  },

  // --- REAL BACKEND API ---
  rates: {
    all: async () => {
      const res = await fetch(`${API_URL}/rates`);
      if (!res.ok) throw new Error('Failed to fetch rates');
      return await res.json();
    }
  },
  payments: {
    estimate: async (amountUSD: number, currency: string) => {
      const res = await fetch(`${API_URL}/payments/estimate?amountUSD=${amountUSD}&currencyCode=${currency}`);
      if (!res.ok) throw new Error('Failed to get estimate');
      return await res.json();
    }
  },
  auth: {
    google: async (accessToken: string) => {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: accessToken }),
      });
      if (!res.ok) throw new Error('Failed to authenticate');
      return await res.json();
    }
  },

  // --- ONBOARDING ---
  sendOTP: async (phone: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: `Code envoyé au ${phone}` };
  },

  verifyOTP: async (phone: string, code: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      return { success: true, message: 'Numéro vérifié avec succès' };
    }
    return { success: false, message: 'Code invalide. Veuillez réessayer.' };
  },

  validateDocumentAI: async (file: File, fullName: string): Promise<{ valid: boolean; detectedName: string; confidence: number; reason?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 3500));
    const confidence = 0.7 + Math.random() * 0.3;
    if (Math.random() > 0.25) {
      return { valid: true, detectedName: fullName, confidence: parseFloat(confidence.toFixed(2)) };
    }
    const reasons = ['Le nom ne correspond pas.', 'Document illisible.', 'Document expiré.'];
    return { valid: false, detectedName: 'Non détecté', confidence: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)), reason: reasons[Math.floor(Math.random() * reasons.length)] };
  },

  updateUserProfile: async (data: Record<string, any>): Promise<any> => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('pm_auth_user');
      if (raw) {
        try {
          const user = JSON.parse(raw);
          const updated = { ...user, ...data };
          localStorage.setItem('pm_auth_user', JSON.stringify(updated));
          return updated;
        } catch {}
      }
    }
    return data;
  },
};

// ==========================================
// TAUX DE CHANGE EN DIRECT
// ==========================================

export async function fetchLiveRates(): Promise<any[]> {
  try {
    const res = await api.rates.all();
    if (res.success && res.data) {
      return (res.data as any[]).map((r: any) => ({
        currency: r.code,
        rate: r.rate,
        flag: getFlagEmoji(r.code),
        label: r.name,
      }));
    }
  } catch (error) {
    console.warn('⚠️ Backend offline, using fallback rates');
  }
  return FALLBACK_RATES;
}

export const FALLBACK_RATES = [
  { currency: 'XOF', rate: 618.50, flag: '🇨🇮', label: 'FCFA - UEMOA' },
  { currency: 'XAF', rate: 618.50, flag: '🇨🇲', label: 'FCFA - CEMAC' },
  { currency: 'KES', rate: 135, flag: '🇰🇪', label: 'Shilling Kenyan' },
  { currency: 'NGN', rate: 1550, flag: '🇳🇬', label: 'Naira Nigérian' },
  { currency: 'GHS', rate: 13.50, flag: '🇬🇭', label: 'Cedi Ghanéen' },
];

export function getFlagEmoji(currencyCode: string): string {
  const flags: Record<string, string> = {
    XOF: '🇨🇮', XAF: '🇨🇲', KES: '🇰🇪', NGN: '🇳🇬',
    GHS: '🇬🇭', UGX: '🇺🇬', RWF: '🇷🇼', TZS: '🇹🇿',
  };
  return flags[currencyCode] || '🌍';
}