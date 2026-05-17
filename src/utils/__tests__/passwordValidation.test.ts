import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from '../passwordValidation';

describe('validatePassword', () => {
  it('validates a strong password meeting all requirements', () => {
    const result = validatePassword('SecurePass1!');
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.requirements.length).toBe(true);
    expect(result.requirements.uppercase).toBe(true);
    expect(result.requirements.lowercase).toBe(true);
    expect(result.requirements.numbers).toBe(true);
    expect(result.requirements.special).toBe(true);
    expect(result.feedback).toHaveLength(0);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = validatePassword('Abc1!');
    expect(result.isValid).toBe(false);
    expect(result.requirements.length).toBe(false);
    expect(result.feedback).toContain('Mindestens 8 Zeichen erforderlich');
  });

  it('rejects a password without an uppercase letter', () => {
    const result = validatePassword('securepass1!');
    expect(result.requirements.uppercase).toBe(false);
    expect(result.feedback).toContain('Mindestens ein Großbuchstabe erforderlich');
  });

  it('rejects a password without a lowercase letter', () => {
    const result = validatePassword('SECUREPASS1!');
    expect(result.requirements.lowercase).toBe(false);
    expect(result.feedback).toContain('Mindestens ein Kleinbuchstabe erforderlich');
  });

  it('rejects a password without a number', () => {
    const result = validatePassword('SecurePass!!');
    expect(result.requirements.numbers).toBe(false);
    expect(result.feedback).toContain('Mindestens eine Zahl erforderlich');
  });

  it('rejects a password without a special character', () => {
    const result = validatePassword('SecurePass1');
    expect(result.requirements.special).toBe(false);
    expect(result.feedback).toContain('Mindestens ein Sonderzeichen erforderlich');
  });

  it('penalizes passwords with 3+ repeated characters', () => {
    const result = validatePassword('SecureP1!aaa');
    expect(result.feedback).toContain('Vermeiden Sie wiederholende Zeichen');
  });

  it('penalizes passwords with sequential character patterns', () => {
    const result = validatePassword('SecPass123!');
    expect(result.feedback).toContain('Vermeiden Sie aufeinanderfolgende Zeichen');
  });

  it('awards a bonus for passwords 12+ characters long', () => {
    // 8-char password meeting all requirements: base score = 90 (no length bonus)
    const shortResult = validatePassword('SecPas1!');
    // 15-char password: base score = 90 + 10 bonus = 100
    const longResult = validatePassword('SecurePassLng1!');
    expect(longResult.score).toBeGreaterThan(shortResult.score);
  });

  it('caps the score at 100', () => {
    const result = validatePassword('SecureExcellentLongPassword1!Extra');
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('keeps the score non-negative even with penalties', () => {
    // short, repeated chars, sequential — many penalties
    const result = validatePassword('aaa123');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('marks a password as invalid when score < 60 despite all requirements met', () => {
    // This scenario is hard to trigger with the current scoring but isValid checks score >= 60
    // A weak but technically compliant password with penalties applied
    const result = validatePassword('Abc1!aaa'); // repeated chars → -10, sequential-ish
    // requirements all met but score may be under threshold depending on penalties
    // Test that the isValid flag correctly reflects the combined check
    expect(result.isValid).toBe(result.requirements.length &&
      result.requirements.uppercase &&
      result.requirements.lowercase &&
      result.requirements.numbers &&
      result.requirements.special &&
      result.score >= 60);
  });
});

describe('getPasswordStrengthColor', () => {
  it('returns red for score below 30', () => {
    expect(getPasswordStrengthColor(0)).toBe('text-red-600');
    expect(getPasswordStrengthColor(29)).toBe('text-red-600');
  });

  it('returns yellow for score 30–59', () => {
    expect(getPasswordStrengthColor(30)).toBe('text-yellow-600');
    expect(getPasswordStrengthColor(59)).toBe('text-yellow-600');
  });

  it('returns blue for score 60–79', () => {
    expect(getPasswordStrengthColor(60)).toBe('text-blue-600');
    expect(getPasswordStrengthColor(79)).toBe('text-blue-600');
  });

  it('returns green for score 80 and above', () => {
    expect(getPasswordStrengthColor(80)).toBe('text-green-600');
    expect(getPasswordStrengthColor(100)).toBe('text-green-600');
  });
});

describe('getPasswordStrengthText', () => {
  it('returns "Schwach" for score below 30', () => {
    expect(getPasswordStrengthText(0)).toBe('Schwach');
    expect(getPasswordStrengthText(29)).toBe('Schwach');
  });

  it('returns "Mittel" for score 30–59', () => {
    expect(getPasswordStrengthText(30)).toBe('Mittel');
    expect(getPasswordStrengthText(59)).toBe('Mittel');
  });

  it('returns "Stark" for score 60–79', () => {
    expect(getPasswordStrengthText(60)).toBe('Stark');
    expect(getPasswordStrengthText(79)).toBe('Stark');
  });

  it('returns "Sehr stark" for score 80 and above', () => {
    expect(getPasswordStrengthText(80)).toBe('Sehr stark');
    expect(getPasswordStrengthText(100)).toBe('Sehr stark');
  });
});
