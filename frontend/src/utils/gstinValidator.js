import { STATE_CODES } from '../data/gstSlabs.js';

/**
 * Validates a GSTIN (Goods and Services Tax Identification Number)
 * using format validation, state code lookup, and Luhn Mod-36 checksum.
 * 
 * @param {string} gstin 
 * @returns {object} { isValid: boolean, error: string, stateCode: string, stateName: string }
 */
export function validateGSTIN(gstin) {
  if (!gstin) {
    return { isValid: false, error: 'GSTIN is required' };
  }

  const cleanGstin = gstin.trim().toUpperCase();

  // 1. Length Check
  if (cleanGstin.length !== 15) {
    return { isValid: false, error: 'GSTIN must be exactly 15 characters long' };
  }

  // 2. Validate State Code
  const stateCode = cleanGstin.substring(0, 2);
  const stateName = STATE_CODES[stateCode];
  if (!stateName) {
    return { isValid: false, error: `Invalid state code: "${stateCode}"` };
  }

  // 3. Structural Regex Validation
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleanGstin)) {
    return { isValid: false, error: 'Invalid format. Format should be like: 22AAAAA0000A1Z5' };
  }

  // 4. Luhn Mod-36 Checksum Verification
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sum = 0;
  
  for (let i = 0; i < 14; i++) {
    const charValue = characters.indexOf(cleanGstin[i]);
    const multiplier = (i % 2 === 0) ? 1 : 2;
    const product = charValue * multiplier;
    
    // Sum digits in base 36 (equivalent to reduction mod 36)
    const digitSum = Math.floor(product / 36) + (product % 36);
    sum += digitSum;
  }

  const remainder = sum % 36;
  const checksumCharVal = (36 - remainder) % 36;
  const expectedChecksumChar = characters[checksumCharVal];
  
  if (cleanGstin[14] !== expectedChecksumChar) {
    return { 
      isValid: false, 
      error: `Invalid checksum digit. Expected "${expectedChecksumChar}" but got "${cleanGstin[14]}"` 
    };
  }

  return {
    isValid: true,
    stateCode,
    stateName
  };
}
