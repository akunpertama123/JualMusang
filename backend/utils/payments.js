import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('./backend/data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

export function loadPayments() {
  if (!fs.existsSync(PAYMENTS_FILE)) {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function savePayments(payments) {
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
}