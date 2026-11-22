// LocalBazar Reactive Client Store & State Manager (Supports Customer, Seller, Admin)
class LocalBazarStore {
  constructor() {
    this.STORAGE_KEY = 'localbazar_state_v2';
    this.init();
  }

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.shops = parsed.shops || MOCK_DATA.shops;
        this.products = parsed.products || MOCK_DATA.products;
        this.orders = parsed.orders || this.getDefaultOrders();
        this.reviews = parsed.reviews || MOCK_DATA.reviews;
        this.inquiries = parsed.inquiries || this.getDefaultInquiries();
        this.currentUser = parsed.currentUser || this.getDemoUsers().customer;
        this.platformAnnouncement = parsed.platformAnnouncement || "🎉 Welcome to LocalBazar: Celebrating 30+ neighbourhood artisans and makers in your city!";
      } catch (e) {
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }

    this.cart = JSON.parse(sessionStorage.getItem('localbazar_cart') || '[]');
    this.compareList = JSON.parse(sessionStorage.getItem('localbazar_compare') || '[]');
    this.recentlyViewed = JSON.parse(sessionStorage.getItem('localbazar_viewed') || '[]');
  }

  getDemoUsers() {
    return {
      customer: {
        id: "cust-1",
        name: "Aditi Rao",
        email: "aditi@localbazar.com",
        role: "customer",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      },
      seller: {
        id: "seller-1",
        name: "Elena Rostova",
        email: "elena@crustcrumb.local",
        role: "seller",
        shopId: "shop-1",
        avatar: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=150&q=80"
      },
      admin: {
        id: "admin-1",
        name: "Vikram Rathore",
        email: "admin@localbazar.gov",
        role: "admin",
        title: "City Marketplace Director",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
      }
    };
  }

  resetToDefaults() {
    this.shops = JSON.parse(JSON.stringify(MOCK_DATA.shops));
    this.products = JSON.parse(JSON.stringify(MOCK_DATA.products));
    this.orders = this.getDefaultOrders();
    this.reviews = JSON.parse(JSON.stringify(MOCK_DATA.reviews));
    this.inquiries = this.getDefaultInquiries();
    this.currentUser = this.getDemoUsers().customer;
    this.platformAnnouncement = "🎉 Welcome to LocalBazar: Free hyperlocal delivery on all neighbourhood orders this week!";
    this.save();
  }

  save() {
    const data = {
      shops: this.shops,
      products: this.products,
      orders: this.orders,
      reviews: this.reviews,
      inquiries: this.inquiries,
      currentUser: this.currentUser,
      platformAnnouncement: this.platformAnnouncement
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  saveCart() {
    sessionStorage.setItem('localbazar_cart', JSON.stringify(this.cart));
  }

  saveCompare() {
    sessionStorage.setItem('localbazar_compare', JSON.stringify(this.compareList));
  }

  getDefaultOrders() {
    return [
      {
        id: "ORD-9412",
        customerId: "cust-1",
        customerName: "Aditi Rao",
        customerPhone: "+91 99887 66554",
        deliveryType: "delivery",
        deliveryAddress: "Flat 402, Lotus Court, Arts Quarter",
        status: "confirmed",
        date: new Date(Date.now() - 3600000 * 4).toISOString(),
        items: [
          { productId: "prod-1", shopId: "shop-1", name: "Heirloom Country Sourdough Loaf", price: 240, quantity: 2 },
          { productId: "prod-2", shopId: "shop-1", name: "Cardamom Orange Morning Buns (Pack of 2)", price: 220, quantity: 1 }
        ],
        subtotal: 700,
        deliveryFee: 40,
        total: 740,
        shopId: "shop-1"
      },
      {
        id: "ORD-9408",
        customerId: "cust-2",
        customerName: "Vikram Mehta",
        customerPhone: "+91 91234 56789",
        deliveryType: "pickup",
        deliveryAddress: "In-Store Pickup (Downtown Arts Quarter)",
        status: "ready",
        date: new Date(Date.now() - 3600000 * 26).toISOString(),
        items: [
          { productId: "prod-1", shopId: "shop-1", name: "Heirloom Country Sourdough Loaf", price: 240, quantity: 1 }
        ],
        subtotal: 240,
        deliveryFee: 0,
        total: 240,
        shopId: "shop-1"
      },
      {
        id: "ORD-9390",
        customerId: "cust-3",
        customerName: "Sneha Nair",
        customerPhone: "+91 94455 66778",
        deliveryType: "delivery",
        deliveryAddress: "14 Hill View, Arts Quarter",
        status: "delivered",
        date: new Date(Date.now() - 3600000 * 72).toISOString(),
        items: [
          { productId: "prod-3", shopId: "shop-1", name: "Rosemary Sea Salt Focaccia", price: 190, quantity: 2 }
        ],
        subtotal: 380,
        deliveryFee: 40,
        total: 420,
        shopId: "shop-1"
      },
      {
        id: "ORD-9375",
        customerId: "cust-4",
        customerName: "Rohan V.",
        customerPhone: "+91 98888 77766",
        deliveryType: "delivery",
        deliveryAddress: "72 Lake Road, Old Town",
        status: "delivered",
        date: new Date(Date.now() - 3600000 * 96).toISOString(),
        items: [
          { productId: "prod-4", shopId: "shop-2", name: "Wabi-Sabi Stoneware Mug", price: 650, quantity: 2 }
        ],
        subtotal: 1300,
        deliveryFee: 0,
        total: 1300,
        shopId: "shop-2"
      }
    ];
  }

  getDefaultInquiries() {
    return [
      {
        id: "inq-1",
        shopId: "shop-1",
        productId: "prod-1",
        productName: "Heirloom Country Sourdough Loaf",
        customerName: "Siddharth K.",
        customerEmail: "sid@gmail.com",
        message: "Hi Elena! Can I place a bulk order of 6 loaves for a family brunch this Saturday?",
        reply: "Hi Siddharth! Yes absolutely. Just order 24 hours in advance so we can prep the levain ferment.",
        date: "Today, 10:15 AM",
        status: "replied"
      },
      {
        id: "inq-2",
        shopId: "shop-1",
        productId: "prod-2",
        productName: "Cardamom Orange Morning Buns",
        customerName: "Pooja V.",
        customerEmail: "pooja@outlook.com",
        message: "Are the morning buns completely eggless?",
        reply: "",
        date: "Today, 1:20 PM",
        status: "pending"
      }
    ];
  }

  // Role switching
  switchRole(role) {
    const demos = this.getDemoUsers();
    if (demos[role]) {
      this.currentUser = demos[role];
      this.save();
      return this.currentUser;
    }
    return this.currentUser;
  }

  // Shop Management (Used by Seller and Admin)
  getShop(shopId) {
    return this.shops.find(s => s.id === shopId) || null;
  }

  updateShop(shopId, updates) {
    const idx = this.shops.findIndex(s => s.id === shopId);
    if (idx !== -1) {
      this.shops[idx] = { ...this.shops[idx], ...updates };
      this.save();
      return this.shops[idx];
    }
    return null;
  }

  toggleVerifyShop(shopId) {
    const shop = this.getShop(shopId);
    if (shop) {
      shop.verified = !shop.verified;
      this.save();
      return shop.verified;
    }
    return false;
  }

  toggleShopStatus(shopId) {
    const shop = this.getShop(shopId);
    if (shop) {
      shop.suspended = !shop.suspended;
      this.save();
      return shop.suspended;
    }
    return false;
  }

  addShop(shopData) {
    const newShop = {
      id: "shop-" + Date.now(),
      distanceKm: 1.5,
      rating: 5.0,
      reviewCount: 0,
      verified: false,
      suspended: false,
      announcements: [],
      offersDelivery: true,
      offersPickup: true,
      ...shopData
    };
    this.shops.unshift(newShop);
    this.save();
    return newShop;
  }

  addAnnouncement(shopId, text) {
    const shop = this.getShop(shopId);
    if (shop) {
      if (!shop.announcements) shop.announcements = [];
      shop.announcements.unshift({
        id: "ann-" + Date.now(),
        text,
        date: "Just now"
      });
      this.save();
      return true;
    }
    return false;
  }

  // Products Management
  getProducts(filters = {}) {
    let prods = [...this.products];

    // Exclude suspended shops unless admin
    if (filters.includeSuspended !== true) {
      const suspendedShopIds = this.shops.filter(s => s.suspended).map(s => s.id);
      prods = prods.filter(p => !suspendedShopIds.includes(p.shopId));
    }

    if (filters.category && filters.category !== 'all') {
      prods = prods.filter(p => p.category === filters.category);
    }

    if (filters.shopId) {
      prods = prods.filter(p => p.shopId === filters.shopId);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (this.getShop(p.shopId)?.name.toLowerCase().includes(q))
      );
    }

    if (filters.neighborhood && filters.neighborhood !== 'All Neighborhoods') {
      prods = prods.filter(p => {
        const s = this.getShop(p.shopId);
        return s && s.neighborhood === filters.neighborhood;
      });
    }

    if (filters.maxDistance) {
      prods = prods.filter(p => {
        const s = this.getShop(p.shopId);
        return s && s.distanceKm <= filters.maxDistance;
      });
    }

    if (filters.fulfillment) {
      if (filters.fulfillment === 'pickup') prods = prods.filter(p => p.pickupAvailable);
      if (filters.fulfillment === 'delivery') prods = prods.filter(p => p.deliveryAvailable);
    }

    if (filters.featuredOnly) {
      prods = prods.filter(p => p.adminFeatured);
    }

    // Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          prods.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          prods.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          prods.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          prods.sort((a, b) => b.salesCount - a.salesCount);
          break;
        case 'distance':
          prods.sort((a, b) => (this.getShop(a.shopId)?.distanceKm || 99) - (this.getShop(b.shopId)?.distanceKm || 99));
          break;
        default:
          break;
      }
    }

    return prods;
  }

  getProduct(id) {
    return this.products.find(p => p.id === id) || null;
  }

  addProduct(productData) {
    const newProduct = {
      id: "prod-" + Date.now(),
      rating: 5.0,
      salesCount: 0,
      pickupAvailable: true,
      deliveryAvailable: true,
      adminFeatured: false,
      tags: [],
      ...productData
    };
    this.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updates };
      this.save();
      return this.products[idx];
    }
    return null;
  }

  toggleFeatureProduct(id) {
    const prod = this.getProduct(id);
    if (prod) {
      prod.adminFeatured = !prod.adminFeatured;
      this.save();
      return prod.adminFeatured;
    }
    return false;
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.save();
  }

  // Cart Management
  addToCart(productId, quantity = 1) {
    const product = this.getProduct(productId);
    if (!product) return { success: false, message: "Product not found" };

    const existing = this.cart.find(i => i.productId === productId);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + quantity > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} units available in stock.`
      };
    }

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        productId,
        quantity,
        shopId: product.shopId
      });
    }

    this.saveCart();
    return { success: true, cartCount: this.getCartCount() };
  }

  updateCartQty(productId, quantity) {
    const product = this.getProduct(productId);
    if (!product) return;

    if (quantity <= 0) {
      this.cart = this.cart.filter(i => i.productId !== productId);
    } else {
      const item = this.cart.find(i => i.productId === productId);
      if (item) {
        item.quantity = Math.min(quantity, product.stock);
      }
    }
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartDetails() {
    let subtotal = 0;
    const items = this.cart.map(item => {
      const prod = this.getProduct(item.productId);
      const shop = prod ? this.getShop(prod.shopId) : null;
      const total = prod ? prod.price * item.quantity : 0;
      subtotal += total;
      return {
        ...item,
        product: prod,
        shop,
        itemTotal: total
      };
    }).filter(i => i.product);

    return {
      items,
      subtotal,
      deliveryFee: subtotal > 500 || subtotal === 0 ? 0 : 40,
      total: subtotal + (subtotal > 500 || subtotal === 0 ? 0 : 40)
    };
  }

  // Checkout & Order Placement
  createOrder(orderData) {
    const { items, deliveryType, deliveryAddress, customerName, customerPhone, paymentMethod } = orderData;

    // Verify Stock Atomically
    for (const item of items) {
      const prod = this.getProduct(item.productId);
      if (!prod || prod.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for '${prod?.name || 'Item'}'. Available: ${prod?.stock || 0}`
        };
      }
    }

    // Deduct stock and increment sales
    const orderItemsList = [];
    let subtotal = 0;

    for (const item of items) {
      const prod = this.getProduct(item.productId);
      prod.stock -= item.quantity;
      prod.salesCount = (prod.salesCount || 0) + item.quantity;
      const lineTotal = prod.price * item.quantity;
      subtotal += lineTotal;
      orderItemsList.push({
        productId: prod.id,
        shopId: prod.shopId,
        name: prod.name,
        price: prod.price,
        quantity: item.quantity
      });
    }

    const deliveryFee = deliveryType === 'pickup' ? 0 : (subtotal > 500 ? 0 : 40);
    const newOrder = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      customerId: this.currentUser?.id || "cust-1",
      customerName: customerName || this.currentUser?.name || "Local Neighbor",
      customerPhone: customerPhone || "+91 98765 00000",
      deliveryType,
      deliveryAddress,
      paymentMethod: paymentMethod || "UPI / Instant Pay",
      status: "confirmed",
      date: new Date().toISOString(),
      items: orderItemsList,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      shopId: orderItemsList[0]?.shopId || "shop-1"
    };

    this.orders.unshift(newOrder);
    this.clearCart();
    this.save();

    return { success: true, order: newOrder };
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.save();
      return true;
    }
    return false;
  }

  // Comparison List
  toggleCompare(productId) {
    const idx = this.compareList.indexOf(productId);
    if (idx !== -1) {
      this.compareList.splice(idx, 1);
    } else {
      if (this.compareList.length >= 3) {
        return { success: false, message: "You can compare up to 3 products at a time." };
      }
      this.compareList.push(productId);
    }
    this.saveCompare();
    return { success: true, list: this.compareList };
  }

  isInCompare(productId) {
    return this.compareList.includes(productId);
  }

  clearCompare() {
    this.compareList = [];
    this.saveCompare();
  }

  // Personalized Recommendations
  getRecommendations() {
    const all = [...this.products];
    const trending = [...all].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);

    const activeCategories = this.cart.map(c => this.getProduct(c.productId)?.category).filter(Boolean);
    const targetCategory = activeCategories[0] || (this.recentlyViewed[0] ? this.getProduct(this.recentlyViewed[0])?.category : "bakery");
    const categoryPicks = all.filter(p => p.category === targetCategory).slice(0, 4);

    const newArtisans = all.filter(p => p.shopId === "shop-2" || p.shopId === "shop-5").slice(0, 4);

    return {
      trending,
      categoryPicks: categoryPicks.length ? categoryPicks : all.slice(0, 4),
      newArtisans,
      targetCategory
    };
  }

  recordView(productId) {
    this.recentlyViewed = [productId, ...this.recentlyViewed.filter(id => id !== productId)].slice(0, 6);
    sessionStorage.setItem('localbazar_viewed', JSON.stringify(this.recentlyViewed));
  }

  // Seller Analytics Calculations
  getSellerAnalytics(shopId) {
    const shopProducts = this.products.filter(p => p.shopId === shopId);
    const shopOrders = this.orders.filter(o => o.shopId === shopId || o.items.some(i => i.shopId === shopId));

    let totalRevenue = 0;
    let unitsSold = 0;

    shopOrders.forEach(o => {
      o.items.forEach(i => {
        if (i.shopId === shopId || shopProducts.some(p => p.id === i.productId)) {
          totalRevenue += i.price * i.quantity;
          unitsSold += i.quantity;
        }
      });
    });

    const lowStockCount = shopProducts.filter(p => p.stock <= 5).length;
    const aov = shopOrders.length ? Math.round(totalRevenue / shopOrders.length) : 0;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const trendValues = [2400, 3100, 2800, 4200, 5600, 7100, totalRevenue ? Math.min(totalRevenue, 6200) : 4800];

    const categoryCounts = {};
    shopProducts.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    return {
      totalRevenue,
      totalOrders: shopOrders.length,
      unitsSold,
      activeProducts: shopProducts.length,
      lowStockCount,
      aov,
      trend: { labels: days, data: trendValues },
      categories: {
        labels: Object.keys(categoryCounts),
        data: Object.values(categoryCounts)
      },
      topProducts: [...shopProducts].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5)
    };
  }

  // Admin Analytics & City Overview Calculations
  getAdminAnalytics() {
    let totalGMV = 0;
    let totalUnits = 0;

    this.orders.forEach(o => {
      totalGMV += o.total;
      o.items.forEach(i => {
        totalUnits += i.quantity;
      });
    });

    const platformCommission = Math.round(totalGMV * 0.05); // 5% sustainable city fair trade commission
    const totalSellers = this.shops.length;
    const verifiedSellers = this.shops.filter(s => s.verified).length;
    const totalProducts = this.products.length;
    const lowStockAcrossCity = this.products.filter(p => p.stock <= 5).length;

    // Neighborhood sales share
    const neighborhoodSales = {};
    MOCK_DATA.neighborhoods.slice(1).forEach(n => {
      neighborhoodSales[n] = 0;
    });

    this.orders.forEach(o => {
      const shop = this.getShop(o.shopId);
      if (shop && neighborhoodSales[shop.neighborhood] !== undefined) {
        neighborhoodSales[shop.neighborhood] += o.total;
      } else {
        neighborhoodSales["Downtown Arts Quarter"] = (neighborhoodSales["Downtown Arts Quarter"] || 0) + o.total;
      }
    });

    return {
      totalGMV,
      platformCommission,
      totalOrders: this.orders.length,
      totalUnits,
      totalSellers,
      verifiedSellers,
      totalProducts,
      lowStockAcrossCity,
      neighborhoods: {
        labels: Object.keys(neighborhoodSales).map(n => n.replace(" Quarter", "").replace(" Market", "").replace(" Commons", "")),
        data: Object.values(neighborhoodSales)
      }
    };
  }

  setPlatformAnnouncement(text) {
    this.platformAnnouncement = text;
    this.save();
  }

  // Inquiries
  sendInquiry(inquiryData) {
    const newInquiry = {
      id: "inq-" + Date.now(),
      date: "Just now",
      status: "pending",
      reply: "",
      ...inquiryData
    };
    this.inquiries.unshift(newInquiry);
    this.save();
    return newInquiry;
  }

  replyInquiry(inquiryId, replyText) {
    const inq = this.inquiries.find(i => i.id === inquiryId);
    if (inq) {
      inq.reply = replyText;
      inq.status = "replied";
      this.save();
      return true;
    }
    return false;
  }

  // Customer Reviews
  addReview(reviewData) {
    const newRev = {
      id: "rev-" + Date.now(),
      date: "Just now",
      ...reviewData
    };
    this.reviews.unshift(newRev);

    const prodReviews = this.reviews.filter(r => r.productId === reviewData.productId);
    const avg = prodReviews.reduce((s, r) => s + r.rating, 0) / prodReviews.length;
    const prod = this.getProduct(reviewData.productId);
    if (prod) {
      prod.rating = Number(avg.toFixed(2));
    }

    this.save();
    return newRev;
  }
}

// Global store instance
window.store = new LocalBazarStore();
