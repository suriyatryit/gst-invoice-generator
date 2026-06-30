import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import invoicesRouter from './routes/invoices.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gst-invoice';

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/invoices', invoicesRouter);

// Root Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(), 
    message: 'GST Invoice Generator Backend Service is running' 
  });
});

// Connect to MongoDB & Start Server
console.log('Connecting to MongoDB...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Express server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failure details:', error.message);
    console.log('Please ensure local MongoDB service is running or check your MONGO_URI in .env');
    // Start server anyway on offline mode so it doesn't crash the startup
    app.listen(PORT, () => {
      console.log(`Express server running in OFFLINE mode on port ${PORT} (Database connection failed)`);
    });
  });
