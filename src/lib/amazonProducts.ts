export interface AmazonProduct {
  asin: string;
  name: string;
  description: string;
  tag: string;
}

export const amazonProducts: Record<string, AmazonProduct> = {
  'B0CHN4LSWQ': {
    asin: 'B0CHN4LSWQ',
    name: 'Turbogrün Extra-Power Rasendünger 10kg',
    description: 'Stickstoffreicher Rasendünger für Frühjahr & Sommer',
    tag: 'rasenpilot21-21',
  },
  'B00UT2LM2O': {
    asin: 'B00UT2LM2O',
    name: 'COMPO Rasendünger gegen Moos',
    description: '3 Monate Langzeitwirkung, bekämpft Moos & Unkraut',
    tag: 'rasenpilot21-21',
  },
  'B00IUPTZVC': {
    asin: 'B00IUPTZVC',
    name: 'Rasensamen Nachsaat schnellkeimend',
    description: 'Für kahle Stellen, ideal für Frühjahr & Herbst',
    tag: 'rasenpilot21-21',
  },
  'B0001E3W7S': {
    asin: 'B0001E3W7S',
    name: 'Gardena Rasenlüfter',
    description: 'Bekämpft Bodenverdichtung und Moos',
    tag: 'rasenpilot21-21',
  },
  'B0749P42HT': {
    asin: 'B0749P42HT',
    name: 'Gardena Bewässerungscomputer',
    description: 'Automatische Bewässerung zur optimalen Zeit',
    tag: 'rasenpilot21-21',
  },
  'B00FDFI4Z2': {
    asin: 'B00FDFI4Z2',
    name: 'COMPO FLORANID Rasendünger',
    description: 'Gegen Pilzbefall und Unkraut',
    tag: 'rasenpilot21-21',
  },
};

export const getAmazonUrl = (asin: string): string => {
  const product = amazonProducts[asin];
  const tag = product?.tag || 'rasenpilot21-21';
  return `https://www.amazon.de/dp/${asin}?tag=${tag}`;
};

export const getAmazonImageUrl = (asin: string): string => {
  return `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL250_&ID=AsinImage&MarketPlace=DE&ServiceVersion=20070822&WS=1&tag=rasenpilot21-21`;
};

export const getSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Frühling — Wachstumsphase, erste Düngung empfohlen, Vertikutieren möglich';
  if (month >= 5 && month <= 7) return 'Sommer — Bewässerung kritisch, Hitzestress möglich, nicht düngen bei über 25°C';
  if (month >= 8 && month <= 10) return 'Herbst — Wintervorbereitung, letzte Düngung mit Kalium, Nachsaat noch möglich';
  return 'Winter — Rasen schonen, nicht betreten bei Frost, keine Düngung';
};
