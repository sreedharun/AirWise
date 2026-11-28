import { describe, it, expect } from 'vitest';
import { generateAdvice, USER_GROUPS } from '../utils/adviceEngine';
import { AQICategoryLevel, UserGroup } from '../api/types';

describe('Advice Engine', () => {
  const AQI_LEVELS: { aqi: number; expectedLevel: AQICategoryLevel }[] = [
    { aqi: 25, expectedLevel: 'good' },
    { aqi: 75, expectedLevel: 'moderate' },
    { aqi: 125, expectedLevel: 'unhealthy-sensitive' },
    { aqi: 175, expectedLevel: 'unhealthy' },
    { aqi: 250, expectedLevel: 'very-unhealthy' },
    { aqi: 420, expectedLevel: 'hazardous' },
  ];

  const GROUPS: UserGroup[] = ['general', 'children', 'elderly', 'respiratory', 'athletes'];

  // Test every combination of Category x UserGroup (6 x 5 = 30 tests)
  AQI_LEVELS.forEach(({ aqi, expectedLevel }) => {
    describe(`AQI ${aqi} (${expectedLevel})`, () => {
      GROUPS.forEach((group) => {
        it(`produces complete deterministic advice for group "${group}"`, () => {
          const report = generateAdvice(aqi, group);

          expect(report.userGroup).toBe(group);
          expect(report.aqiLevel).toBe(expectedLevel);
          expect(report.aqiValue).toBe(aqi);

          expect(report.headline).toBeTruthy();
          expect(report.headline.length).toBeGreaterThan(10);

          expect(report.overview).toBeTruthy();
          expect(report.overview.length).toBeGreaterThan(15);

          // Must have 5 actions: activity, mask, ventilation, purifier, special
          expect(report.actions).toHaveLength(5);
          const categories = report.actions.map((a) => a.category);
          expect(categories).toContain('activity');
          expect(categories).toContain('mask');
          expect(categories).toContain('ventilation');
          expect(categories).toContain('purifier');
          expect(categories).toContain('special');

          report.actions.forEach((act) => {
            expect(act.title).toBeTruthy();
            expect(act.recommendation).toBeTruthy();
            expect(['safe', 'caution', 'warning', 'danger']).toContain(act.severity);
          });

          // Must have at least 1 Do and 1 Don't
          expect(report.dos.length).toBeGreaterThan(0);
          expect(report.donts.length).toBeGreaterThan(0);

          // Disclaimer must be present
          expect(report.disclaimer).toContain('informational');
        });
      });
    });
  });

  describe('Specialized Group Logic', () => {
    it('recommends inhaler preparedness for respiratory group in unhealthy air', () => {
      const report = generateAdvice(160, 'respiratory');
      const text = JSON.stringify(report).toLowerCase();
      expect(text).toMatch(/inhaler|albuterol|bronchodilator/);
    });

    it('recommends outdoor activity restrictions for children in unhealthy air', () => {
      const report = generateAdvice(180, 'children');
      const text = JSON.stringify(report).toLowerCase();
      expect(text).toMatch(/cancel|indoor|recess|sports/);
    });

    it('advises outdoor athletes to move workouts indoors when AQI is high', () => {
      const report = generateAdvice(170, 'athletes');
      const text = JSON.stringify(report).toLowerCase();
      expect(text).toMatch(/indoor|treadmill|cancel/);
    });

    it('lists 5 user group definitions in USER_GROUPS', () => {
      expect(USER_GROUPS).toHaveLength(5);
    });
  });
});
