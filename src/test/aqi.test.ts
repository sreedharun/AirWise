import { describe, it, expect } from 'vitest';
import {
  getAQICategory,
  getAQIConfig,
  evaluatePollutantStatus,
  createPollutantBreakdown,
  AQI_CATEGORIES,
} from '../utils/aqi';

describe('AQI Utilities', () => {
  describe('getAQICategory breakpoint mapping', () => {
    it('correctly maps Good (0-50)', () => {
      expect(getAQICategory(0)).toBe('good');
      expect(getAQICategory(25)).toBe('good');
      expect(getAQICategory(50)).toBe('good');
      expect(getAQICategory(-5)).toBe('good'); // negative clamping
    });

    it('correctly maps Moderate (51-100)', () => {
      expect(getAQICategory(51)).toBe('moderate');
      expect(getAQICategory(75)).toBe('moderate');
      expect(getAQICategory(100)).toBe('moderate');
    });

    it('correctly maps Unhealthy for Sensitive Groups (101-150)', () => {
      expect(getAQICategory(101)).toBe('unhealthy-sensitive');
      expect(getAQICategory(125)).toBe('unhealthy-sensitive');
      expect(getAQICategory(150)).toBe('unhealthy-sensitive');
    });

    it('correctly maps Unhealthy (151-200)', () => {
      expect(getAQICategory(151)).toBe('unhealthy');
      expect(getAQICategory(175)).toBe('unhealthy');
      expect(getAQICategory(200)).toBe('unhealthy');
    });

    it('correctly maps Very Unhealthy (201-300)', () => {
      expect(getAQICategory(201)).toBe('very-unhealthy');
      expect(getAQICategory(250)).toBe('very-unhealthy');
      expect(getAQICategory(300)).toBe('very-unhealthy');
    });

    it('correctly maps Hazardous (301+)', () => {
      expect(getAQICategory(301)).toBe('hazardous');
      expect(getAQICategory(400)).toBe('hazardous');
      expect(getAQICategory(500)).toBe('hazardous');
      expect(getAQICategory(650)).toBe('hazardous');
    });
  });

  describe('getAQIConfig and accessibility metadata', () => {
    it('returns config with distinct icons, colorblind patterns, and WCAG contrast fields', () => {
      const config = getAQIConfig(45);
      expect(config.level).toBe('good');
      expect(config.name).toBe('Good');
      expect(config.icon).toBeTruthy();
      expect(config.pattern).toBe('pattern-good');
      expect(config.color).toBe('#15803d');
      expect(config.textColor).toBeTruthy();
      expect(config.summary).toContain('satisfactory');
    });

    it('contains valid patterns and icons for all 6 categories', () => {
      const levels = [
        'good',
        'moderate',
        'unhealthy-sensitive',
        'unhealthy',
        'very-unhealthy',
        'hazardous',
      ] as const;
      levels.forEach((lvl) => {
        const c = AQI_CATEGORIES[lvl];
        expect(c.icon).toBeTruthy();
        expect(c.pattern).toContain('pattern-');
        expect(c.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('evaluatePollutantStatus', () => {
    it('correctly scores PM2.5 thresholds', () => {
      expect(evaluatePollutantStatus('pm2_5', 8)).toBe('good');
      expect(evaluatePollutantStatus('pm2_5', 20)).toBe('moderate');
      expect(evaluatePollutantStatus('pm2_5', 40)).toBe('unhealthy');
      expect(evaluatePollutantStatus('pm2_5', 90)).toBe('hazardous');
    });

    it('correctly scores Ozone thresholds', () => {
      expect(evaluatePollutantStatus('ozone', 30)).toBe('good');
      expect(evaluatePollutantStatus('ozone', 65)).toBe('moderate');
      expect(evaluatePollutantStatus('ozone', 75)).toBe('unhealthy');
      expect(evaluatePollutantStatus('ozone', 110)).toBe('hazardous');
    });
  });

  describe('createPollutantBreakdown', () => {
    it('creates 6 validated pollutant objects with health impacts and formulas', () => {
      const breakdown = createPollutantBreakdown({
        pm2_5: 14.56,
        pm10: 25.4,
        nitrogen_dioxide: 18.2,
        ozone: 45.1,
        carbon_monoxide: 320,
        sulphur_dioxide: 4.8,
      });

      expect(breakdown.pm2_5.value).toBe(14.6);
      expect(breakdown.pm2_5.formula).toBe('PM₂.₅');
      expect(breakdown.pm2_5.healthImpact).toBeTruthy();

      expect(breakdown.pm10.formula).toBe('PM₁₀');
      expect(breakdown.nitrogen_dioxide.formula).toBe('NO₂');
      expect(breakdown.ozone.formula).toBe('O₃');
      expect(breakdown.carbon_monoxide.formula).toBe('CO');
      expect(breakdown.sulphur_dioxide.formula).toBe('SO₂');
    });
  });
});
