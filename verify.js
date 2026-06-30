// Verification Script for GST Invoice Generator business logic
import { validateGSTIN } from './frontend/src/utils/gstinValidator.js';
import { calculateInvoiceTotals } from './frontend/src/utils/gstCalc.js';

console.log('----------------------------------------------------');
console.log('RUNNING AUTOMATED LOGIC VERIFICATION TESTS');
console.log('----------------------------------------------------');

let failedTestsCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    failedTestsCount++;
  }
}

// ==========================================
// TEST 1: GSTIN Checksum Validation Rules
// ==========================================
console.log('\n--- Test Group 1: GSTIN Validation ---');

// Valid GSTINs
const val1 = validateGSTIN('33ABCDE1234F1Z7');
assert(val1.isValid === true && val1.stateName === 'Tamil Nadu', 
  'Should validate correct Tamil Nadu GSTIN (33ABCDE1234F1Z7)');

const val2 = validateGSTIN('27AABCU9603R1ZN');
assert(val2.isValid === true && val2.stateName === 'Maharashtra',
  'Should validate correct Maharashtra GSTIN (27AABCU9603R1ZN)');

// Invalid GSTIN formats/checksums
const val3 = validateGSTIN('33ABCDE1234F1Z9');
assert(val3.isValid === false && val3.error.includes('checksum'),
  'Should fail GSTIN with incorrect checksum (33ABCDE1234F1Z9)');

const val4 = validateGSTIN('99AAAAA0000A1Z1');
assert(val4.isValid === false && val4.error.includes('state code'),
  'Should fail GSTIN with invalid state code 99');

const val5 = validateGSTIN('INVALIDGSTIN12');
assert(val5.isValid === false && val5.error.includes('15 characters'),
  'Should fail GSTIN that does not have 15 characters');


// ==========================================
// TEST 2: Intra-State GST Calculation Splits
// ==========================================
console.log('\n--- Test Group 2: Intra-State Supply (CGST + SGST) ---');

const itemsIntra = [
  { description: 'Item 1', qty: 2, rate: 1000, gstRate: 18 }, // Taxable = 2000, GST = 360
  { description: 'Item 2', qty: 1, rate: 500, gstRate: 12 }   // Taxable = 500, GST = 60
];

// Seller state = "33" (Tamil Nadu), Buyer state = "33" (Tamil Nadu)
const totalsIntra = calculateInvoiceTotals('33', '33', itemsIntra);

assert(totalsIntra.isInterState === false, 'Intra-state flag should be false');
assert(totalsIntra.totalTaxableValue === 2500, `Taxable value should be 2500, got ${totalsIntra.totalTaxableValue}`);
assert(totalsIntra.totalCGST === 210, `CGST should be 210 (2000*0.09 + 500*0.06), got ${totalsIntra.totalCGST}`);
assert(totalsIntra.totalSGST === 210, `SGST should be 210, got ${totalsIntra.totalSGST}`);
assert(totalsIntra.totalIGST === 0, `IGST should be 0, got ${totalsIntra.totalIGST}`);
assert(totalsIntra.totalTaxAmount === 420, `Total Tax should be 420, got ${totalsIntra.totalTaxAmount}`);
assert(totalsIntra.grandTotal === 2920, `Grand Total should be 2920, got ${totalsIntra.grandTotal}`);


// ==========================================
// TEST 3: Inter-State GST Calculation Splits
// ==========================================
console.log('\n--- Test Group 3: Inter-State Supply (IGST) ---');

const itemsInter = [
  { description: 'Item 1', qty: 5, rate: 1000, gstRate: 18 } // Taxable = 5000, GST = 900
];

// Seller state = "33" (Tamil Nadu), Buyer state = "27" (Maharashtra)
const totalsInter = calculateInvoiceTotals('33', '27', itemsInter);

assert(totalsInter.isInterState === true, 'Inter-state flag should be true');
assert(totalsInter.totalTaxableValue === 5000, 'Taxable value should be 5000');
assert(totalsInter.totalCGST === 0, 'CGST should be 0');
assert(totalsInter.totalSGST === 0, 'SGST should be 0');
assert(totalsInter.totalIGST === 900, `IGST should be 900, got ${totalsInter.totalIGST}`);
assert(totalsInter.grandTotal === 5900, 'Grand Total should be 5900');


// ==========================================
// SUMMARY
// ==========================================
console.log('\n----------------------------------------------------');
if (failedTestsCount === 0) {
  console.log('ALL TESTS COMPLETED SUCCESSFULLY! BUSINESS LOGIC IS VERIFIED.');
} else {
  console.error(`${failedTestsCount} TEST(S) FAILED. PLEASE DEBUG CALCULATIONS AND CHECKSUMS.`);
  process.exit(1);
}
console.log('----------------------------------------------------');
