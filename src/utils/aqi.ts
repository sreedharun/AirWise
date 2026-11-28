import { AQICategoryLevel, PollutantInfo } from '../api/types';

export interface AQICategoryConfig {
  level: AQICategoryLevel;
  name: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  pattern: string;
  summary: string;
}

export const AQI_CATEGORIES: Record<AQICategoryLevel, AQICategoryConfig> = {
  good: {
    level: 'good',
    name: 'Good',
    min: 0,
    max: 50,
    color: '#15803d', // WCAG AAA accessible green
    bgColor: '#f0fdf4',
    textColor: '#14532d',
    borderColor: '#86efac',
    badgeBg: '#dcfce7',
    badgeText: '#14532d',
    icon: '🌿',
    pattern: 'pattern-good',
    summary: 'Air quality is satisfactory and poses little or no health risk.',
  },
  moderate: {
    level: 'moderate',
    name: 'Moderate',
    min: 51,
    max: 100,
    color: '#b45309', // High-contrast amber (not hard-to-read yellow)
    bgColor: '#fffbeb',
    textColor: '#78350f',
    borderColor: '#fde68a',
    badgeBg: '#fef3c7',
    badgeText: '#78350f',
    icon: '⛅',
    pattern: 'pattern-moderate',
    summary: 'Air quality is acceptable; unusually sensitive individuals may feel mild irritation.',
  },
  'unhealthy-sensitive': {
    level: 'unhealthy-sensitive',
    name: 'Unhealthy for Sensitive Groups',
    min: 101,
    max: 150,
    color: '#c2410c', // Deep orange with >= 4.5:1 contrast
    bgColor: '#fff7ed',
    textColor: '#7c2d12',
    borderColor: '#fed7aa',
    badgeBg: '#ffedd5',
    badgeText: '#7c2d12',
    icon: '⚠️',
    pattern: 'pattern-sensitive',
    summary:
      'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
  },
  unhealthy: {
    level: 'unhealthy',
    name: 'Unhealthy',
    min: 151,
    max: 200,
    color: '#b91c1c', // Crimson red with >= 4.5:1 contrast
    bgColor: '#fef2f2',
    textColor: '#7f1d1d',
    borderColor: '#fecaca',
    badgeBg: '#fee2e2',
    badgeText: '#7f1d1d',
    icon: '😷',
    pattern: 'pattern-unhealthy',
    summary:
      'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
  },
  'very-unhealthy': {
    level: 'very-unhealthy',
    name: 'Very Unhealthy',
    min: 201,
    max: 300,
    color: '#7e22ce', // Deep purple
    bgColor: '#faf5ff',
    textColor: '#581c87',
    borderColor: '#e9d5ff',
    badgeBg: '#f3e8ff',
    badgeText: '#581c87',
    icon: '🛑',
    pattern: 'pattern-very-unhealthy',
    summary: 'Health alert: The risk of health effects is increased for everyone.',
  },
  hazardous: {
    level: 'hazardous',
    name: 'Hazardous',
    min: 301,
    max: 500,
    color: '#881337', // Deep rose/maroon
    bgColor: '#fff1f2',
    textColor: '#4c0519',
    borderColor: '#fecdd3',
    badgeBg: '#ffe4e6',
    badgeText: '#4c0519',
    icon: '☣️',
    pattern: 'pattern-hazardous',
    summary:
      'Health warning of emergency conditions: The entire population is likely to be affected.',
  },
};

/**
 * Determines the US EPA AQI Category Level for a given numerical AQI value.
 *
 * @param aqi Numerical US AQI score (0 to 500+).
 * @returns Standard category level identifier ('good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous').
 * @example getAQICategory(42) => 'good'
 */
export function getAQICategory(aqi: number): AQICategoryLevel {
  const rounded = Math.round(Math.max(0, aqi));
  if (rounded <= 50) return 'good';
  if (rounded <= 100) return 'moderate';
  if (rounded <= 150) return 'unhealthy-sensitive';
  if (rounded <= 200) return 'unhealthy';
  if (rounded <= 300) return 'very-unhealthy';
  return 'hazardous';
}

/**
 * Retrieves the full accessibility, styling, and textual configuration for an AQI value.
 *
 * @param aqi Numerical US AQI score.
 * @returns Complete AQICategoryConfig with colors, icons, tactile patterns, and descriptions.
 */
export function getAQIConfig(aqi: number): AQICategoryConfig {
  const category = getAQICategory(aqi);
  return AQI_CATEGORIES[category];
}

/**
 * Evaluates individual pollutant status based on international WHO and US EPA ambient guidelines.
 *
 * @param key Pollutant identifier string.
 * @param value Measured concentration.
 * @returns Status string ('good' | 'moderate' | 'unhealthy' | 'hazardous').
 */
export function evaluatePollutantStatus(
  key: string,
  value: number
): 'good' | 'moderate' | 'unhealthy' | 'hazardous' {
  switch (key) {
    case 'pm2_5':
      if (value <= 12) return 'good';
      if (value <= 35.4) return 'moderate';
      if (value <= 55.4) return 'unhealthy';
      return 'hazardous';
    case 'pm10':
      if (value <= 54) return 'good';
      if (value <= 154) return 'moderate';
      if (value <= 254) return 'unhealthy';
      return 'hazardous';
    case 'nitrogen_dioxide':
      if (value <= 53) return 'good';
      if (value <= 100) return 'moderate';
      if (value <= 360) return 'unhealthy';
      return 'hazardous';
    case 'ozone':
      if (value <= 54) return 'good';
      if (value <= 70) return 'moderate';
      if (value <= 85) return 'unhealthy';
      return 'hazardous';
    case 'carbon_monoxide':
      if (value <= 4400) return 'good';
      if (value <= 9400) return 'moderate';
      if (value <= 12400) return 'unhealthy';
      return 'hazardous';
    case 'sulphur_dioxide':
      if (value <= 35) return 'good';
      if (value <= 75) return 'moderate';
      if (value <= 185) return 'unhealthy';
      return 'hazardous';
    default:
      return 'good';
  }
}

/**
 * Formats pollutant information with plain language explanations.
 */
export function createPollutantBreakdown(raw: {
  pm2_5?: number;
  pm10?: number;
  nitrogen_dioxide?: number;
  ozone?: number;
  carbon_monoxide?: number;
  sulphur_dioxide?: number;
}): {
  pm2_5: PollutantInfo;
  pm10: PollutantInfo;
  nitrogen_dioxide: PollutantInfo;
  ozone: PollutantInfo;
  carbon_monoxide: PollutantInfo;
  sulphur_dioxide: PollutantInfo;
} {
  const pm2_5Val = Number((raw.pm2_5 ?? 0).toFixed(1));
  const pm10Val = Number((raw.pm10 ?? 0).toFixed(1));
  const no2Val = Number((raw.nitrogen_dioxide ?? 0).toFixed(1));
  const o3Val = Number((raw.ozone ?? 0).toFixed(1));
  const coVal = Number((raw.carbon_monoxide ?? 0).toFixed(0));
  const so2Val = Number((raw.sulphur_dioxide ?? 0).toFixed(1));

  return {
    pm2_5: {
      key: 'pm2_5',
      name: 'Fine Particles',
      formula: 'PM₂.₅',
      value: pm2_5Val,
      unit: 'µg/m³',
      standard: 'Safe threshold ≤ 12 µg/m³',
      description:
        'Microscopic particles under 2.5 micrometers from smoke, combustion, and exhaust.',
      healthImpact: 'Small enough to pass directly into lung tissue and the bloodstream.',
      status: evaluatePollutantStatus('pm2_5', pm2_5Val),
    },
    pm10: {
      key: 'pm10',
      name: 'Coarse Particles',
      formula: 'PM₁₀',
      value: pm10Val,
      unit: 'µg/m³',
      standard: 'Safe threshold ≤ 54 µg/m³',
      description: 'Inhalable dust, pollen, road grit, and mold spores under 10 micrometers.',
      healthImpact: 'Irritates the upper airways, eyes, and nasal passages.',
      status: evaluatePollutantStatus('pm10', pm10Val),
    },
    nitrogen_dioxide: {
      key: 'nitrogen_dioxide',
      name: 'Nitrogen Dioxide',
      formula: 'NO₂',
      value: no2Val,
      unit: 'µg/m³',
      standard: 'Safe threshold ≤ 53 µg/m³',
      description:
        'Pungent reddish-brown gas emitted predominantly by vehicles and power stations.',
      healthImpact: 'Inflames respiratory lining and increases susceptibility to lung infections.',
      status: evaluatePollutantStatus('nitrogen_dioxide', no2Val),
    },
    ozone: {
      key: 'ozone',
      name: 'Ground Ozone',
      formula: 'O₃',
      value: o3Val,
      unit: 'µg/m³',
      standard: 'Safe threshold ≤ 54 µg/m³',
      description:
        'Formed when vehicular emissions react under strong sunlight on warm afternoons.',
      healthImpact: 'Triggers chest tightness, throat irritation, and reduces lung capacity.',
      status: evaluatePollutantStatus('ozone', o3Val),
    },
    carbon_monoxide: {
      key: 'carbon_monoxide',
      name: 'Carbon Monoxide',
      formula: 'CO',
      value: coVal,
      unit: 'µg/m³',
      standard: 'Safe threshold ≤ 4,400 µg/m³',
      description: 'Colorless, odorless gas generated by incomplete fuel and gasoline combustion.',
      healthImpact: 'Reduces oxygen transport to heart, brain, and critical tissues.',
      status: evaluatePollutantStatus('carbon_monoxide', coVal),
    },
    sulphur_dioxide: {
      key: 'sulphur_dioxide',
      name: 'Sulfur Dioxide',
      formula: 'SO₂',
      value: so2Val,
      unit: 'µg/m³',
      standard: 'Safe threshold ≤ 35 µg/m³',
      description: 'Corrosive gas produced from burning sulfur-rich coal and industrial smelting.',
      healthImpact: 'Causes rapid airway constriction, especially in individuals with asthma.',
      status: evaluatePollutantStatus('sulphur_dioxide', so2Val),
    },
  };
}
