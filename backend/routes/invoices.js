import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Define local JSON storage path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, '../invoices_local.json');

// Helper functions for local JSON storage
function readLocalInvoices() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading local invoice database:', error);
    return [];
  }
}

function writeLocalInvoices(invoices) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(invoices, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to local invoice database:', error);
    return false;
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// 1. GET all invoices (ordered by latest first)
router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const invoices = readLocalInvoices();
      // sort by createdAt desc
      invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(invoices);
    }
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving invoices', error: error.message });
  }
});

// 2. GET a single invoice details
router.get('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const invoices = readLocalInvoices();
      const invoice = invoices.find(inv => inv._id === req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      return res.json(invoice);
    }
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving invoice', error: error.message });
  }
});

// 3. POST - Save a new invoice
router.post('/', async (req, res) => {
  try {
    const { seller, buyer, details, items, totals } = req.body;

    // Basic validation
    if (!seller?.name || !buyer?.name || !details?.invoiceNumber || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required invoice fields' });
    }

    if (!isDbConnected()) {
      const invoices = readLocalInvoices();
      const newInvoice = {
        _id: new mongoose.Types.ObjectId().toString(),
        seller,
        buyer,
        details,
        items,
        totals,
        createdAt: new Date().toISOString()
      };
      invoices.push(newInvoice);
      writeLocalInvoices(invoices);
      return res.status(201).json(newInvoice);
    }

    const newInvoice = new Invoice({
      seller,
      buyer,
      details,
      items,
      totals
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: 'Error saving invoice', error: error.message });
  }
});

// 4. DELETE - Remove an invoice from history
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const invoices = readLocalInvoices();
      const index = invoices.findIndex(inv => inv._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      invoices.splice(index, 1);
      writeLocalInvoices(invoices);
      return res.json({ message: 'Invoice deleted successfully', id: req.params.id });
    }
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error: error.message });
  }
});

export default router;
