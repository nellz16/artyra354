# ArTyra 354 - Food Ordering System

Sistem pemesanan makanan modern dengan integrasi Supabase dan notifikasi WhatsApp.

## Setup Supabase

### 1. Buat Project Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Buat akun atau login
3. Klik "New Project"
4. Isi nama project: `artyra-354`
5. Pilih region terdekat
6. Buat password database yang kuat
7. Tunggu project selesai dibuat

### 2. Dapatkan Credentials
1. Di dashboard Supabase, buka tab "Settings" > "API"
2. Copy `Project URL` dan `anon public` key
3. Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# WhatsApp Bot (Opsional)
WHATSAPP_BOT_URL=your_whatsapp_bot_url
WHATSAPP_API_KEY=your_api_key
WHATSAPP_ADMIN_PHONE=628123456789
```

### 3. Setup Database Schema
1. Di dashboard Supabase, buka "SQL Editor"
2. Copy dan jalankan SQL dari file `supabase/migrations/create_initial_schema.sql`
3. Klik "Run" untuk membuat tabel dan policies

### 4. Verifikasi Setup
1. Buka tab "Table Editor" di Supabase
2. Pastikan tabel `products`, `orders`, dan `settings` sudah terbuat
3. Jalankan aplikasi dengan `npm run dev`
4. Coba buat produk baru di Admin Panel untuk test koneksi

## Fitur Utama

### 🏪 Storefront
- Tampilan produk dengan search
- Keranjang belanja
- Support unlimited stock dan limited stock
- Sistem topping untuk produk tertentu

### 🛒 Checkout System
- Form pembeli lengkap
- Pilihan pembayaran: GoPay dan COD
- Jadwal pengiriman untuk COD
- Validasi form komprehensif

### 👨‍💼 Admin Panel
- Dashboard dengan statistik
- Manajemen produk (CRUD)
- Manajemen pesanan dengan update status
- Pengaturan toko (nama & logo)
- Auto stock reduction saat pesanan selesai

### 📱 WhatsApp Integration
- Notifikasi otomatis ke admin saat ada pesanan baru
- Format pesan yang informatif
- Error handling jika bot tidak tersedia

### 🗄️ Database Features
- Real-time sync dengan Supabase
- Automatic timestamps
- Row Level Security (RLS)
- Data persistence

## Struktur Database

### Products Table
```sql
- id (bigint, PK)
- name (text)
- description (text)
- price (integer)
- stock (integer, nullable) -- NULL = unlimited
- image (text)
- has_toppings (boolean)
- toppings (jsonb)
```

### Orders Table
```sql
- id (text, PK) -- Format: TYO-timestamp
- numeric_id (bigint, unique)
- customer_name (text)
- customer_class (text, nullable)
- customer_wa (text)
- items (jsonb)
- total (integer)
- status (text)
- payment_method (text)
- delivery_info (jsonb, nullable)
```

### Settings Table
```sql
- id (integer, PK, default 1)
- store_name (text)
- logo_url (text, nullable)
```

## Deployment ke Vercel

1. Push code ke GitHub repository
2. Connect repository ke Vercel
3. Tambahkan environment variables di Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `WHATSAPP_BOT_URL` (opsional)
   - `WHATSAPP_API_KEY` (opsional)
   - `WHATSAPP_ADMIN_PHONE` (opsional)
4. Deploy

## Admin Access
- URL: `/artyra354`
- Username: `Han07`
- Password: `rehan7890`

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Notifications**: WhatsApp Bot API

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Support
Untuk bantuan setup atau troubleshooting, silakan buka issue di repository ini.