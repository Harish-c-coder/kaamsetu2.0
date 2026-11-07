# HyperLocal-Connect — Zero-Commission Local Marketplace

**HyperLocal-Connect** is a full-stack hyperlocal marketplace web application designed to connect local workers, artisans, street vendors, and customers directly across neighborhoods in India with **100% zero marketplace commission**.

Built with a modern Indian aesthetic, accessible regional language translations, voice typing in **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, and **English**, GPS location discovery, and direct WhatsApp Click-to-Chat / phone integration.

---

## 🌟 Key Features

### 1. Dual User Experience
- **Customer Interface (`/customer/home`, `/customer/search`)**:
  - Live search by service, product, or trade name.
  - Category filters: Electricians, Plumbers, Carpenters, Painters, Vegetable Sellers, Potters, Handloom Weavers, and Other Services.
  - "Available Now" toggle filter.
  - GPS Distance filter: **1 km, 2 km, 5 km, 10 km**.
  - Sort by: Nearest First, Starting Price (Low-to-High / High-to-Low), Most Viewed, Newest.
  - Grid / List view toggle.
  - Provider detail page (`/provider/:id`) with services catalog, direct enquiry submission, and live view tracking.
- **Worker / Vendor Interface (`/worker/dashboard`, `/worker/register`)**:
  - Worker registration with Indian phone format (`+91`), category, locality, GPS base, service radius slider, starting price, and profile photo presets.
  - **Browser Web Speech API Voice Input**: microphone button that listens in Telugu (`te-IN`), Hindi (`hi-IN`), or English (`en-IN`) and transcribes into the service description field.
  - 1-click **Availability Toggle** (`Available Now` vs `Currently Busy`).
  - Catalog Management: Create, edit, and delete services & product listings with photos and prices.
  - Customer Enquiries Tracker: view real inquiries with customer phone numbers and direct WhatsApp reply / call buttons.

### 2. Zero-Commission & Direct Contact
- **WhatsApp Click-to-Chat**: Uses valid `https://wa.me/<phone>?text=...` URLs with prefilled inquiry messages that open in a new tab.
- **Direct Calling**: One-tap telephone links via `tel:<phone>`.
- **Zero Commission**: 100% of customer payments go straight to the local worker.

### 3. Smart Database & Zero-Setup Fallback
- **MongoDB + Mongoose** with `2dsphere` index and GeoJSON Point coordinates `[longitude, latitude]`.
- **Zero-Setup In-Memory Store**: If MongoDB is not installed or running, the backend automatically switches to an in-memory repository pre-loaded with realistic sample data for Hyderabad (Kukatpally, Ameerpet, Banjara Hills, Hitec City, Charminar, etc.). **Runs instantly out of the box on any computer without needing local MongoDB installed!**

### 4. Multilingual & Regional Voice Support
- Interface translated into **English**, **తెలుగు (Telugu)**, and **हिन्दी (Hindi)**.
- High-quality Unicode fonts (`Plus Jakarta Sans`, `Noto Sans Telugu`, `Noto Sans Devanagari`).

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + Vite 8
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - Lucide React icons
  - React Router DOM v7
  - Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
  - Browser Geolocation API (`navigator.geolocation`)
- **Backend**:
  - Node.js & Express.js
  - RESTful APIs with route controllers
  - JWT Authentication & bcryptjs password hashing
  - CORS enabled
- **Database**:
  - MongoDB with Mongoose (with dual-mode in-memory repository fallback)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Installation
Clone or navigate to the project directory:
```bash
cd "hyperlocal-connect"
```

Install root, client, and server dependencies:
```bash
# In the root folder:
npm install

# In the client folder:
cd client
npm install
cd ..

# In the server folder:
cd server
npm install
cd ..
```

### 2. Environment Configuration
Create `.env` file in the `server` directory (or copy from `.env.example`):
```bash
cp server/.env.example server/.env
```

Contents of `server/.env`:
```env
PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/hyperlocal_connect
JWT_SECRET=hyperlocal_connect_secure_jwt_secret_key_2026
NODE_ENV=development
```
> **Note**: If `MONGODB_URI` is not set or local MongoDB is offline, the backend automatically boots with the in-memory data store containing the Hyderabad sample dataset.

### 3. Run Development Server
To run both backend API (port 5000) and frontend client (port 5173) together:
```bash
npm run dev
```

Open your browser at:
👉 **http://localhost:5173**

---

## 📱 Page Routes

| Route | Description |
| :--- | :--- |
| `/` | Landing page with Hero, Search, Categories, How-it-Works, and Benefits |
| `/choose-role` | Choose Worker/Vendor or Customer interface + Demo quick-login |
| `/customer/home` | Customer discovery dashboard with search, category filters, distance, and sorting |
| `/customer/search` | Search results alias |
| `/provider/:id` | Public worker/vendor profile, services catalog, and enquiry form |
| `/worker/register` | Worker registration with Web Speech voice input & GPS capture |
| `/worker/dashboard` | Worker management dashboard (Overview, Listings, Enquiries, Edit Profile) |
| `/worker/listings` | Manage services and products |
| `/worker/enquiries` | View customer inquiries |
| `/login` | Worker login with phone / PIN + Instant 1-click Demo Accounts |

---

## 📡 Backend API Endpoints

### Worker Endpoints (`/api/workers`)
- `GET /api/workers` - Search providers with text, category, locality, distance, availability, and sort.
- `GET /api/workers/:id` - Get public profile, active listings, and increment views.
- `POST /api/workers` - Register new worker and publish profile.
- `PUT /api/workers/:id` - Update worker details or availability status.
- `GET /api/workers/:id/dashboard` - Get profile completion %, views, enquiry count, and recent messages.

### Listing Endpoints (`/api/listings`)
- `GET /api/listings/worker/:workerId` - Get all services/products for a worker.
- `POST /api/listings` - Create new service or product listing.
- `PUT /api/listings/:id` - Update existing listing.
- `DELETE /api/listings/:id` - Delete listing.

### Enquiry Endpoints (`/api/enquiries`)
- `POST /api/enquiries` - Submit customer inquiry to a worker.
- `GET /api/enquiries/worker/:workerId` - Retrieve inquiries for worker dashboard.
- `PUT /api/enquiries/:id/status` - Mark inquiry status (`read`, `replied`).

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/login` - Worker authentication via phone and optional password.
- `GET /api/auth/me` - Get current authenticated worker profile.

---

## 🧪 Demo Data & Instant Testing

The project includes pre-configured demo workers in Hyderabad, Telangana with fictional phone numbers reserved for safe testing:

1. **Ramesh Kumar** — Electrician (Kukatpally) • `+919999900001`
2. **Suresh Varma** — Plumber (Ameerpet) • `+919999900002`
3. **Mohammad Ismail** — Carpenter (Banjara Hills) • `+919999900003`
4. **Laxmi Amma** — Vegetable Seller (Dilsukhnagar) • `+919999900004`
5. **Balaram Clay Arts** — Potter (Charminar) • `+919999900005`
6. **Venkat Weaves** — Handloom Weaver (Secunderabad) • `+919999900006`
7. **Anand Raju** — Home Painter (Begumpet) • `+919999900007`
8. **Kavitha Boutique** — Tailoring & Alterations (Madhapur) • `+919999900008`

You can click any of the instant demo buttons on `/choose-role` or `/login` to test the worker dashboard without typing!

---

## 🔒 Security & Privacy

- All worker passwords are encrypted using **bcryptjs**.
- API communications are secured with **JWT tokens**.
- All user inputs are sanitized and validated.
- WhatsApp links use standard Click-to-Chat without exposing unauthorized data.
