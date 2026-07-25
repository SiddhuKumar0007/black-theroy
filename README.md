# Black Theory - Premium Luxury Streetwear E-Commerce Platform

A fast, responsive, and stunning luxury-themed full-stack e-commerce web application created for the clothing brand **Black Theory**. Inspired by high-fashion aesthetics (Apple, Nike, Zara), it features a minimalist black, white, and silver design.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js (App Router, JavaScript) + Tailwind CSS v4 + Lucide Icons + Framer Motion
* **Backend:** Node.js + Express.js + JWT Authentication + express-rate-limit
* **Database:** MongoDB (via Mongoose ORM)
* **API Architecture:** RESTful APIs (CORS enabled, securitized routes, rate limited)
* **Integrations:** Toggleable mock integrations for Stripe, Razorpay, and Firebase OTP.

---

## 📁 Project Structure

```
black-theory/
├── package.json           # Root concurrent scripts
├── README.md              # Documentation
├── backend/               # Express.js Server
│   ├── src/
│   │   ├── config/        # Database and gateway configuration
│   │   ├── models/        # Mongoose collections
│   │   ├── controllers/   # API controller logic
│   │   ├── middleware/    # Auth guards, role validation, error logging
│   │   ├── routes/        # Route declarations
│   │   └── server.js      # Express server entrance
│   ├── .env.example       # Example environment details
│   └── package.json
└── frontend/              # Next.js UI Application
    ├── public/            # Static assets
    ├── src/
    │   ├── app/           # App Router screens (Page, Shop, Checkout, Admin, Auth)
    │   ├── components/    # Reusable layouts (Navbar, Footer, CartDrawer, SearchOverlay)
    │   ├── context/       # Auth state, Wishlist sync, Cart checkout maths, Theme toggles
    │   └── utils/
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) running locally.

### 2. Workspace Installation
Install all dependencies for root, backend, and frontend with a single command from the root folder:
```bash
npm run install:all
```

### 3. Database Seeding
To make sure you don't have to manually create mock records, we've built a **one-click database seeder** endpoint. 
1. Start your local MongoDB server (usually at `mongodb://127.0.0.1:27017`).
2. Run the backend/frontend.
3. Open a browser and visit: **`http://localhost:5000/api/seed`**
4. This will instantly seed MongoDB with 4 premium clothing designs and 3 active coupons.

### 4. Running the Development Server
Launch both the Next.js frontend and Express backend concurrently:
```bash
npm run dev
```
* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000`

---

## 🔒 Test Accounts & Credentials (Sandbox Mode)

For seamless out-of-the-box local testing, you don't need real API credentials. We support a toggleable Sandbox mode:

### OTP Verification Code
* When testing Phone/OTP Login, use **any phone number** and enter the code: **`123456`**.

### Admin Access
* To access the Admin Dashboard panel, register an account using any email ending with **`@blacktheory.com`** (e.g., `admin@blacktheory.com`). The server will automatically elevate these signups to the `admin` role.
* Or log in with:
  * **Email:** `admin@blacktheory.com`
  * **Password:** `admin123` (once registered)

### Stripe & Razorpay Payments
* The checkout payment system simulates transaction pipelines, giving visual loaders and processing reports without requiring active keys.

---

## ✨ Design Features & Aesthetic System
* **Typography:** Outfit (Display/Headings) and Inter (Sans-Serif body copy) loaded via Google Fonts.
* **Palette:**
  * Obsidian Black (`#0B0B0B`)
  * Charcoal Dark (`#121212`)
  * Platinum Light Grey (`#F5F5F7`)
  * Chalk White (`#F9F6F0`)
* **Animations:** Luxury zoom scale hover cards, transition fades, and slider accordions.
