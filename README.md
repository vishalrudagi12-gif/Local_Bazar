# 🛍️ LocalBazar — Hyperlocal Digital Marketplace

[![Deploy to GitHub Pages](https://github.com/vishalrudagi12-gif/Local_Bazar/actions/workflows/deploy.yml/badge.svg)](https://github.com/vishalrudagi12-gif/Local_Bazar/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-10b981?style=for-the-badge&logo=github)](https://vishalrudagi12-gif.github.io/Local_Bazar/)

> **Connecting Neighborhoods, Empowering Local Small Enterprises.**  
> A full-stack e-commerce marketplace featuring 3 explicit persona roles: **Customer (Buyer)**, **Seller (Local Merchant)**, and **Admin (City Marketplace Director)**.

---

## 🌐 Live Deployed Application

- **Live URL:** **[https://vishalrudagi12-gif.github.io/Local_Bazar/](https://vishalrudagi12-gif.github.io/Local_Bazar/)**
- **GitHub Repository:** **[https://github.com/vishalrudagi12-gif/Local_Bazar](https://github.com/vishalrudagi12-gif/Local_Bazar)**

---

## 🎭 The 3 Characters & Roles

LocalBazar features a **dedicated Login & Persona Authentication system** with 1-click demo logins for all three characters:

| Character | Role / Persona | Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **🛍️ Aditi Rao** | **Customer (Neighbourhood Buyer)** | • Hyperlocal discovery by neighbourhood, walking distance (2 km), and fulfillment type.<br>• Side-by-side product comparison (compares up to 3 local finds).<br>• Personalized AI recommendations (Trending & Handcrafted for you).<br>• Basket, Doorstep Delivery vs. In-Store Pickup, simulated checkout & live order tracking.<br>• Direct customer inquiry to seller ("Ask the Maker") and verified 5-star reviews. |
| **🏪 Elena Rostova** | **Seller (The Crust & Crumb Bakery)** | • Custom storefront branding (story, bio, operating hours, direct WhatsApp chat).<br>• Real-time inventory tracking with **Low-Stock warning badges** ($\le 5$ units) and quick restock buttons (`+5`, `-1`).<br>• Order fulfillment pipeline (`Confirmed` ➔ `Packed/Ready` ➔ `Delivered`).<br>• Interactive Chart.js analytics (7-day revenue trend line chart & category distribution).<br>• Storefront announcements and customer Q&A inquiries inbox. |
| **🛡️ Vikram Rathore** | **Platform Admin (City Director)** | • Platform overview: City-wide GMV, Total Orders, Active Merchants, and 5% Fair Trade Platform Fee.<br>• Interactive city economic activity chart by neighbourhood.<br>• **Seller Verification & Compliance**: Audit merchants and toggle official **"Verified Local Merchant"** badge on/off, or suspend non-compliant shops.<br>• **Product Moderation**: Award official **"⭐ Admin Choice"** badges to curate top artisanal products for the homepage.<br>• **City-Wide Broadcast Banner**: Publish city-wide alerts and festival discount announcements. |

---

## ⚡ 1-Click Character Login Walkthrough

In the top navigation header:
1. Click the **Profile Pill** (or click *"Switch Persona"* in the top banner).
2. The **Role Authentication Modal** opens.
3. Click any of the 3 quick login cards:
   - **Login as Customer** (Aditi Rao) ➔ Switches instantly to Shop Local view.
   - **Login as Seller** (Elena Rostova) ➔ Switches instantly to the Seller Dashboard & Analytics.
   - **Login as Admin** (Vikram Rathore) ➔ Switches instantly to the City Governance & Verification Portal.
4. Or use the credentials form to log in with custom emails and passwords.

---

## 🏗️ Architecture & Technology Stack

| Component | Technologies Used |
|---|---|
| **Frontend UI/UX** | HTML5, Tailwind CSS, FontAwesome 6, Lucide Icons, Canvas Confetti |
| **Data Visualization** | Chart.js (Seller 7-day revenue trend, Seller category share, Admin city volume) |
| **Client Engine** | LocalBazar Reactive Store with LocalStorage & SessionStorage persistence |
| **Backend REST API** | Node.js, Express.js, CORS, JSON persistence (`server/server.js`) |
| **Deployment** | GitHub Actions (`.github/workflows/deploy.yml`) ➔ GitHub Pages |

---

## 💻 Running the Server Locally

```powershell
cd "C:\Users\bgk\.gemini\antigravity\scratch\Local_Bazar"
npm install
npm start
```
Server runs at **`http://localhost:5000`** with full REST API and frontend hosting.

---

## 📄 License
MIT License © 2026 LocalBazar.
