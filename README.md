# 🛍️ LocalBazar — Hyperlocal Digital Marketplace

[![Deploy to GitHub Pages](https://github.com/vishalrudagi12-gif/Local_Bazar/actions/workflows/deploy.yml/badge.svg)](https://github.com/vishalrudagi12-gif/Local_Bazar/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-10b981?style=for-the-badge&logo=github)](https://vishalrudagi12-gif.github.io/Local_Bazar/)

> **Connecting Neighborhoods, Empowering Local Small Enterprises.**  
> A full-stack e-commerce marketplace built specifically to help neighborhood small businesses build their online identity, manage product inventory, fulfill orders, and compete effectively against giant e-commerce conglomerates.

---

## 🌐 Live Deployed Application

- **Live URL:** **[https://vishalrudagi12-gif.github.io/Local_Bazar/](https://vishalrudagi12-gif.github.io/Local_Bazar/)**
- **GitHub Repository:** **[https://github.com/vishalrudagi12-gif/Local_Bazar](https://github.com/vishalrudagi12-gif/Local_Bazar)**

---

## 🎯 Problem Statement & Solution

### The Challenge
Small enterprises (artisan bakeries, local potters, organic family farms, handmade textile weavers, small-batch soap makers) face critical bottlenecks:
- Low online discovery and visibility compared to corporate platforms.
- Orders scattered haphazardly across WhatsApp, Instagram DMs, and paper notebooks.
- Complicated stock tracking leading to embarrassing overselling or stockouts.
- High platform commissions (25-35%) and no direct connection with neighborhood buyers.

### The LocalBazar Solution
LocalBazar brings local businesses and local consumers into **one unified digital marketplace**:
1. **Digital Storefront Identity:** Each small enterprise receives a branded shop page with their story, operating hours, direct WhatsApp chat, and a "Verified Local Merchant" badge.
2. **Product & Inventory Engine:** Live stock tracking with low-stock alerts (≤ 5 units), automatic inventory deduction on customer purchases, and instant stock increments.
3. **Fulfillment Pipeline:** Kanban-style order processing with status updates: `Confirmed` ➔ `Packed / Ready for Pickup` ➔ `Out for Delivery` ➔ `Delivered`.
4. **Hyperlocal Discovery:** Buyers filter products and shops by neighborhood, distance radius (<2km, <5km, <10km), and fulfillment mode (Instant In-Store Pickup or 45-min Local Delivery).
5. **Smart Product Comparison:** Side-by-side comparison modal allowing buyers to compare up to 3 local items across pricing, distance, ingredients, ratings, and stock.
6. **Personalized Recommendations:** Algorithmic curation highlighting "Trending in Your Neighborhood", "Category Taste Affinity", and "Support New Local Artisans".
7. **Customer Engagement Hub:** Shop announcements broadcast (e.g., fresh bread fresh out of the oven) and direct 1-on-1 customer inquiries with instant seller replies.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI/UX** | HTML5, Tailwind CSS, FontAwesome 6, Lucide Icons, Canvas Confetti |
| **Data Visualization** | Chart.js (7-Day Sales Trend & Category Distribution) |
| **Client State / Offline Engine** | LocalBazar Reactive Store with LocalStorage & SessionStorage persistence |
| **Backend REST API** | Node.js, Express.js, CORS, JSON persistence |
| **Container & Cloud** | Docker, Docker Compose, Render (`render.yaml`), Vercel (`vercel.json`) |
| **CI/CD & Deployment** | GitHub Actions (`.github/workflows/deploy.yml`) ➔ GitHub Pages |

---

## ⚡ Quick Start Guide (Run Locally)

### Prerequisites
- Node.js (v18+)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/vishalrudagi12-gif/Local_Bazar.git
cd Local_Bazar
```

### 2. Install dependencies & Start Server
```bash
npm install
npm start
```
The server will start at: **`http://localhost:5000`**

### 3. Open in Browser
Open **`http://localhost:5000`** in your browser.  
- Switch between **"Shop Local"** (Buyer Mode) and **"Seller Hub"** (Seller Dashboard) with 1 click in the top navigation bar!

---

## 📦 Features Walkthrough

### 👨‍🌾 For Local Sellers (Small Enterprises)
- **Seller Hub Dashboard:** Real-time analytics tracking Total Revenue, Orders, Units Sold, Average Order Value, and Low Stock count.
- **Interactive Visual Charts:** 7-Day sales trend line chart and category distribution doughnut chart.
- **Product & Inventory Management:** Add, edit, or delete items; set custom pricing and compare-at discount prices; quick stock adjustments (`+5`, `-1`); and automated stock depletion alerts.
- **Order Pipeline Manager:** Advance customer orders through `Confirmed`, `Ready for Pickup`, and `Delivered`.
- **Neighbourhood Announcements:** Broadcast immediate updates to local shoppers (e.g. fresh bread out of oven).
- **Customer Inquiries Inbox:** Receive and reply to direct customer inquiries.

### 🛍️ For Local Buyers (Neighbours)
- **Hyperlocal Filters:** Filter by neighborhood (Downtown Arts Quarter, Greenfield Market, Old Town, Westside Commons, Riverside Promenade).
- **Radius Slider:** Limit finds to walking distance (2 km) or neighbourhood (5 km).
- **Side-by-Side Product Comparison:** Compare up to 3 items on price, ingredients, distance, and verified seller status.
- **Personalized Recommendations:** Trending local finds and dynamic category recommendations.
- **Basket & Checkout:** Select Doorstep Delivery or In-Store Pickup, enter delivery details, and complete simulated instant checkout with celebration confetti!
- **Order Tracking:** Real-time visual 4-step order progress timeline.
- **Verified Reviews:** Submit 5-star ratings and authentic feedback.

---

## 🚀 Deployment

### Continuous Deployment via GitHub Pages
Any commit pushed to the `main` branch triggers the GitHub Actions workflow at `.github/workflows/deploy.yml`, publishing the client directly to:
**`https://vishalrudagi12-gif.github.io/Local_Bazar/`**

### Deploying the Backend on Render
1. Create a free account on [render.com](https://render.com).
2. Connect your GitHub repository `vishalrudagi12-gif/Local_Bazar`.
3. Render automatically detects `render.yaml` and deploys the Node.js API service!

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
