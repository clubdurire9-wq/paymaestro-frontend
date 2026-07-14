export interface MobileMoneyCountry {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  dialCode: string;
  placeholder: string;
  operators: { value: string; label: string }[];
}

export const MOBILE_MONEY_COUNTRIES: MobileMoneyCountry[] = [
  { code: 'CI', name: "Côte d'Ivoire", nameEn: "Ivory Coast", flag: '🇨🇮', dialCode: '+225', placeholder: '+225 07 00 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Moov', label: 'Moov Africa' },
    { value: 'Wave', label: 'Wave' },
  ]},
  { code: 'SN', name: 'Sénégal', nameEn: 'Senegal', flag: '🇸🇳', dialCode: '+221', placeholder: '+221 77 000 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Wave', label: 'Wave' },
    { value: 'Free', label: 'Free Money' },
  ]},
  { code: 'ML', name: 'Mali', nameEn: 'Mali', flag: '🇲🇱', dialCode: '+223', placeholder: '+223 70 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'BF', name: 'Burkina Faso', nameEn: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226', placeholder: '+226 70 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Wave', label: 'Wave' },
  ]},
  { code: 'BJ', name: 'Bénin', nameEn: 'Benin', flag: '🇧🇯', dialCode: '+229', placeholder: '+229 97 00 00 00', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Moov', label: 'Moov Africa' },
  ]},
  { code: 'TG', name: 'Togo', nameEn: 'Togo', flag: '🇹🇬', dialCode: '+228', placeholder: '+228 90 00 00 00', operators: [
    { value: 'Togocom', label: 'Togocom Money' },
    { value: 'Moov', label: 'Moov Africa' },
  ]},
  { code: 'GH', name: 'Ghana', nameEn: 'Ghana', flag: '🇬🇭', dialCode: '+233', placeholder: '+233 50 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Vodafone', label: 'Vodafone Cash' },
    { value: 'AirtelTigo', label: 'AirtelTigo Money' },
  ]},
  { code: 'NG', name: 'Nigeria', nameEn: 'Nigeria', flag: '🇳🇬', dialCode: '+234', placeholder: '+234 803 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Glo', label: 'Glo Mobile Money' },
    { value: '9mobile', label: '9mobile Money' },
  ]},
  { code: 'KE', name: 'Kenya', nameEn: 'Kenya', flag: '🇰🇪', dialCode: '+254', placeholder: '+254 712 000 000', operators: [
    { value: 'Safaricom', label: 'M-Pesa' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Telkom', label: 'Telkom Cash' },
  ]},
  { code: 'TZ', name: 'Tanzanie', nameEn: 'Tanzania', flag: '🇹🇿', dialCode: '+255', placeholder: '+255 762 000 000', operators: [
    { value: 'Vodacom', label: 'M-Pesa' },
    { value: 'Tigo', label: 'Tigo Pesa' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Halotel', label: 'Halotel Money' },
  ]},
  { code: 'UG', name: 'Ouganda', nameEn: 'Uganda', flag: '🇺🇬', dialCode: '+256', placeholder: '+256 772 000 000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'RW', name: 'Rwanda', nameEn: 'Rwanda', flag: '🇷🇼', dialCode: '+250', placeholder: '+250 788 000 000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
  ]},
  { code: 'CD', name: 'République Démocratique du Congo', nameEn: 'Democratic Republic of the Congo', flag: '🇨🇩', dialCode: '+243', placeholder: '+243 81 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Vodacom', label: 'M-Pesa' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'CG', name: 'Congo-Brazzaville', nameEn: 'Congo-Brazzaville', flag: '🇨🇬', dialCode: '+242', placeholder: '+242 05 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
  ]},
  { code: 'GA', name: 'Gabon', nameEn: 'Gabon', flag: '🇬🇦', dialCode: '+241', placeholder: '+241 06 00 00 00', operators: [
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Moov', label: 'Moov Africa' },
  ]},
  { code: 'CM', name: 'Cameroun', nameEn: 'Cameroon', flag: '🇨🇲', dialCode: '+237', placeholder: '+237 6 00 00 00 00', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Nexttel', label: 'Nexttel Money' },
  ]},
  { code: 'AO', name: 'Angola', nameEn: 'Angola', flag: '🇦🇴', dialCode: '+244', placeholder: '+244 923 000 000', operators: [
    { value: 'Unitel', label: 'Unitel Money' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'MZ', name: 'Mozambique', nameEn: 'Mozambique', flag: '🇲🇿', dialCode: '+258', placeholder: '+258 84 000 0000', operators: [
    { value: 'Vodacom', label: 'M-Pesa' },
    { value: 'Movitel', label: 'Movitel Money' },
  ]},
  { code: 'ZM', name: 'Zambie', nameEn: 'Zambia', flag: '🇿🇲', dialCode: '+260', placeholder: '+260 97 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Zamtel', label: 'Zamtel Money' },
  ]},
  { code: 'ZW', name: 'Zimbabwe', nameEn: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263', placeholder: '+263 77 000 0000', operators: [
    { value: 'Econet', label: 'EcoCash' },
    { value: 'NetOne', label: 'OneMoney' },
  ]},
  { code: 'ZA', name: 'Afrique du Sud', nameEn: 'South Africa', flag: '🇿🇦', dialCode: '+27', placeholder: '+27 82 000 0000', operators: [
    { value: 'Vodacom', label: 'Vodacom M-Pesa' },
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'CellC', label: 'CellC Money' },
  ]},
  { code: 'ET', name: 'Éthiopie', nameEn: 'Ethiopia', flag: '🇪🇹', dialCode: '+251', placeholder: '+251 91 000 0000', operators: [
    { value: 'Ethio', label: 'Ethio Telecom' },
    { value: 'Safaricom', label: 'M-Pesa' },
  ]},
  { code: 'MA', name: 'Maroc', nameEn: 'Morocco', flag: '🇲🇦', dialCode: '+212', placeholder: '+212 6 00 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MarocTelecom', label: 'Maroc Telecom Mobile Money' },
    { value: 'Inwi', label: 'Inwi Money' },
  ]},
  { code: 'DZ', name: 'Algérie', nameEn: 'Algeria', flag: '🇩🇿', dialCode: '+213', placeholder: '+213 5 00 00 00 00', operators: [
    { value: 'Mobilis', label: 'Mobilis Money' },
    { value: 'Ooredoo', label: 'Ooredoo Money' },
    { value: 'Djezzy', label: 'Djezzy Money' },
  ]},
  { code: 'TN', name: 'Tunisie', nameEn: 'Tunisia', flag: '🇹🇳', dialCode: '+216', placeholder: '+216 20 000 000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Ooredoo', label: 'Ooredoo Money' },
    { value: 'TunisieTelecom', label: 'Tunisie Telecom Money' },
  ]},
  { code: 'MG', name: 'Madagascar', nameEn: 'Madagascar', flag: '🇲🇬', dialCode: '+261', placeholder: '+261 32 00 000 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Telma', label: 'Telma Money' },
  ]},
  { code: 'MU', name: 'Maurice', nameEn: 'Mauritius', flag: '🇲🇺', dialCode: '+230', placeholder: '+230 5 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'LR', name: 'Liberia', nameEn: 'Liberia', flag: '🇱🇷', dialCode: '+231', placeholder: '+231 77 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'SL', name: 'Sierra Leone', nameEn: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232', placeholder: '+232 76 000 000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'MW', name: 'Malawi', nameEn: 'Malawi', flag: '🇲🇼', dialCode: '+265', placeholder: '+265 99 000 0000', operators: [
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'TNM', label: 'TNM Mpamba' },
  ]},
  { code: 'BW', name: 'Botswana', nameEn: 'Botswana', flag: '🇧🇼', dialCode: '+267', placeholder: '+267 71 000 000', operators: [
    { value: 'Mascom', label: 'Mascom Money' },
    { value: 'Orange', label: 'Orange Money' },
  ]},
  { code: 'NA', name: 'Namibie', nameEn: 'Namibia', flag: '🇳🇦', dialCode: '+264', placeholder: '+264 81 000 0000', operators: [
    { value: 'MTC', label: 'MTC Mobile Money' },
    { value: 'TNMobile', label: 'TN Mobile Money' },
  ]},
  { code: 'SD', name: 'Soudan', nameEn: 'Sudan', flag: '🇸🇩', dialCode: '+249', placeholder: '+249 91 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Zain', label: 'Zain Money' },
    { value: 'Sudani', label: 'Sudani Money' },
  ]},
  { code: 'SO', name: 'Somalie', nameEn: 'Somalia', flag: '🇸🇴', dialCode: '+252', placeholder: '+252 61 000 0000', operators: [
    { value: 'Hormuud', label: 'Hormuud Money' },
    { value: 'Telesom', label: 'Telesom ZAAD' },
    { value: 'Somtel', label: 'Somtel Money' },
  ]},
  { code: 'BI', name: 'Burundi', nameEn: 'Burundi', flag: '🇧🇮', dialCode: '+257', placeholder: '+257 79 000 000', operators: [
    { value: 'Econet', label: 'Econet Money' },
    { value: 'Lumitel', label: 'Lumitel Money' },
  ]},
  { code: 'NE', name: 'Niger', nameEn: 'Niger', flag: '🇳🇪', dialCode: '+227', placeholder: '+227 97 00 00 000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Moov', label: 'Moov Africa' },
  ]},
  { code: 'TD', name: 'Tchad', nameEn: 'Chad', flag: '🇹🇩', dialCode: '+235', placeholder: '+235 66 00 00 00', operators: [
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Tigo', label: 'Tigo Money' },
  ]},
  { code: 'GN', name: 'Guinée', nameEn: 'Guinea', flag: '🇬🇳', dialCode: '+224', placeholder: '+224 62 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'MR', name: 'Mauritanie', nameEn: 'Mauritania', flag: '🇲🇷', dialCode: '+222', placeholder: '+222 36 00 00 00', operators: [
    { value: 'Mauritel', label: 'Mauritel Money' },
    { value: 'Mattel', label: 'Mattel Money' },
  ]},
  { code: 'EG', name: 'Égypte', nameEn: 'Egypt', flag: '🇪🇬', dialCode: '+20', placeholder: '+20 100 000 0000', operators: [
    { value: 'Vodafone', label: 'Vodafone Cash' },
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Etisalat', label: 'Etisalat Money' },
  ]},
  { code: 'LY', name: 'Libye', nameEn: 'Libya', flag: '🇱🇾', dialCode: '+218', placeholder: '+218 91 000 0000', operators: [
    { value: 'Libyana', label: 'Libyana Money' },
    { value: 'Almadar', label: 'Almadar Money' },
  ]},
  { code: 'SS', name: 'Soudan du Sud', nameEn: 'South Sudan', flag: '🇸🇸', dialCode: '+211', placeholder: '+211 92 000 0000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'Zain', label: 'Zain Money' },
  ]},
  { code: 'DJ', name: 'Djibouti', nameEn: 'Djibouti', flag: '🇩🇯', dialCode: '+253', placeholder: '+253 77 00 00 00', operators: [
    { value: 'DjiboutiTelecom', label: 'Djibouti Telecom Money' },
    { value: 'Evatis', label: 'Evatis Money' },
  ]},
  { code: 'ER', name: 'Érythrée', nameEn: 'Eritrea', flag: '🇪🇷', dialCode: '+291', placeholder: '+291 7 000 000', operators: [
    { value: 'Eritel', label: 'Eritel Money' },
  ]},
  { code: 'CF', name: 'République Centrafricaine', nameEn: 'Central African Republic', flag: '🇨🇫', dialCode: '+236', placeholder: '+236 75 00 00 00', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Telecel', label: 'Telecel Money' },
  ]},
  { code: 'GQ', name: 'Guinée Équatoriale', nameEn: 'Equatorial Guinea', flag: '🇬🇶', dialCode: '+240', placeholder: '+240 222 000 000', operators: [
    { value: 'Muni', label: 'Muni Money' },
    { value: 'Getesa', label: 'Getesa Money' },
  ]},
  { code: 'CV', name: 'Cap-Vert', nameEn: 'Cape Verde', flag: '🇨🇻', dialCode: '+238', placeholder: '+238 900 00 00', operators: [
    { value: 'CVMovel', label: 'CVMóvel Money' },
    { value: 'UnitelT', label: 'Unitel T+ Money' },
  ]},
  { code: 'ST', name: 'Sao Tomé-et-Principe', nameEn: 'São Tomé and Príncipe', flag: '🇸🇹', dialCode: '+239', placeholder: '+239 900 0000', operators: [
    { value: 'CST', label: 'CST Money' },
    { value: 'Unitel', label: 'Unitel Money' },
  ]},
  { code: 'GM', name: 'Gambie', nameEn: 'Gambia', flag: '🇬🇲', dialCode: '+220', placeholder: '+220 700 0000', operators: [
    { value: 'QCell', label: 'QCell Money' },
    { value: 'Africell', label: 'Africell Money' },
  ]},
  { code: 'GW', name: 'Guinée-Bissau', nameEn: 'Guinea-Bissau', flag: '🇬🇼', dialCode: '+245', placeholder: '+245 96 000 0000', operators: [
    { value: 'Orange', label: 'Orange Money' },
    { value: 'MTN', label: 'MTN Mobile Money' },
  ]},
  { code: 'KM', name: 'Comores', nameEn: 'Comoros', flag: '🇰🇲', dialCode: '+269', placeholder: '+269 34 00 000', operators: [
    { value: 'ComoresTelecom', label: 'Comores Telecom Money' },
  ]},
  { code: 'SC', name: 'Seychelles', nameEn: 'Seychelles', flag: '🇸🇨', dialCode: '+248', placeholder: '+248 2 000 000', operators: [
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'CableWireless', label: 'Cable & Wireless Money' },
  ]},
  { code: 'LS', name: 'Lesotho', nameEn: 'Lesotho', flag: '🇱🇸', dialCode: '+266', placeholder: '+266 56 000 000', operators: [
    { value: 'Vodacom', label: 'Vodacom Money' },
    { value: 'Econet', label: 'Econet Money' },
  ]},
  { code: 'SZ', name: 'Eswatini', nameEn: 'Eswatini', flag: '🇸🇿', dialCode: '+268', placeholder: '+268 76 000 000', operators: [
    { value: 'MTN', label: 'MTN Mobile Money' },
    { value: 'EswatiniMobile', label: 'Eswatini Mobile Money' },
  ]},
];

export function getCountryByCode(code: string): MobileMoneyCountry | undefined {
  return MOBILE_MONEY_COUNTRIES.find(c => c.code === code);
}

export function getOperatorsByCountryCode(code: string): { value: string; label: string }[] {
  const country = getCountryByCode(code);
  return country?.operators || [];
}
