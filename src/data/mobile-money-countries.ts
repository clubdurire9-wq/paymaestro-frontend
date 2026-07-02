export interface MobileMoneyCountry {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  placeholder: string;
  operators: { value: string; label: string }[];
}

export const MOBILE_MONEY_COUNTRIES: MobileMoneyCountry[] = [
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', dialCode: '+225', placeholder: '+225 07 00 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Moov', label: 'Moov Africa' },
    { value: 'Wave', label: 'Wave' },
  ]},
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '+221', placeholder: '+221 77 000 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Wave', label: 'Wave' },
    { value: 'Free', label: 'Free Money' },
  ]},
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223', placeholder: '+223 70 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226', placeholder: '+226 70 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Wave', label: 'Wave' },
  ]},
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dialCode: '+229', placeholder: '+229 97 00 00 00', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Moov', label: 'Moov Africa' },
  ]},
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228', placeholder: '+228 90 00 00 00', operators: [
    { value: 'Togocom', label: 'Togocom Money' },
    { value: 'Moov', label: 'Moov Africa' },
  ]},
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233', placeholder: '+233 50 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Vodafone', label: 'Vodafone Cash' },
    { value: 'AirtelTigo', label: 'AirtelTigo Money' },
  ]},
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', placeholder: '+234 803 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Glo', label: 'Glo Mobile Money' },
    { value: '9mobile', label: '9mobile Money' },
  ]},
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254', placeholder: '+254 712 000 000', operators: [
    { value: 'Safaricom', label: 'M-Pesa' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Telkom', label: 'Telkom Cash' },
  ]},
  { code: 'TZ', name: 'Tanzanie', flag: '🇹🇿', dialCode: '+255', placeholder: '+255 762 000 000', operators: [
    { value: 'Vodacom', label: 'M-Pesa' },
    { value: 'Tigo', label: 'Tigo Pesa' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Halotel', label: 'Halotel Money' },
  ]},
  { code: 'UG', name: 'Ouganda', flag: '🇺🇬', dialCode: '+256', placeholder: '+256 772 000 000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', dialCode: '+250', placeholder: '+250 788 000 000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
  ]},
  { code: 'CD', name: 'République Démocratique du Congo', flag: '🇨🇩', dialCode: '+243', placeholder: '+243 81 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Vodacom', label: 'M-Pesa' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'CG', name: 'Congo-Brazzaville', flag: '🇨🇬', dialCode: '+242', placeholder: '+242 05 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
  ]},
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '+241', placeholder: '+241 06 00 00 00', operators: [
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Moov', label: 'Moov Africa' },
  ]},
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', dialCode: '+237', placeholder: '+237 6 00 00 00 00', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Nexttel', label: 'Nexttel Money' },
  ]},
  { code: 'AO', name: 'Angola', flag: '🇦🇴', dialCode: '+244', placeholder: '+244 923 000 000', operators: [
    { value: 'Unitel', label: 'Unitel Money' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', dialCode: '+258', placeholder: '+258 84 000 0000', operators: [
    { value: 'Vodacom', label: 'M-Pesa' },
    { value: 'Movitel', label: 'Movitel Money' },
  ]},
  { code: 'ZM', name: 'Zambie', flag: '🇿🇲', dialCode: '+260', placeholder: '+260 97 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Zamtel', label: 'Zamtel Money' },
  ]},
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263', placeholder: '+263 77 000 0000', operators: [
    { value: 'Econet', label: 'EcoCash' },
    { value: 'NetOne', label: 'OneMoney' },
  ]},
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', dialCode: '+27', placeholder: '+27 82 000 0000', operators: [
    { value: 'Vodacom', label: 'Vodacom M-Pesa' },
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'CellC', label: 'CellC Money' },
  ]},
  { code: 'ET', name: 'Éthiopie', flag: '🇪🇹', dialCode: '+251', placeholder: '+251 91 000 0000', operators: [
    { value: 'Ethio', label: 'Ethio Telecom' },
    { value: 'Safaricom', label: 'M-Pesa' },
  ]},
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', dialCode: '+212', placeholder: '+212 6 00 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MarocTelecom', label: 'Maroc Telecom Mobile Money' },
    { value: 'Inwi', label: 'Inwi Money' },
  ]},
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿', dialCode: '+213', placeholder: '+213 5 00 00 00 00', operators: [
    { value: 'Mobilis', label: 'Mobilis Money' },
    { value: 'Ooredoo', label: 'Ooredoo Money' },
    { value: 'Djezzy', label: 'Djezzy Money' },
  ]},
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳', dialCode: '+216', placeholder: '+216 20 000 000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Ooredoo', label: 'Ooredoo Money' },
    { value: 'TunisieTelecom', label: 'Tunisie Telecom Money' },
  ]},
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', dialCode: '+261', placeholder: '+261 32 00 000 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Telma', label: 'Telma Money' },
  ]},
  { code: 'MU', name: 'Maurice', flag: '🇲🇺', dialCode: '+230', placeholder: '+230 5 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', dialCode: '+231', placeholder: '+231 77 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232', placeholder: '+232 76 000 000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', dialCode: '+265', placeholder: '+265 99 000 0000', operators: [
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'TNM', label: 'TNM Mpamba' },
  ]},
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', dialCode: '+267', placeholder: '+267 71 000 000', operators: [
    { value: 'Mascom', label: 'Mascom Money' },
    { value: 'Orange', label: 'Orange Money' },
  ]},
  { code: 'NA', name: 'Namibie', flag: '🇳🇦', dialCode: '+264', placeholder: '+264 81 000 0000', operators: [
    { value: 'MTC', label: 'MTC Mobile Money' },
    { value: 'TNMobile', label: 'TN Mobile Money' },
  ]},
  { code: 'SD', name: 'Soudan', flag: '🇸🇩', dialCode: '+249', placeholder: '+249 91 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Zain', label: 'Zain Money' },
    { value: 'Sudani', label: 'Sudani Money' },
  ]},
  { code: 'SO', name: 'Somalie', flag: '🇸🇴', dialCode: '+252', placeholder: '+252 61 000 0000', operators: [
    { value: 'Hormuud', label: 'Hormuud Money' },
    { value: 'Telesom', label: 'Telesom ZAAD' },
    { value: 'Somtel', label: 'Somtel Money' },
  ]},
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', dialCode: '+257', placeholder: '+257 79 000 000', operators: [
    { value: 'Econet', label: 'Econet Money' },
    { value: 'Lumitel', label: 'Lumitel Money' },
  ]},
  { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '+227', placeholder: '+227 97 00 00 000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Moov', label: 'Moov Africa' },
  ]},
  { code: 'TD', name: 'Tchad', flag: '🇹🇩', dialCode: '+235', placeholder: '+235 66 00 00 00', operators: [
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Tigo', label: 'Tigo Money' },
  ]},
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', dialCode: '+224', placeholder: '+224 62 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', dialCode: '+222', placeholder: '+222 36 00 00 00', operators: [
    { value: 'Mauritel', label: 'Mauritel Money' },
    { value: 'Mattel', label: 'Mattel Money' },
  ]},
];

export function getCountryByCode(code: string): MobileMoneyCountry | undefined {
  return MOBILE_MONEY_COUNTRIES.find(c => c.code === code);
}

export function getOperatorsByCountryCode(code: string): { value: string; label: string }[] {
  const country = getCountryByCode(code);
  return country?.operators || [];
}
