import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import timeout from 'connect-timeout';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Timeout middleware
app.use(timeout('120s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// CORS configuration
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser configuration
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Storage configuration
const DATA_DIR = path.resolve('./backend/data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');

// Ensure directories exist
[DATA_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 4 // Maximum 4 files (1 template + 3 previews)
  }
});

// Template management functions
function loadTemplates() {
  if (!fs.existsSync(TEMPLATES_FILE)) {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveTemplates(templates) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
}

// Payment status management
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

function loadPayments() {
  if (!fs.existsSync(PAYMENTS_FILE)) {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
  return JSON.parse(data);
}

function savePayments(payments) {
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
}

// API to get all pending payments for admin
app.get('/api/payments/pending', (req, res) => {
  try {
    const payments = loadPayments();
    const pendingPayments = payments.filter(p => p.status === 'pending');
    console.log('Pending payments:', pendingPayments);
    res.json(pendingPayments);
  } catch (error) {
    console.error('Error loading payments:', error);
    res.status(500).json({ error: 'Failed to load payments' });
  }
});

// API to approve payment by admin
app.post('/api/payments/approve', (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' });
    }
    const payments = loadPayments();
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    payment.status = 'approved';
    savePayments(payments);
    res.json({ success: true });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// API to get payment status by paymentId (for user)
app.get('/api/payments/status/:paymentId', (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const payments = loadPayments();
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ status: payment.status });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// API to create a new payment record (called when user scans QR and initiates payment)
app.post('/api/payments/create', (req, res) => {
  try {
    const { paymentId, templateId, userId, amount } = req.body;
    if (!paymentId || !templateId || !userId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const payments = loadPayments();
    const existing = payments.find(p => p.paymentId === paymentId);
    if (existing) {
      return res.status(400).json({ error: 'Payment already exists' });
    }
    const newPayment = {
      id: paymentId,
      paymentId,
      templateId,
      userId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    payments.push(newPayment);
    savePayments(payments);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// API Routes
app.get('/api/templates', (req, res) => {
  try {
    const templates = loadTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

app.post('/api/templates', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'samplePreviews', maxCount: 3 }
]), async (req, res) => {
  try {
    const { title, price, description, type } = req.body;
    const file = req.files['file'] ? req.files['file'][0] : null;
    const samplePreviews = req.files['samplePreviews'] || [];

    if (!title || !price || !description || !type || !file || samplePreviews.length !== 3) {
      // Clean up uploaded files if validation fails
      Object.values(req.files || {}).flat().forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(400).json({ error: 'Missing required fields or files' });
    }

    const templates = loadTemplates();

    const newTemplate = {
      id: uuidv4(),
      title,
      price: parseInt(price),
      description,
      type,
      filePath: file.path,
      samplePreviewPaths: samplePreviews.map(sp => sp.path),
      uploadDate: new Date().toISOString()
    };

    templates.push(newTemplate);
    saveTemplates(templates);

    res.status(201).json(newTemplate);
  } catch (error) {
    // Clean up uploaded files if processing fails
    Object.values(req.files || {}).flat().forEach(file => {
      fs.unlinkSync(file.path);
    });
    console.error('Error uploading template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Set up static file serving
const marketplaceDir = path.resolve(path.join(__dirname, '..', 'marketplace'));
console.log('Marketplace directory:', marketplaceDir);

const serveStatic = require('serve-static');

// Disable directory listing by setting 'index' option and 'redirect' to false
app.use(express.static(marketplaceDir, { index: 'index.html', redirect: false }));

// Serve marketplace index.html directly on root path to avoid directory listing
app.get('/', (req, res) => {
  res.sendFile(path.join(marketplaceDir, 'index.html'));
});

// Serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(marketplaceDir, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
