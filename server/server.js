const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory / File-Persisted Data Store for Production Server
const DATA_FILE = path.join(__dirname, 'data', 'store.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial state loader
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
      console.error('Error reading data file, resetting to seed:', e);
    }
  }

  const seed = {
    broadcastAnnouncement: "🎉 Welcome to LocalBazar: Celebrating 30+ neighbourhood artisans and makers in your city!",
    users: [
      { id: "cust-1", name: "Aditi Rao", email: "aditi@localbazar.com", role: "customer" },
      { id: "seller-1", name: "Elena Rostova", email: "elena@crustcrumb.local", role: "seller", shopId: "shop-1" },
      { id: "admin-1", name: "Vikram Rathore", email: "admin@localbazar.gov", role: "admin" }
    ],
    shops: [
      {
        id: "shop-1",
        name: "The Crust & Crumb Bakery",
        tagline: "Slow-fermented sourdough & wood-fired French pastries",
        owner: "Elena Rostova",
        phone: "+91 98765 43210",
        whatsapp: "919876543210",
        neighborhood: "Downtown Arts Quarter",
        distanceKm: 1.2,
        address: "42 Baker's Alley, Arts Quarter",
        hours: "Tue - Sun: 7:00 AM - 4:00 PM",
        rating: 4.9,
        reviewCount: 142,
        verified: true,
        suspended: false,
        banner: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
        avatar: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&q=80",
        story: "Started in Elena's home kitchen in 2021 using her great-grandmother's 60-year-old sourdough starter.",
        announcements: [{ id: "ann-1", text: "Fresh batch of cardamom morning buns just out! 🥐", date: "Today" }]
      },
      {
        id: "shop-2",
        name: "Clay & Kiln Studio",
        tagline: "Hand-thrown stoneware & glazed ceramic homeware",
        owner: "Aarav Sharma",
        phone: "+91 98221 11223",
        whatsapp: "919822111223",
        neighborhood: "Old Town Heritage",
        distanceKm: 2.8,
        address: "15 Potter's Lane, Old Town",
        hours: "Wed - Mon: 10:00 AM - 7:00 PM",
        rating: 4.8,
        reviewCount: 96,
        verified: true,
        suspended: false,
        banner: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
        avatar: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80",
        story: "Aarav creates functional art inspired by local river clay and mineral glazes.",
        announcements: []
      }
    ],
    products: [
      {
        id: "prod-1",
        shopId: "shop-1",
        name: "Heirloom Country Sourdough Loaf",
        category: "bakery",
        price: 240,
        originalPrice: 280,
        stock: 14,
        unit: "800g loaf",
        description: "Naturally leavened with wild yeast, fermented for 36 hours.",
        image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80",
        rating: 4.95,
        salesCount: 342,
        adminFeatured: true
      },
      {
        id: "prod-2",
        shopId: "shop-1",
        name: "Cardamom Orange Morning Buns (Pack of 2)",
        category: "bakery",
        price: 220,
        originalPrice: 250,
        stock: 4,
        unit: "Pack of 2",
        description: "Flaky laminated croissant dough rolled with crushed green cardamom.",
        image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        salesCount: 184,
        adminFeatured: false
      }
    ],
    orders: [
      {
        id: "ORD-9412",
        customerName: "Aditi Rao",
        customerPhone: "+91 99887 66554",
        deliveryType: "delivery",
        deliveryAddress: "Flat 402, Lotus Court, Arts Quarter",
        status: "confirmed",
        date: new Date().toISOString(),
        items: [
          { productId: "prod-1", shopId: "shop-1", name: "Heirloom Country Sourdough Loaf", price: 240, quantity: 2 }
        ],
        total: 520,
        shopId: "shop-1"
      }
    ],
    inquiries: [],
    reviews: []
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  return seed;
}

let db = loadData();

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// REST Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LocalBazar API (Customer·Seller·Admin)', timestamp: new Date().toISOString() });
});

// Authentication (Customer, Seller, Admin)
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  const user = db.users.find(u => u.email === email && (!role || u.role === role)) || {
    id: 'user-' + Date.now(),
    name: email.split('@')[0],
    email,
    role: role || 'customer',
    shopId: role === 'seller' ? 'shop-1' : undefined
  };
  res.json({ user, token: 'mock-jwt-token-' + user.id });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, role, businessName, address } = req.body;
  const newUser = {
    id: 'user-' + Date.now(),
    name,
    email,
    role: role || 'customer',
    shopId: role === 'seller' ? 'shop-' + Date.now() : undefined
  };
  db.users.push(newUser);

  if (role === 'seller') {
    db.shops.push({
      id: newUser.shopId,
      name: businessName || `${name}'s Workshop`,
      owner: name,
      address: address || '',
      neighborhood: 'Downtown Arts Quarter',
      verified: false,
      suspended: false,
      rating: 5.0,
      reviewCount: 0,
      banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      avatar: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&q=80',
      announcements: []
    });
  }

  saveData();
  res.status(201).json({ user: newUser });
});

// Shops
app.get('/api/shops', (_req, res) => {
  res.json({ shops: db.shops.filter(s => !s.suspended) });
});

app.get('/api/shops/:id', (req, res) => {
  const shop = db.shops.find(s => s.id === req.params.id);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  res.json({ shop });
});

app.put('/api/shops/:id', (req, res) => {
  const idx = db.shops.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Shop not found' });
  db.shops[idx] = { ...db.shops[idx], ...req.body };
  saveData();
  res.json({ shop: db.shops[idx] });
});

// Products
app.get('/api/products', (req, res) => {
  let list = [...db.products];
  if (req.query.category && req.query.category !== 'all') {
    list = list.filter(p => p.category === req.query.category);
  }
  if (req.query.shopId) {
    list = list.filter(p => p.shopId === req.query.shopId);
  }
  res.json({ products: list });
});

app.post('/api/products', (req, res) => {
  const newProd = {
    id: 'prod-' + Date.now(),
    rating: 5.0,
    salesCount: 0,
    adminFeatured: false,
    ...req.body
  };
  db.products.unshift(newProd);
  saveData();
  res.status(201).json({ product: newProd });
});

// Orders & Inventory Transactions
app.post('/api/orders', (req, res) => {
  const { items, deliveryType, deliveryAddress, customerName, customerPhone } = req.body;

  // Verify stock
  for (const item of items) {
    const prod = db.products.find(p => p.id === item.productId);
    if (!prod || prod.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${prod?.name || item.productId}` });
    }
  }

  // Atomic deduction
  let subtotal = 0;
  const processedItems = [];
  for (const item of items) {
    const prod = db.products.find(p => p.id === item.productId);
    prod.stock -= item.quantity;
    prod.salesCount = (prod.salesCount || 0) + item.quantity;
    subtotal += prod.price * item.quantity;
    processedItems.push({
      productId: prod.id,
      shopId: prod.shopId,
      name: prod.name,
      price: prod.price,
      quantity: item.quantity
    });
  }

  const deliveryFee = deliveryType === 'pickup' ? 0 : (subtotal > 500 ? 0 : 40);
  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    customerName: customerName || 'Neighbour',
    customerPhone: customerPhone || '',
    deliveryType,
    deliveryAddress,
    status: 'confirmed',
    date: new Date().toISOString(),
    items: processedItems,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    shopId: processedItems[0]?.shopId || 'shop-1'
  };

  db.orders.unshift(newOrder);
  saveData();
  res.status(201).json({ order: newOrder });
});

app.get('/api/orders', (req, res) => {
  let list = db.orders;
  if (req.query.shopId) {
    list = list.filter(o => o.shopId === req.query.shopId);
  }
  res.json({ orders: list });
});

// Admin Governance Endpoints
app.get('/api/admin/overview', (_req, res) => {
  let totalGMV = 0;
  let totalUnits = 0;
  db.orders.forEach(o => {
    totalGMV += o.total;
    o.items.forEach(i => totalUnits += i.quantity);
  });

  res.json({
    totalGMV,
    platformCommission: Math.round(totalGMV * 0.05),
    totalOrders: db.orders.length,
    totalSellers: db.shops.length,
    verifiedSellers: db.shops.filter(s => s.verified).length,
    totalProducts: db.products.length,
    totalUnits,
    broadcast: db.broadcastAnnouncement
  });
});

app.post('/api/admin/shops/:id/verify', (req, res) => {
  const shop = db.shops.find(s => s.id === req.params.id);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  shop.verified = !shop.verified;
  saveData();
  res.json({ shop });
});

app.post('/api/admin/products/:id/feature', (req, res) => {
  const prod = db.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });
  prod.adminFeatured = !prod.adminFeatured;
  saveData();
  res.json({ product: prod });
});

app.post('/api/admin/broadcast', (req, res) => {
  db.broadcastAnnouncement = req.body.message || '';
  saveData();
  res.json({ broadcastAnnouncement: db.broadcastAnnouncement });
});

// Serve frontend client statically
app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 LocalBazar (Customer · Seller · Admin) Server running at http://localhost:${PORT}`);
});
