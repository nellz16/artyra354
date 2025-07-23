import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database operations
export const dbOperations = {
  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Orders
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createOrder(order) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOrder(id, updates) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Settings
  async getSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || { store_name: 'ArTyra 354', logo_url: '' };
  },

  async updateSettings(settings) {
    const { data, error } = await supabase
      .from('settings')
      .upsert(settings)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// WhatsApp notification function
export async function sendWhatsAppAdminNotification(orderData) {
  const WHATSAPP_ADMIN_BOT_URL = import.meta.env.WHATSAPP_BOT_URL;
  const WHATSAPP_ADMIN_API_KEY = import.meta.env.WHATSAPP_API_KEY;
  const WHATSAPP_ADMIN_PHONE = import.meta.env.WHATSAPP_ADMIN_PHONE;

  if (!WHATSAPP_ADMIN_BOT_URL || !WHATSAPP_ADMIN_API_KEY || !WHATSAPP_ADMIN_PHONE) {
    console.log('WhatsApp Admin credentials not configured, notification skipped.');
    return { success: false, error: 'WhatsApp Admin not configured' };
  }

  const itemsList = orderData.items.map(item => 
    `• ${item.name} x${item.qty} - Rp ${(item.price * item.qty).toLocaleString('id-ID')}${
      item.toppings && item.toppings.length > 0 ? `\n  Topping: ${item.toppings.join(', ')}` : ''
    }`
  ).join('\n');

  const message = `🍽️ *PESANAN BARU DITERIMA!*

📋 *Detail Pesanan:*
• ID: \`${orderData.id}\`
• Nama: *${orderData.customer.name}*
${orderData.customer.kelas ? `• Kelas: *${orderData.customer.kelas}*\n` : ''}• WhatsApp: *${orderData.customer.wa}*
• Metode: *${orderData.paymentMethod === 'gopay' ? 'GoPay' : 'COD'}*
${orderData.deliveryInfo ? `• Pengiriman: *${new Date(orderData.deliveryInfo.date).toLocaleDateString('id-ID')} - ${orderData.deliveryInfo.time}*\n` : ''}
🛍️ *Items:*
${itemsList}

💰 *Total: Rp ${orderData.total.toLocaleString('id-ID')}*

${orderData.notes ? `📝 *Catatan:* ${orderData.notes}\n\n` : ''}⚡ Silakan cek admin panel untuk verifikasi.`;

  const payload = {
    to: WHATSAPP_ADMIN_PHONE,
    message: message
  };

  try {
    console.log(`[WHATSAPP_ADMIN] Sending notification to admin...`);
    
    const response = await fetch(WHATSAPP_ADMIN_BOT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': WHATSAPP_ADMIN_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('[WHATSAPP_ADMIN] Admin notification sent successfully:', result.message);
      return { success: true, data: result };
    } else {
      console.error('[WHATSAPP_ADMIN] Bot responded with error:', result.message);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('[WHATSAPP_ADMIN] Failed to connect to bot server:', error.message);
    return { success: false, error: 'Tidak dapat terhubung ke server bot admin.' };
  }
}