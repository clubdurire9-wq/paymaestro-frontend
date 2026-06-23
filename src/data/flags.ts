// src/data/flags.ts
// URLs des drapeaux via flagcdn.com (gratuit, fiable)

export function getFlagUrl(countryCode: string): string {
  const mapping: Record<string, string> = {
    '+225': 'ci', '+221': 'sn', '+237': 'cm', '+233': 'gh',
    '+254': 'ke', '+234': 'ng', '+256': 'ug', '+250': 'rw',
    '+255': 'tz', '+243': 'cd', '+213': 'dz', '+20': 'eg',
    '+218': 'ly', '+212': 'ma', '+249': 'sd', '+216': 'tn',
    '+229': 'bj', '+226': 'bf', '+238': 'cv', '+220': 'gm',
    '+224': 'gn', '+231': 'lr', '+223': 'ml', '+222': 'mr',
    '+227': 'ne', '+232': 'sl', '+228': 'tg', '+244': 'ao',
    '+236': 'cf', '+235': 'td', '+242': 'cg', '+241': 'ga',
    '+240': 'gq', '+239': 'st', '+257': 'bi', '+269': 'km',
    '+253': 'dj', '+291': 'er', '+251': 'et', '+261': 'mg',
    '+265': 'mw', '+230': 'mu', '+258': 'mz', '+248': 'sc',
    '+252': 'so', '+211': 'ss', '+260': 'zm', '+263': 'zw',
    '+267': 'bw', '+268': 'sz', '+266': 'ls', '+264': 'na',
    '+27': 'za',
  };
  const code = mapping[countryCode] || 'xx';
  return `https://flagcdn.com/w40/${code}.png`;
}