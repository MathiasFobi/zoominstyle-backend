import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory product store (in production, use a database)
const products = [
  { id: 1, name: "This Meeting Could've Been an Email", price: 19.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", category: "t-shirt" },
  { id: 2, name: "BIG ZOOM ENERGY", price: 19.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", category: "t-shirt" },
  { id: 3, name: "Let's Take This Offline to a Bar", price: 19.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", category: "t-shirt" },
  { id: 4, name: "Adding Value by Nodding Silently", price: 19.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", category: "t-shirt" },
  { id: 5, name: "Quarter-Zip Sweater", price: 38.00, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400", category: "sweater" }
];

// In-memory cart (session-based in production)
let cart = [];

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Get cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// Add to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity, product });
  }
  
  res.json(cart);
});

// Update cart item quantity
app.put('/api/cart/:productId', (req, res) => {
  const { quantity } = req.body;
  const item = cart.find(i => i.productId === parseInt(req.params.productId));
  
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  if (quantity <= 0) {
    cart = cart.filter(i => i.productId !== parseInt(req.params.productId));
  } else {
    item.quantity = quantity;
  }
  
  res.json(cart);
});

// Remove from cart
app.delete('/api/cart/:productId', (req, res) => {
  cart = cart.filter(i => i.productId !== parseInt(req.params.productId));
  res.json(cart);
});

// Checkout (mock)
app.post('/api/checkout', (req, res) => {
  const { email, shippingAddress } = req.body;
  
  if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  
  const order = {
    id: Date.now(),
    items: [...cart],
    total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
    email,
    shippingAddress,
    status: 'pending'
  };
  
  cart = []; // Clear cart
  res.json({ success: true, order });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ZoomInStyle backend running on port ${PORT}`);
});