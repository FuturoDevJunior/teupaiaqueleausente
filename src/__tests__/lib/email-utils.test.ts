import {
  generateRandomEmail,
  generateUniqueId,
  isValidEmail,
} from '../../lib/email-utils';

describe('email-utils', () => {
  describe('generateRandomEmail', () => {
    it('should generate a random email with valid format', () => {
      const email = generateRandomEmail();
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      
      // Check that it contains a domain from the known list
      expect(email).toMatch(/(teupaiausente\.com\.br|paifoicomprarcigarros\.net\.br|paiquefoicomprarleite\.com\.br|esperandonoponto\.net\.br|voltologo\.com\.br|foibuscarcigarros\.net|seupainaovoltoumais\.com\.br|paifoicacarleite\.com|painaopagapensao\.net|paifoipraseletiva\.com\.br)$/);
    });
    
    it('should generate different emails on consecutive calls', () => {
      const email1 = generateRandomEmail();
      const email2 = generateRandomEmail();
      expect(email1).not.toEqual(email2);
    });
  });
  
  describe('isValidEmail', () => {
    it('should return true for valid email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('name+tag@example.org')).toBe(true);
    });
    
    it('should return false for invalid email formats', () => {
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
    });
  });
  
  describe('generateUniqueId', () => {
    it('should generate a string', () => {
      const id = generateUniqueId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
    
    it('should generate different IDs on consecutive calls', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      expect(id1).not.toEqual(id2);
    });
  });
}); 