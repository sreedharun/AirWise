import { describe, it, expect } from 'vitest';
import {
  sanitizeSearchQuery,
  isValidLatitude,
  isValidLongitude,
  sanitizeNumber,
  isValidLocation,
} from '../utils/sanitize';

describe('Sanitization & Security Validation', () => {
  describe('sanitizeSearchQuery', () => {
    it('strips script tags and malicious HTML characters', () => {
      const malicious = '<script>alert("xss")</script>London';
      expect(sanitizeSearchQuery(malicious)).toBe('London');
    });

    it('strips SQL or shell injection characters', () => {
      const injected = 'Paris; DROP TABLE cities;--';
      expect(sanitizeSearchQuery(injected)).toBe('Paris DROP TABLE cities--');
    });

    it('preserves valid city names with accents and international characters', () => {
      expect(sanitizeSearchQuery('São Paulo')).toBe('São Paulo');
      expect(sanitizeSearchQuery('Zürich')).toBe('Zürich');
      expect(sanitizeSearchQuery('München')).toBe('München');
      expect(sanitizeSearchQuery('Kolkata')).toBe('Kolkata');
    });

    it('limits string length to 100 characters', () => {
      const longString = 'a'.repeat(200);
      expect(sanitizeSearchQuery(longString)).toHaveLength(100);
    });

    it('returns empty string on non-string inputs', () => {
      expect(sanitizeSearchQuery(null)).toBe('');
      expect(sanitizeSearchQuery(undefined)).toBe('');
      expect(sanitizeSearchQuery(12345)).toBe('');
    });
  });

  describe('Coordinate Validation', () => {
    it('validates latitude correctly between -90 and 90', () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(48.85)).toBe(true);
      expect(isValidLatitude(-33.86)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);

      expect(isValidLatitude(90.1)).toBe(false);
      expect(isValidLatitude(-91)).toBe(false);
      expect(isValidLatitude('45')).toBe(false);
      expect(isValidLatitude(NaN)).toBe(false);
      expect(isValidLatitude(Infinity)).toBe(false);
    });

    it('validates longitude correctly between -180 and 180', () => {
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(139.69)).toBe(true);
      expect(isValidLongitude(-74.0)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);

      expect(isValidLongitude(180.5)).toBe(false);
      expect(isValidLongitude(-181)).toBe(false);
      expect(isValidLongitude(null)).toBe(false);
    });
  });

  describe('sanitizeNumber', () => {
    it('returns value if finite and within bounds', () => {
      expect(sanitizeNumber(50, 10, 0, 100)).toBe(50);
    });

    it('clamps values exceeding bounds', () => {
      expect(sanitizeNumber(150, 10, 0, 100)).toBe(100);
      expect(sanitizeNumber(-20, 10, 0, 100)).toBe(0);
    });

    it('uses fallback on NaN or invalid types', () => {
      expect(sanitizeNumber(NaN, 42)).toBe(42);
      expect(sanitizeNumber('50', 42)).toBe(42);
      expect(sanitizeNumber(undefined, 42)).toBe(42);
    });
  });

  describe('isValidLocation', () => {
    it('accepts valid location objects', () => {
      expect(
        isValidLocation({
          name: 'Tokyo',
          latitude: 35.68,
          longitude: 139.76,
        })
      ).toBe(true);
    });

    it('rejects invalid location objects', () => {
      expect(isValidLocation(null)).toBe(false);
      expect(isValidLocation({ name: '' })).toBe(false);
      expect(isValidLocation({ name: 'Nowhere', latitude: 200, longitude: 0 })).toBe(false);
    });
  });
});
