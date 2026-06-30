import { useState, useCallback } from 'react';
import { STATE_CODES } from '../data/gstSlabs.js';

const initialItem = () => ({
  id: Math.random().toString(36).substr(2, 9),
  description: '',
  hsnCode: '',
  qty: 1,
  rate: 0,
  gstRate: 18 // Default to standard 18% slab
});

const defaultState = () => ({
  seller: {
    name: 'Suriya Enterprises',
    gstin: '33ABCDE1234F1Z7',
    stateCode: '33', // Tamil Nadu
    address: '123, Anna Salai, Chennai - 600 002'
  },
  buyer: {
    name: 'ABC Technologies Pvt Ltd',
    gstin: '27AABCU9603R1ZN', // Maharashtra
    stateCode: '27', // Maharashtra
    address: '456, Bandra Kurla Complex, Mumbai'
  },
  details: {
    invoiceNumber: 'INV-2026-001',
    invoiceDate: new Date().toISOString().substring(0, 10)
  },
  items: [
    {
      id: '1',
      description: 'Web Development Services',
      hsnCode: '998311',
      qty: 1,
      rate: 50000,
      gstRate: 18
    },
    {
      id: '2',
      description: 'UI/UX Design',
      hsnCode: '998312',
      qty: 1,
      rate: 15000,
      gstRate: 18
    }
  ]
});

export function useInvoice() {
  const [invoice, setInvoice] = useState(defaultState);

  // Helper to update seller fields
  const updateSeller = useCallback((field, value) => {
    setInvoice((prev) => {
      const updatedSeller = { ...prev.seller, [field]: value };
      
      // Auto-detect State Code from first 2 digits of GSTIN
      if (field === 'gstin' && value.length >= 2) {
        const potentialStateCode = value.substring(0, 2);
        if (STATE_CODES[potentialStateCode]) {
          updatedSeller.stateCode = potentialStateCode;
        }
      }

      return { ...prev, seller: updatedSeller };
    });
  }, []);

  // Helper to update buyer fields
  const updateBuyer = useCallback((field, value) => {
    setInvoice((prev) => {
      const updatedBuyer = { ...prev.buyer, [field]: value };
      
      // Auto-detect State Code from first 2 digits of GSTIN
      if (field === 'gstin' && value.length >= 2) {
        const potentialStateCode = value.substring(0, 2);
        if (STATE_CODES[potentialStateCode]) {
          updatedBuyer.stateCode = potentialStateCode;
        }
      }

      return { ...prev, buyer: updatedBuyer };
    });
  }, []);

  // Helper to update general invoice details
  const updateDetails = useCallback((field, value) => {
    setInvoice((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: value }
    }));
  }, []);

  // Items list operations
  const addItem = useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, initialItem()]
    }));
  }, []);

  const removeItem = useCallback((id) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id)
    }));
  }, []);

  const updateItem = useCallback((id, field, value) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        
        let parsedValue = value;
        if (field === 'qty') {
          parsedValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
        } else if (field === 'rate') {
          parsedValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
        } else if (field === 'gstRate') {
          parsedValue = parseFloat(value) || 0;
        }

        return { ...item, [field]: parsedValue };
      })
    }));
  }, []);

  const resetInvoice = useCallback(() => {
    setInvoice(defaultState());
  }, []);

  const loadInvoice = useCallback((loadedData) => {
    if (loadedData) {
      setInvoice(loadedData);
    }
  }, []);

  return {
    invoice,
    updateSeller,
    updateBuyer,
    updateDetails,
    addItem,
    removeItem,
    updateItem,
    resetInvoice,
    loadInvoice
  };
}
