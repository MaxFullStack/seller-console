import { describe, it, expect } from 'vitest';
import { 
  validateEmail, 
  validateAmount, 
  validateName, 
  validateCompanyName 
} from '../utils';

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('email+tag@example.org')).toBe(true);
      expect(validateEmail('  test@example.com  ')).toBe(true); // with whitespace
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
      expect(validateEmail('test..test@example.com')).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('should validate correct amounts', () => {
      expect(validateAmount('')).toBe(true); // empty is valid (optional)
      expect(validateAmount('100')).toBe(true);
      expect(validateAmount('0')).toBe(true);
      expect(validateAmount('999999999')).toBe(true);
      expect(validateAmount('123.45')).toBe(true);
      expect(validateAmount('  100  ')).toBe(true); // with whitespace
    });

    it('should reject invalid amounts', () => {
      expect(validateAmount('abc')).toBe(false);
      expect(validateAmount('-100')).toBe(false);
      expect(validateAmount('1000000000')).toBe(false); // too large
      expect(validateAmount('12.34.56')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      expect(validateName('John Doe')).toBe(true);
      expect(validateName('Al')).toBe(true); // minimum 2 chars
      expect(validateName('A'.repeat(100))).toBe(true); // maximum 100 chars
      expect(validateName('  John  ')).toBe(true); // with whitespace
    });

    it('should reject invalid names', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('A')).toBe(false); // too short
      expect(validateName('A'.repeat(101))).toBe(false); // too long
      expect(validateName('   ')).toBe(false); // only whitespace
    });
  });

  describe('validateCompanyName', () => {
    it('should validate correct company names', () => {
      expect(validateCompanyName('ACME Inc')).toBe(true);
      expect(validateCompanyName('A')).toBe(true); // minimum 1 char
      expect(validateCompanyName('A'.repeat(100))).toBe(true); // maximum 100 chars
      expect(validateCompanyName('  ACME  ')).toBe(true); // with whitespace
    });

    it('should reject invalid company names', () => {
      expect(validateCompanyName('')).toBe(false);
      expect(validateCompanyName('A'.repeat(101))).toBe(false); // too long
      expect(validateCompanyName('   ')).toBe(false); // only whitespace
    });
  });
});