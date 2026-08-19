# Database Schema Instructions

This directory contains the PostgreSQL schema for the Bloom Flower Shop platform.

## How to Apply Schema to Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to the **SQL Editor** tab from the left sidebar.
4. Click **New query**.
5. Copy all contents of [`schema.sql`](file:///d:/Bloom%20WEB/src/database/schema.sql) and paste them into the SQL Editor.
6. Click **Run** to execute the query and create tables (`profiles`, `orders`, `order_status_history`, `categories`, `products`, `banners`, `admins`) along with Row Level Security (RLS) policies.
