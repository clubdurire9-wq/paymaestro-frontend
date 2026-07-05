// ==========================================
// PAYMAESTRO API CLIENT
// ==========================================

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');

// ==========================================
// VALIDATION HELPERS
// ==========================================

function zPhone() {
  return {
    parse: (val: string) => {
      if (!val || val.length < 8) throw new Error('Le numéro de téléphone est trop court.');
      if (val.length > 15) throw new Error('Le numéro de téléphone est trop long.');
      if (!/^\+?[1-9]\d{1,14}$/.test(val)) throw new Error('Format invalide. Exemple: +2250700000000');
      return val;
    },
    safeParse: (val: string) => {
      try { return { success: true as const, data: zPhone().parse(val) }; }
      catch (e: any) { return { success: false as const, error: { errors: [{ path: ['phone'], message: e.message }] } }; }
    },
  };
}

function zOperator() {
  const operators = ['MTN', 'Orange', 'Wave', 'Moov', 'Airtel', 'Safaricom'];
  return {
    parse: (val: string) => {
      if (!operators.includes(val)) throw new Error('Opérateur invalide');
      return val;
    },
    safeParse: (val: string) => {
      try { return { success: true as const, data: zOperator().parse(val) }; }
      catch (e: any) { return { success: false as const, error: { errors: [{ path: ['operator'], message: e.message }] } }; }
    },
  };
}

export const WalletSchema = {
  safeParse: (data: { phone: string; operator: string }): {
    success: boolean;
    data?: { phone: string; operator: string };
    error?: { errors: { path: string[]; message: string }[] };
  } => {
    const errors: { path: string[]; message: string }[] = [];
    if (!data.phone || data.phone.length < 8) errors.push({ path: ['phone'], message: 'Numéro trop court' });
    if (!['MTN', 'Orange', 'Wave', 'Moov', 'Airtel', 'Safaricom'].includes(data.operator)) errors.push({ path: ['operator'], message: 'Opérateur invalide' });
    if (errors.length) return { success: false, error: { errors } };
    return { success: true, data };
  },
};

export const WithdrawSchema = {
  safeParse: (data: { amountUSD: number; currency: string; phone: string }) => {
    const errors: { path: string; message: string }[] = [];
    if (!data.amountUSD || data.amountUSD < 10 || data.amountUSD > 2000) errors.push({ path: 'amountUSD', message: 'Le montant doit être entre 10 et 2000 USD' });
    if (!['XOF', 'XAF', 'GHS', 'KES', 'NGN'].includes(data.currency)) errors.push({ path: 'currency', message: 'Devise invalide' });
    if (!data.phone || data.phone.length < 8) errors.push({ path: 'phone', message: 'Téléphone invalide' });
    if (errors.length) return { success: false as const, error: { errors } };
    return { success: true as const, data };
  },
};

// ==========================================
// HELPERS
// ==========================================

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = sessionStorage.getItem('paymaestro_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...options?.headers,
      },
    });
  } catch (e: any) {
    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
  }
  let data: any;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Erreur ${res.status} — Réponse vide du serveur`);
  }
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Erreur ${res.status}`);
  }
  return data.data !== undefined ? data.data : data;
}

async function requestFormData<T>(url: string, formData: FormData): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Erreur ${res.status}`);
  }
  return data.data !== undefined ? data.data : data;
}

// ==========================================
// AUTH
// ==========================================

export const api = {
  auth: {
    google: async (accessToken: string) => {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Erreur d'authentification Google");
      return data;
    },

    verifyMFA: async (code: string, mfaToken: string) => {
      const res = await fetch(`${API_URL}/auth/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mfaToken}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.error || 'Code MFA invalide');
      return data;
    },

    requestOTP: (phoneNumber: string) =>
      request<{ message: string }>(`${API_URL}/auth/request-otp`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      }),

    verifyOTP: (phoneNumber: string, code: string) =>
      request<{ phoneNumber: string; isPhoneVerified: boolean }>(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, code }),
      }),

    generateStepUpToken: (body: { password?: string; twoFactorCode?: string }) =>
      request<{ stepUpToken: string; expiresIn: number }>(`${API_URL}/auth/step-up`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getMe: () => request<any>(`${API_URL}/auth/me`),

    updateProfile: (data: Record<string, any>) =>
      request<any>(`${API_URL}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    uploadAvatar: (image: string) =>
      request<any>(`${API_URL}/auth/avatar`, {
        method: 'POST',
        body: JSON.stringify({ image }),
      }),

    createPassword: (password: string, confirmPassword: string) =>
      request<{ message: string }>(`${API_URL}/auth/create-password`, {
        method: 'POST',
        body: JSON.stringify({ password, confirmPassword }),
      }),

    completeLogin: (body: { loginToken: string; password?: string; createPassword?: boolean; twoFactorCode?: string }) =>
      request<{ token: string; user: any; status: string; loginToken?: string; geo?: { country: string; city: string; region: string; isp: string; ip: string } }>(`${API_URL}/auth/complete-login`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) =>
      request<{ message: string }>(`${API_URL}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      }),

    confirmLocation: (loginToken: string) =>
      request<{ token: string; user: any; status: string }>(`${API_URL}/auth/confirm-location`, {
        method: 'POST',
        body: JSON.stringify({ loginToken }),
      }),

    getPasswordStatus: () =>
      request<{ hasPassword: boolean }>(`${API_URL}/auth/password-status`),

    getAdminCheck: () => request<any>(`${API_URL}/auth/admin-check`),

    getOnboardingStatus: () => request<any>(`${API_URL}/auth/onboarding-status`),

    getApiKeys: () => request<any[]>(`${API_URL}/auth/api-keys`),

    createApiKey: () =>
      request<any>(`${API_URL}/auth/api-keys`, { method: 'POST' }),

    revokeApiKey: (id: string) =>
      request<any>(`${API_URL}/auth/api-keys/${id}`, { method: 'DELETE' }),

    createPaymentPage: (data: any) =>
      request<any>(`${API_URL}/auth/payment-page`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    activateWhiteLabel: (data: any) =>
      request<any>(`${API_URL}/auth/white-label/activate`, { method: 'POST', body: JSON.stringify(data) }),

    deactivateWhiteLabel: () =>
      request<any>(`${API_URL}/auth/white-label/deactivate`, { method: 'POST' }),
  },

  // ==========================================
  // 2FA
  // ==========================================

  twoFactor: {
    getStatus: () => request<{ enabled: boolean; enabledAt?: string }>(`${API_URL}/2fa/status`),
    generateSecret: () => request<{ secret: string; qrCode?: string }>(`${API_URL}/2fa/generate`, { method: 'POST' }),
    enable: (token: string) => request<any>(`${API_URL}/2fa/enable`, { method: 'POST', body: JSON.stringify({ token }) }),
    disable: (token: string) => request<any>(`${API_URL}/2fa/disable`, { method: 'POST', body: JSON.stringify({ token }) }),
  },

  // ==========================================
  // KYC
  // ==========================================

  kyc: {
    getStatus: () => request<any>(`${API_URL}/kyc/status`),
    upload: (documentType: string, file: File, backFile?: File | null) => {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('document', file);
      if (backFile) formData.append('documentBack', backFile);
      return requestFormData<any>(`${API_URL}/kyc/upload`, formData);
    },
    dispute: (reason: string) =>
      request<any>(`${API_URL}/kyc/dispute`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },

  // ==========================================
  // DASHBOARD
  // ==========================================

  dashboard: {
    getStats: () => request<any>(`${API_URL}/dashboard/stats`),
    getTransactions: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters || {});
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<any>(`${API_URL}/dashboard/transactions${query}`);
    },
    getTransactionById: (id: string) => request<any>(`${API_URL}/dashboard/transactions/${id}`),
    exportTransactions: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters || {});
      return request<any>(`${API_URL}/dashboard/export?${params.toString()}`);
    },
    getWallets: () => request<any[]>(`${API_URL}/dashboard/wallets`),
    getWalletSummary: () => request<any>(`${API_URL}/dashboard/wallets/summary`),
    createWallet: (data: { currencyCode: string; phoneNumber?: string }) =>
      request<any>(`${API_URL}/dashboard/wallets`, { method: 'POST', body: JSON.stringify(data) }),
    setDefaultWallet: (id: string) =>
      request<any>(`${API_URL}/dashboard/wallets/${id}/default`, { method: 'PUT' }),
  },

  // ==========================================
  // WALLET
  // ==========================================

  wallet: {
    getBalance: () => request<any>(`${API_URL}/wallet/balance`),
    getStats: () => request<any>(`${API_URL}/wallet/stats`),
    getTransactions: () => request<any[]>(`${API_URL}/wallet/transactions`),
    deposit: (amountUSD: number, method: string) =>
      request<any>(`${API_URL}/wallet/deposit`, { method: 'POST', body: JSON.stringify({ amountUSD, method }) }),
    depositMobile: (data: { phoneNumber: string; amountLocal: number; currencyCode: string; operator?: string }) =>
      request<any>(`${API_URL}/wallet/deposit-mobile`, { method: 'POST', body: JSON.stringify(data) }),
    withdrawToWallet: (data: { amountUSD: number; targetCurrency: string; exchangeRate: number }) =>
      request<any>(`${API_URL}/wallet/withdraw-to-wallet`, { method: 'POST', body: JSON.stringify(data) }),
    withdrawMobile: (data: { amountUSD: number; currencyCode: string; phoneNumber: string; exchangeRate: number; stepUpToken?: string; operator?: string }) =>
      request<any>(`${API_URL}/wallet/withdraw-to-mobile`, { method: 'POST', body: JSON.stringify(data) }),
    withdrawPayPal: (paypalEmail: string, amount: number) =>
      request<any>(`${API_URL}/wallet/withdraw-paypal`, { method: 'POST', body: JSON.stringify({ paypalEmail, amount }) }),
    setPassword: (password: string) =>
      request<any>(`${API_URL}/wallet/password`, { method: 'POST', body: JSON.stringify({ password }) }),
    verifyPassword: (password: string) =>
      request<{ verified: boolean }>(`${API_URL}/wallet/password/verify`, { method: 'POST', body: JSON.stringify({ password }) }),
    hasPassword: () => request<{ hasPassword: boolean }>(`${API_URL}/wallet/password/exists`),
    lookupRecipient: (data: { phoneNumber: string; currencyCode: string; operator?: string }) =>
      request<any>(`${API_URL}/wallet/lookup-recipient`, { method: 'POST', body: JSON.stringify(data) }),
    resolveMomo: (data: { phoneNumber: string; currencyCode: string; operator?: string }) =>
      request<any>(`${API_URL}/wallet/resolve-momo`, { method: 'POST', body: JSON.stringify(data) }),
    lookupUser: (email: string) =>
      request<any>(`${API_URL}/wallet/lookup-user`, { method: 'POST', body: JSON.stringify({ email }) }),
    transferToMobile: (data: any) =>
      request<any>(`${API_URL}/wallet/transfer-mobile`, { method: 'POST', body: JSON.stringify(data) }),
    pmToPm: (recipientEmail: string, amount: number) =>
      request<any>(`${API_URL}/wallet/pm-to-pm`, { method: 'POST', body: JSON.stringify({ recipientEmail, amount }) }),
  },

  // ==========================================
  // PAYMENTS
  // ==========================================

  payments: {
    createOrder: (data: { amountUSD: number; phoneNumber: string; currencyCode: string; userEmail?: string }) => {
      return request<any>(`${API_URL}/payments/create-order`, {
        method: 'POST',
        body: JSON.stringify({ ...data, userEmail: data.userEmail || '' }),
      });
    },
    captureOrder: (paypalOrderId: string, transactionId?: number) =>
      request<any>(`${API_URL}/payments/capture-order`, {
        method: 'POST',
        body: JSON.stringify({ paypalOrderId, transactionId }),
      }),
    verifyRecipient: (data: { phoneNumber: string; currencyCode: string; operator?: string }) =>
      request<any>(`${API_URL}/payments/verify-recipient`, { method: 'POST', body: JSON.stringify(data) }),
    getOrderStatus: (orderId: string) => request<any>(`${API_URL}/payments/order/${orderId}`),
    getCurrencies: () => request<any[]>(`${API_URL}/payments/currencies`),
    estimate: (amountUSD: number, currencyCode: string) =>
      request<any>(`${API_URL}/payments/estimate?amountUSD=${amountUSD}&currencyCode=${currencyCode}`),
    createPayPalDeposit: (amountUSD: number, returnUrl?: string, cancelUrl?: string) =>
      request<{ paypalOrderId: string; approvalUrl: string; amountUSD: number }>(`${API_URL}/payments/create-paypal-deposit`, {
        method: 'POST',
        body: JSON.stringify({ amountUSD, returnUrl, cancelUrl }),
      }),
    capturePayPalDeposit: (paypalOrderId: string) =>
      request<{ amountCredited: number; currency: string; payerEmail: string; captureId: string }>(`${API_URL}/payments/capture-paypal-deposit`, {
        method: 'POST',
        body: JSON.stringify({ paypalOrderId }),
      }),
  },

  // ==========================================
  // VIRTUAL CARDS
  // ==========================================

  cards: {
    list: () => request<any[]>(`${API_URL}/cards`),
    create: (data?: { brand?: string; spendingLimit?: number; billingCurrency?: string; provider?: string }) =>
      request<any>(`${API_URL}/cards`, { method: 'POST', body: JSON.stringify(data || {}) }),
    details: (id: number | string) =>
      request<any>(`${API_URL}/cards/${id}/details`),
    toggle: (id: number | string, action: 'freeze' | 'unfreeze') =>
      request<any>(`${API_URL}/cards/${id}/toggle`, { method: 'PUT', body: JSON.stringify({ action }) }),
    cancel: (id: number | string) =>
      request<any>(`${API_URL}/cards/${id}`, { method: 'DELETE' }),
    recharge: (id: number | string, amount: number) =>
      request<any>(`${API_URL}/cards/${id}/recharge`, { method: 'POST', body: JSON.stringify({ amount }) }),
    balance: (id: number | string) =>
      request<any>(`${API_URL}/cards/${id}/balance`),
  },

  // ==========================================
  // CRYPTO
  // ==========================================

  crypto: {
    getRates: () => request<any>(`${API_URL}/crypto/rates`),
    generateAddress: (currency: string, network: string) =>
      request<any>(`${API_URL}/crypto/deposit-address`, { method: 'POST', body: JSON.stringify({ currency, network }) }),
    simulateDeposit: (currency: string, network: string, amountCrypto: number) =>
      request<any>(`${API_URL}/crypto/simulate-deposit`, { method: 'POST', body: JSON.stringify({ currency, network, amountCrypto }) }),
    withdraw: (data: { currency: string; network: string; amountUSD: number; destinationAddress: string }) =>
      request<any>(`${API_URL}/crypto/withdraw`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // ==========================================
  // BANK
  // ==========================================

  bank: {
    transfer: (data: any) =>
      request<any>(`${API_URL}/bank/transfer`, { method: 'POST', body: JSON.stringify(data) }),
    getTransfers: () => request<any[]>(`${API_URL}/bank/transfers`),
    verifyAccount: (data: { iban: string; swift?: string; accountHolder?: string }) =>
      request<any>(`${API_URL}/bank/verify`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // ==========================================
  // STRIPE
  // ==========================================

  stripe: {
    createAccount: () => request<any>(`${API_URL}/stripe/account`, { method: 'POST' }),
    createIBAN: (country?: string) => request<any>(`${API_URL}/stripe/iban`, { method: 'POST', body: JSON.stringify({ country }) }),
    getIBAN: () => request<any>(`${API_URL}/stripe/ibans`),
    deactivateIBAN: (ibanId: number) => request<any>(`${API_URL}/stripe/iban/${ibanId}/deactivate`, { method: 'PUT' }),
    activateIBAN: (ibanId: number) => request<any>(`${API_URL}/stripe/iban/${ibanId}/activate`, { method: 'PUT' }),
    deleteIBAN: (ibanId: number) => request<any>(`${API_URL}/stripe/iban/${ibanId}`, { method: 'DELETE' }),
    receive: (data: { amount: number; currency: string; description?: string }) =>
      request<any>(`${API_URL}/stripe/receive`, { method: 'POST', body: JSON.stringify(data) }),
    send: (data: { amount: number; iban: string; swift?: string; accountHolder?: string }) =>
      request<any>(`${API_URL}/stripe/send`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // ==========================================
  // EXCHANGE RATES
  // ==========================================

  rates: {
    all: () => request<any>(`${API_URL}/rates`),
    convert: (amount: number, from?: string, to?: string) =>
      request<any>(`${API_URL}/rates/convert?amount=${amount}&from=${from || 'USD'}&to=${to || 'XOF'}`),
    health: () => request<any>(`${API_URL}/rates/health`),
    refresh: () => request<any>(`${API_URL}/rates/refresh`, { method: 'POST' }),
  },

  // ==========================================
  // REPORTS
  // ==========================================

  reports: {
    transactions: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters || {});
      return request<any>(`${API_URL}/reports/transactions?${params.toString()}`);
    },
    summary: () => request<any>(`${API_URL}/reports/summary`),
    adminTransactions: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters || {});
      return request<any>(`${API_URL}/reports/admin/transactions?${params.toString()}`);
    },
  },

  // ==========================================
  // CHATBOT
  // ==========================================

  chatbot: {
    sendMessage: (message: string, sessionId?: string) =>
      request<any>(`${API_URL}/chatbot/message`, { method: 'POST', body: JSON.stringify({ message, sessionId }) }),
    reset: (sessionId: string) =>
      request<any>(`${API_URL}/chatbot/reset`, { method: 'POST', body: JSON.stringify({ sessionId }) }),
    health: () => request<any>(`${API_URL}/chatbot/health`),
    getTicketMessages: (ticketId: number | string) => request<any>(`${API_URL}/chatbot/ticket/${ticketId}/messages`),
    sendTicketMessage: (ticketId: number | string, message: string, userEmail?: string) =>
      request<any>(`${API_URL}/chatbot/ticket/${ticketId}/message`, { method: 'POST', body: JSON.stringify({ message, userEmail }) }),
    sendWithImages: (ticketId: number | string, message: string, files: File[], userEmail?: string) => {
      const formData = new FormData();
      formData.append('message', message);
      files.forEach(f => formData.append('images', f));
      if (userEmail) formData.append('userEmail', userEmail);
      return requestFormData<any>(`${API_URL}/chatbot/ticket/${ticketId}/send`, formData);
    },
  },

  // ==========================================
  // CONTACT
  // ==========================================

  contact: {
    create: (data: { name: string; email: string; subject?: string; message: string }) =>
      request<any>(`${API_URL}/contact`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // ==========================================
  // SUPPORT
  // ==========================================

  support: {
    getTickets: () => request<any[]>(`${API_URL}/support/tickets`),
    assign: (ticketId: string) =>
      request<any>(`${API_URL}/support/assign`, { method: 'POST', body: JSON.stringify({ ticketId }) }),
    resolve: (ticketId: string) =>
      request<any>(`${API_URL}/support/resolve`, { method: 'POST', body: JSON.stringify({ ticketId }) }),
    getMessages: (ticketId: string) => request<any[]>(`${API_URL}/support/tickets/${ticketId}/messages`),
    sendMessage: (ticketId: string, message: string) =>
      request<any>(`${API_URL}/support/message`, { method: 'POST', body: JSON.stringify({ ticketId, message }) }),
  },

  // ==========================================
  // REFERRAL
  // ==========================================

  referral: {
    getCode: () => request<any>(`${API_URL}/referral/code`),
    getStats: () => request<any>(`${API_URL}/referral/stats`),
    register: (code: string) =>
      request<any>(`${API_URL}/referral/register`, { method: 'POST', body: JSON.stringify({ referralCode: code }) }),
  },

  // ==========================================
  // ADMIN
  // ==========================================

  admin: {
    getStats: () => request<any>(`${API_URL}/admin/stats`),
    getLiveStats: () => request<any>(`${API_URL}/admin/stats/live`),
    getLiveActivity: () => request<any[]>(`${API_URL}/admin/activity/live`),
    getUserActivity: (userId: string) => request<any>(`${API_URL}/admin/activity/user/${userId}`),
    getUserProfile: (userId: string) => request<any>(`${API_URL}/admin/users/${userId}/profile`),
    searchUsers: (query: string) => request<any[]>(`${API_URL}/admin/users/search?query=${encodeURIComponent(query)}`),

    // KYC
    listPendingKYC: () => request<any[]>(`${API_URL}/admin/kyc/pending`),
    reviewKYC: (userId: string, action: 'APPROVE' | 'REJECT', reason?: string) =>
      request<any>(`${API_URL}/admin/kyc/review`, { method: 'POST', body: JSON.stringify({ userId, action, reason }) }),

    // Transactions
    searchTransactions: (query: string) =>
      request<any>(`${API_URL}/admin/transactions/search?query=${encodeURIComponent(query)}`),

    // Users
    toggleBan: (userId: string, ban: boolean, reason?: string) =>
      request<any>(`${API_URL}/admin/users/ban`, { method: 'POST', body: JSON.stringify({ userId, ban, reason }) }),
    freeze: (userId: string, reason: string, freezeType?: string) =>
      request<any>(`${API_URL}/admin/users/freeze`, { method: 'POST', body: JSON.stringify({ userId, reason, freezeType }) }),
    unfreeze: (userId: string) =>
      request<any>(`${API_URL}/admin/users/unfreeze`, { method: 'POST', body: JSON.stringify({ userId }) }),
    getFrozenAccounts: () => request<any[]>(`${API_URL}/admin/users/frozen`),
    blockServices: (userId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/users/block-services`, { method: 'POST', body: JSON.stringify({ userId, reason }) }),
    restoreServices: (userId: string) =>
      request<any>(`${API_URL}/admin/users/restore-services`, { method: 'POST', body: JSON.stringify({ userId }) }),

    // Refunds
    refund: (transactionId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/refund`, { method: 'POST', body: JSON.stringify({ transactionId, reason }) }),
    refundWithOptions: (data: any) =>
      request<any>(`${API_URL}/admin/refund/options`, { method: 'POST', body: JSON.stringify(data) }),
    refundToMobile: (data: any) =>
      request<any>(`${API_URL}/admin/refund-to-mobile`, { method: 'POST', body: JSON.stringify(data) }),
    refundToPayPal: (data: any) =>
      request<any>(`${API_URL}/admin/refund-to-paypal`, { method: 'POST', body: JSON.stringify(data) }),
    refundToBank: (data: any) =>
      request<any>(`${API_URL}/admin/refund-to-bank`, { method: 'POST', body: JSON.stringify(data) }),

    // Claims
    verifyClaim: (transactionId: string) => request<any>(`${API_URL}/admin/verify-claim/${transactionId}`),

    // P2P
    getPmToPmDetails: (transactionId: string) => request<any>(`${API_URL}/admin/pm-to-pm/${transactionId}`),
    reversePmToPm: (transactionId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/pm-to-pm/reverse`, { method: 'POST', body: JSON.stringify({ transactionId, reason }) }),

    // Sessions
    revokeSessions: (userId: string) =>
      request<any>(`${API_URL}/admin/sessions/revoke`, { method: 'POST', body: JSON.stringify({ userId }) }),

    // Security
    getBannedIPs: () => request<any[]>(`${API_URL}/admin/security/banned-ips`),
    unbanIP: (ip: string) => request<any>(`${API_URL}/admin/security/unban-ip`, { method: 'POST', body: JSON.stringify({ ip }) }),
    blockIP: (ip: string, reason?: string) =>
      request<any>(`${API_URL}/admin/security/block-ip`, { method: 'POST', body: JSON.stringify({ ip, reason }) }),
    getTarpitStats: () => request<any[]>(`${API_URL}/admin/security/tarpit-stats`),
    getFraudAlerts: () => request<any[]>(`${API_URL}/admin/security/fraud-alerts`),
    getIPDetails: (ip: string) => request<any>(`${API_URL}/admin/security/ip/${ip}`),

    // API Keys
    getAllApiKeys: () => request<any[]>(`${API_URL}/admin/api-keys`),
    revokeApiKey: (keyId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/api-keys/revoke`, { method: 'POST', body: JSON.stringify({ keyId, reason }) }),

    // Cards
    getAllCards: () => request<any[]>(`${API_URL}/admin/cards`),
    toggleCard: (id: string, action: 'freeze' | 'unfreeze') =>
      request<any>(`${API_URL}/admin/cards/${id}/toggle`, { method: 'POST', body: JSON.stringify({ action }) }),
    cancelCard: (id: string, reason?: string) =>
      request<any>(`${API_URL}/admin/cards/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),

    // Crypto
    getCryptoTransactions: () => request<any[]>(`${API_URL}/admin/crypto/transactions`),
    getCryptoStats: () => request<any>(`${API_URL}/admin/crypto/stats`),
    refundCrypto: (transactionId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/crypto/refund`, { method: 'POST', body: JSON.stringify({ transactionId, reason }) }),
    freezeCryptoUser: (userId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/crypto/freeze`, { method: 'POST', body: JSON.stringify({ userId, reason }) }),

    // Referrals
    getAllReferrals: () => request<any[]>(`${API_URL}/admin/referrals`),
    getReferralStats: () => request<any>(`${API_URL}/admin/referrals/stats`),
    revokeReferral: (referralId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/referrals/revoke`, { method: 'POST', body: JSON.stringify({ referralId, reason }) }),
    refundReferralCommission: (earningId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/referrals/refund-commission`, { method: 'POST', body: JSON.stringify({ earningId, reason }) }),
    getUserReferrals: (userId: string) => request<any>(`${API_URL}/admin/referrals/user/${userId}`),

    // Payment Pages
    getAllPaymentPages: () => request<any[]>(`${API_URL}/admin/payment-pages`),
    getPaymentPagesStats: () => request<any>(`${API_URL}/admin/payment-pages/stats`),
    revokePaymentPage: (userId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/payment-pages/${userId}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) }),
    freezePaymentPage: (userId: string, reason?: string) =>
      request<any>(`${API_URL}/admin/payment-pages/${userId}/freeze`, { method: 'POST', body: JSON.stringify({ reason }) }),
    unfreezePaymentPage: (userId: string) =>
      request<any>(`${API_URL}/admin/payment-pages/${userId}/unfreeze`, { method: 'POST' }),
    getPaymentPageTransactions: (userId: string) =>
      request<any[]>(`${API_URL}/admin/payment-pages/${userId}/transactions`),

    // Geo
    getUserGeo: (email: string) => request<any>(`${API_URL}/admin/user-geo/${encodeURIComponent(email)}`),

    // Payroll
    setSalary: (data: any) =>
      request<any>(`${API_URL}/admin/payroll/set-salary`, { method: 'POST', body: JSON.stringify(data) }),
    runPayroll: () => request<any>(`${API_URL}/admin/payroll/run-now`, { method: 'POST' }),
    getPayrollAgents: () => request<any[]>(`${API_URL}/admin/payroll/agents`),
    getPayrollHistory: () => request<any[]>(`${API_URL}/admin/payroll/history`),
  },

  // ==========================================
  // FINANCE (admin)
  // ==========================================

  finance: {
    getRevenueStats: () => request<any>(`${API_URL}/admin/finance/revenue/stats`),
    getRevenueHistory: (months?: number) =>
      request<any>(`${API_URL}/admin/finance/revenue/history${months ? `?months=${months}` : ''}`),
    withdraw: (data: { amount: number; destination: string; destinationType: string }) =>
      request<any>(`${API_URL}/admin/finance/withdraw`, { method: 'POST', body: JSON.stringify(data) }),
    exportPDF: () => request<any>(`${API_URL}/admin/finance/export-pdf`),
  },

  // ==========================================
  // AGENT
  // ==========================================

  agent: {
    heartbeat: () => request<any>(`${API_URL}/agent/heartbeat`, { method: 'POST' }),
    getStatus: () => request<any>(`${API_URL}/agent/status`),
    chat: {
      send: (message: string) => request<any>(`${API_URL}/agent/chat/send`, { method: 'POST', body: JSON.stringify({ message }) }),
      sendWithImages: (message: string, images: string[]) =>
        request<any>(`${API_URL}/agent/chat/send-with-images`, { method: 'POST', body: JSON.stringify({ message, images }) }),
      getMessages: () => request<any[]>(`${API_URL}/agent/chat/messages`),
      getMessagesPaged: (page?: number, limit?: number) =>
        request<any[]>(`${API_URL}/agent/chat/messages-paged${page ? `?page=${page}&limit=${limit || 50}` : ''}`),
      reply: (messageId: string, reply: string) =>
        request<any>(`${API_URL}/agent/chat/reply`, { method: 'POST', body: JSON.stringify({ messageId, reply }) }),
      getUnread: () => request<any>(`${API_URL}/agent/chat/unread`),
      clear: () => request<any>(`${API_URL}/agent/chat/clear`, { method: 'DELETE' }),
    },
  },

  // ==========================================
  // PUBLIC
  // ==========================================

  public: {
    payments: (data: any) =>
      request<any>(`${API_URL}/public/payments`, { method: 'POST', body: JSON.stringify(data) }),
    health: () => request<any>(`${API_URL}/public/health`),
    rates: () => request<any>(`${API_URL}/public/rates`),
  },

  // ==========================================
  // SECURITY
  // ==========================================

  security: {
    report: (data: any) =>
      request<any>(`${API_URL}/security/report`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // ==========================================
  // LEGACY (for backward compatibility)
  // ==========================================

  getCurrentUser: async () => {
    try {
      return await api.auth.getMe();
    } catch {
      return null;
    }
  },

  getStats: async () => {
    try {
      const data = await api.wallet.getStats();
      return {
        totalReceived: parseFloat(data.totalReceived || 0),
        totalTransactions: data.totalTransactions || 0,
        successRate: parseFloat(data.successRate ?? 100),
        pendingTransactions: data.pendingTransactions || 0,
        withdrawalsThisMonth: data.withdrawalsThisMonth || 0,
        monthlyStats: data.monthlyStats || [],
      };
    } catch {
      return { totalReceived: 0, totalTransactions: 0, successRate: 100, pendingTransactions: 0, withdrawalsThisMonth: 0, monthlyStats: [] };
    }
  },

  getTransactions: async (filters?: { status?: string; currency?: string }) => {
    try {
      const params: Record<string, string> = {};
      if (filters?.status && filters.status !== 'ALL') params.status = filters.status;
      if (filters?.currency && filters.currency !== 'ALL') params.currency = filters.currency;
      return await api.dashboard.getTransactions(Object.keys(params).length ? params : undefined);
    } catch {
      return [];
    }
  },

  getTransactionById: async (id: string) => {
    try {
      return await api.dashboard.getTransactionById(id);
    } catch {
      return null;
    }
  },

  createOrder: async (data: { amountUSD: number; currency: string; phone: string }) => {
    return api.payments.createOrder({
      amountUSD: data.amountUSD,
      currencyCode: data.currency,
      phoneNumber: data.phone,
    });
  },

  getKYCStatus: async () => {
    try {
      return await api.kyc.getStatus();
    } catch {
      return { status: 'NONE' };
    }
  },

  uploadKYC: async (documentType: string, file: File, backFile?: File | null) => {
    return api.kyc.upload(documentType, file, backFile);
  },

  resetKYC: async (): Promise<KYCDetails> => {
    return { status: 'NONE' as KYCStatus };
  },

  getWallets: async () => {
    try {
      return await api.dashboard.getWallets();
    } catch {
      return [];
    }
  },

  addWallet: async (data: { phone: string; operator: string }) => {
    return api.dashboard.createWallet({ currencyCode: 'XOF', phoneNumber: data.phone });
  },

  deleteWallet: async (id: string) => {
    try {
      await fetch(`${API_URL}/dashboard/wallets/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      });
    } catch {}
    return true;
  },

  setDefaultWallet: async (id: string) => {
    try {
      return await api.dashboard.setDefaultWallet(id);
    } catch {
      return null;
    }
  },

  sendOTP: async (phone: string) => {
    try {
      await api.auth.requestOTP(phone);
      return { success: true, message: `Code envoyé au ${phone}` };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  verifyOTP: async (phone: string, code: string) => {
    try {
      await api.auth.verifyOTP(phone, code);
      return { success: true, message: 'Numéro vérifié avec succès' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  updateUserProfile: async (data: Record<string, any>) => {
    try {
      return await api.auth.updateProfile(data);
    } catch {
      return data;
    }
  },
};

// ==========================================
// TAUX DE CHANGE EN DIRECT
// ==========================================

export async function fetchLiveRates(): Promise<any[]> {
  try {
    const res = await api.rates.all();
    if (res.data) {
      return res.data.map((r: any) => ({
        currency: r.code || r.currency,
        rate: r.rate,
        flag: getFlagEmoji(r.code || r.currency),
        label: r.name || r.currency,
      }));
    }
  } catch {}
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

// ==========================================
// LEGACY EXPORTS (for backward compatibility)
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

export type KYCStatus = 'NONE' | 'PENDING_AI' | 'PENDING_HUMAN' | 'APPROVED' | 'REJECTED' | 'DISPUTED';

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
  iso2: string;
}

import { LIVE_RATES as COUNTRIES_LIVE_RATES } from '@/data/countries';

export const LIVE_RATES: LiveRate[] = COUNTRIES_LIVE_RATES.map((r: any) => ({
  currency: r.currency,
  name: r.name || r.currency,
  rate: r.rate,
  flag: r.flag,
  iso2: r.iso2,
}));
