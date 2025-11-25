require('dotenv').config();
const express = require('express');
const path = require('path');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// View engine (for success page)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// Razorpay instance (uses env vars)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret'
});

// Simple API: return products.json if exists in data, else try public/img/products
app.get('/api/products', (req, res) => {
  const file = path.join(__dirname, 'data', 'products.json');
  if (fs.existsSync(file)) {
    return res.json(JSON.parse(fs.readFileSync(file)));
  }
  // fallback: try to build from public/img/products
  const imgDir = path.join(__dirname, 'public', 'img', 'products');
  let products = [];
  if (fs.existsSync(imgDir)) {
    const imgs = fs.readdirSync(imgDir).filter(f => !f.startsWith('.'));
    products = imgs.map((img, i) => ({
      id: 'P' + String(i+1).padStart(3,'0'),
      title: 'GenZ Tee ' + (i+1),
      brand: 'GenZ',
      price: 1299 + i*100,
      image: '/img/products/' + img,
      rating: 5
    }));
  }
  res.json(products);
});

// Create Razorpay order
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    // amount must be in paise (INR) for Razorpay
    const options = {
      amount: parseInt(amount) * 100, // convert to paise
      currency: currency || 'INR',
      receipt: receipt || ('rcpt_' + Date.now())
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Create order error', err);
    res.status(500).json({ error: 'Unable to create order' });
  }
});

// Payment success page (renders data passed via query or body)
app.get('/payment/success', (req, res) => {
  // expecting query parameters: razorpay_payment_id, razorpay_order_id, razorpay_signature, amount
  res.render('success', { query: req.query });
});

// Fallback to index.html for any front-end route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
