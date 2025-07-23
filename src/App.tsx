import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { dbOperations, sendWhatsAppAdminNotification } from './lib/supabase';
import Storefront from './components/Storefront';
import CheckoutPage from './components/CheckoutPage';
import LoginPage from './components/LoginPage';
import OrderDetailPage from './components/OrderDetailPage';
import TransactionSearchPage from './components/TransactionSearchPage';
import AdminPanel from './components/AdminPanel';
import ToppingModal from './components/ToppingModal';
import Toast from './components/ui/Toast';

export default function App() {
  const [currentPage, setCurrentPage] = useState('storefront');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ store_name: 'ArTyra 354', logo_url: '' });
  const [viewingOrderId, setViewingOrderId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [toppingSelection, setToppingSelection] = useState({ isOpen: false, product: null });
  const [loading, setLoading] = useState(true);

  // Load initial data from Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [productsData, ordersData, settingsData] = await Promise.all([
          dbOperations.getProducts(),
          dbOperations.getOrders(),
          dbOperations.getSettings()
        ]);
        
        // Transform products data
        const transformedProducts = productsData.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          image: p.image,
          hasToppings: p.has_toppings,
          toppings: p.toppings || []
        }));
        
        // Transform orders data
        const transformedOrders = ordersData.map(o => ({
          numericId: o.numeric_id,
          id: o.id,
          customer: {
            name: o.customer_name,
            kelas: o.customer_class,
            wa: o.customer_wa
          },
          items: o.items,
          total: o.total,
          status: o.status,
          notes: o.notes,
          orderDate: new Date(o.created_at),
          paymentMethod: o.payment_method,
          deliveryInfo: o.delivery_info
        }));
        
        setProducts(transformedProducts);
        setOrders(transformedOrders);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('Gagal memuat data. Menggunakan data default.', 'error');
        // Fallback to initial data if Supabase fails
        const { initialProducts, initialOrdersData } = await import('./data/initialData');
        setProducts(initialProducts);
        setOrders(initialOrdersData);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  // Check for admin route on mount and when URL changes
  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.pathname === '/artyra354') {
        setCurrentPage('login');
      }
    };

    checkAdminRoute();
    
    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      checkAdminRoute();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (message, type = 'info') => setToast({ show: true, message, type });

  const handleAddToCart = useCallback((product, toppings = []) => {
    // Check if product is out of stock
    if (product.stock !== null && product.stock <= 0) {
      showToast('Produk ini sedang habis stok', 'error');
      return;
    }
    
    const cartItemId = Date.now();
    const newCartItem = { ...product, quantity: 1, toppings, cartItemId };
    setCart(prevCart => [...prevCart, newCartItem]);
    
    const toppingText = toppings.length > 0 ? ` dengan ${toppings.length} topping` : '';
    showToast(`${product.name}${toppingText} ditambahkan ke keranjang!`, 'success');
  }, []);

  const handleProductClick = (product) => {
    if (product.hasToppings) {
      setToppingSelection({ isOpen: true, product: product });
    } else {
      handleAddToCart(product);
    }
  };

  const handlePlaceOrder = useCallback(async (newOrder) => {
    try {
      // Prepare order data for Supabase
      const orderData = {
        id: newOrder.id,
        numeric_id: newOrder.numericId,
        customer_name: newOrder.customer.name,
        customer_class: newOrder.customer.kelas,
        customer_wa: newOrder.customer.wa,
        items: newOrder.items,
        total: newOrder.total,
        status: newOrder.status,
        notes: newOrder.notes,
        payment_method: newOrder.paymentMethod,
        delivery_info: newOrder.deliveryInfo
      };
      
      // Save to Supabase
      await dbOperations.createOrder(orderData);
      
      // Send WhatsApp notification
      try {
        await sendWhatsAppAdminNotification(newOrder);
      } catch (notifError) {
        console.error('WhatsApp notification failed:', notifError);
        // Don't fail the order creation if notification fails
      }
      
      // Update local state
      setOrders(prev => [newOrder, ...prev].sort((a, b) => b.numericId - a.numericId));
      setCart([]);
      setViewingOrderId(newOrder.numericId);
      setCurrentPage('orderDetail');
      showToast(`Pesanan ${newOrder.id} berhasil dibuat!`, 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Gagal membuat pesanan. Silakan coba lagi.', 'error');
    }
  }, []);

  const handleOrderStatusUpdate = useCallback(async (orderId, newStatus, oldStatus) => {
    try {
      // Update in Supabase
      await dbOperations.updateOrder(orderId, { status: newStatus });
      
      // If status changed to 'selesai', reduce stock for products with limited stock
      if (newStatus === 'selesai' && oldStatus !== 'selesai') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const stockUpdates = [];
          
          for (const item of order.items) {
            const product = products.find(p => p.name === item.name);
            if (product && product.stock !== null) {
              const newStock = Math.max(0, product.stock - item.qty);
              stockUpdates.push(
                dbOperations.updateProduct(product.id, { stock: newStock })
              );
              
              // Update local state
              setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, stock: newStock } : p
              ));
            }
          }
          
          await Promise.all(stockUpdates);
        }
      }
      
      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      
      showToast(`Status pesanan berhasil diubah ke ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Gagal mengubah status pesanan', 'error');
    }
  }, [orders, products]);

  const handleLoginSuccess = () => setCurrentPage('admin');
  const handleLogout = () => {
    setCurrentPage('storefront');
    // Reset URL to home when logging out
    window.history.pushState({}, '', '/');
  };
  const handleGoToStore = () => {
    setCurrentPage('storefront');
    // Reset URL to home when going back to store
    window.history.pushState({}, '', '/');
  };
  const handleGoToTrackOrder = () => setCurrentPage('transactionSearch');

  // Show loading screen while data is being fetched
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-xl font-bold text-gray-700">Memuat ArTyra 354...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'storefront':
        return (
          <Storefront 
            products={products} 
            settings={settings}
            cart={cart} 
            onProductClick={handleProductClick} 
            onCheckout={() => cart.length > 0 ? setCurrentPage('checkout') : showToast('Keranjang Anda masih kosong')} 
            onTrackOrder={handleGoToTrackOrder} 
          />
        );
      case 'checkout':
        return <CheckoutPage cart={cart} onPlaceOrder={handlePlaceOrder} onBack={handleGoToStore} />;
      case 'login':
        return <LoginPage onLogin={handleLoginSuccess} onBack={handleGoToStore} />;
      case 'orderDetail':
        return <OrderDetailPage orderId={viewingOrderId} orders={orders} onBack={handleGoToStore} />;
      case 'transactionSearch':
        return <TransactionSearchPage orders={orders} onBack={handleGoToStore} />;
      case 'admin':
        return (
          <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <p className="text-xl font-bold text-gray-700">Memuat Admin Panel...</p>
              </div>
            </div>
          }>
            <AdminPanel 
              onLogout={handleLogout} 
              orders={orders} 
              setOrders={setOrders} 
              products={products} 
              setProducts={setProducts} 
              settings={settings}
              setSettings={setSettings}
              onOrderStatusUpdate={handleOrderStatusUpdate}
            />
          </Suspense>
        );
      default:
        return (
          <Storefront 
            products={products} 
            cart={cart} 
            onProductClick={handleProductClick} 
            onCheckout={() => cart.length > 0 ? setCurrentPage('checkout') : showToast('Keranjang Anda masih kosong')} 
            onTrackOrder={handleGoToTrackOrder} 
          />
        );
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .animate-fade-in { 
          animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .animate-scale-in { 
          animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .animate-slide-in-right { 
          animation: slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes scaleIn { 
          from { transform: scale(0.9); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
        @keyframes slideInRight { 
          from { transform: translateX(100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }
      `}</style>
      
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onDismiss={() => setToast({ show: false, message: '', type: 'info' })} 
        />
      )}
      
      <ToppingModal 
        selection={toppingSelection} 
        onClose={() => setToppingSelection({ isOpen: false, product: null })} 
        onAddToCart={handleAddToCart}
        showToast={showToast}
      />
      
      {renderPage()}
    </>
  );
}