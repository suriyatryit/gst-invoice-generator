import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  hsnCode: { type: String, default: '' },
  qty: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, required: true }
});

const InvoiceSchema = new mongoose.Schema({
  seller: {
    name: { type: String, required: true },
    gstin: { type: String, default: '' },
    stateCode: { type: String, required: true },
    address: { type: String, default: '' }
  },
  buyer: {
    name: { type: String, required: true },
    gstin: { type: String, default: '' },
    stateCode: { type: String, required: true },
    address: { type: String, default: '' }
  },
  details: {
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: String, required: true }
  },
  items: [ItemSchema],
  totals: {
    isInterState: { type: Boolean, required: true },
    totalTaxableValue: { type: Number, required: true },
    totalCGST: { type: Number, required: true },
    totalSGST: { type: Number, required: true },
    totalIGST: { type: Number, required: true },
    totalTaxAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Invoice', InvoiceSchema);
