# 🌸 Bloom Flowers & Pooja Store — Full-Stack E-Commerce Platform

A high-performance, full-stack E-Commerce web application engineered for floral, pooja essentials, and garland retail. Features a responsive customer storefront, automated WhatsApp order processing, and a real-time admin management portal.

> **💼 Freelance Project Showcase**  
> Developed & Engineered by **[Likhith Naik](https://github.com/likhith-naik01)** as a **Freelance Full-Stack Developer** for a commercial client platform.

---

## 🚀 Key Features

### 🛍️ Customer Storefront
- **Dynamic Catalog & Filtering**: Search and filter by category (Garlands, Pooja Kits, Fresh Flowers, Bouquet, Leaves).
- **Interactive Shopping Cart**: Slide-out cart drawer with instant total calculations and unit variant selection.
- **WhatsApp Direct Ordering**: One-click order confirmation that auto-generates a formatted WhatsApp invoice sent directly to the store manager.
- **Customer Order Tracking**: Real-time order status lookup using customer phone number.

### 🛠️ Admin Control Center
- **Live Order Management**: Track incoming orders, update status (New, Processing, Out for Delivery, Completed), and review customer delivery notes.
- **Product & Category Manager**: Add, edit, or delete items, prices, unit variants, and multi-image galleries.
- **Banner Customization**: Dynamically update homepage hero banners.
- **Secure Authentication**: Credentials-based admin login panel.

### ⚡ Enterprise Cloud Database Architecture
- **Supabase PostgreSQL**: Cloud database backend configured with indexes and JSONB support for high-volume transactions (10,000+ orders).
- **Hybrid Storage Fallback**: Seamless fallback mechanism supporting both local development and enterprise cloud hosting.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Next.js, Tailwind CSS, Lucide Icons |
| **Backend** | Next.js Serverless API Routes |
| **Database** | Supabase (PostgreSQL Cloud DB) |
| **Styling & UI** | Glassmorphism & Mobile-First Responsive Design |
| **Deployment** | Vercel & Supabase Cloud |

---

## 📁 Project Structure

```text
Bloom-Flowers-Store/
├── schema.sql              # Supabase PostgreSQL DDL database schema
├── src/
│   ├── components/         # Reusable React UI components
│   │   ├── admin/          # Admin dashboard & management modals
│   │   ├── customer/       # Product cards, banners & cart drawer
│   │   └── layout/         # Header & mobile navigation bar
│   ├── context/            # Global React Context (Cart, Shop & Auth)
│   ├── lib/
│   │   ├── db.js           # Hybrid Database abstraction layer
│   │   ├── supabase.js     # Supabase client initialization
│   │   └── whatsapp.js     # WhatsApp invoice generator
│   └── pages/              # Next.js pages & API routes
│       ├── api/            # REST API endpoints (/orders, /products, /categories)
│       ├── admin/          # Admin portal routes
│       └── index.jsx       # Homepage
├── .env.example            # Environment variables template
└── README.md               # Project Documentation
```

---

## 💻 Local Setup & Development

1. **Clone Repository**:
   ```bash
   git clone https://github.com/likhith-naik01/Bloom-Flowers-Store-.git
   cd Bloom-Flowers-Store-
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 👨‍💻 Developed By

**Likhith Naik**  
*Freelance Full-Stack Developer & Software Engineer*  
- **GitHub**: [@likhith-naik01](https://github.com/likhith-naik01)
