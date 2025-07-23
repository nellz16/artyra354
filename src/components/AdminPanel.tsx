import React, { useState, useEffect } from 'react';
import { 
  Menu, ArrowLeft, BarChart2, ListOrdered, Package, LogOut,
  DollarSign, Clock, Eye, Edit, Trash2, PlusCircle 
} from 'lucide-react';
import Modal from './ui/Modal';
import { getStatusChip, formatCurrency } from '../utils/helpers';
import { dbOperations } from '../lib/supabase';

const AdminPanel = ({ onLogout, orders, setOrders, products, setProducts, settings, setSettings, onOrderStatusUpdate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isOrderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // Dashboard Stats
  const today = new Date().toDateString();
  const omzetHariIni = orders.filter(o => o.orderDate.toDateString() === today && o.status === 'paid').reduce((sum, o) => sum + o.total, 0);
  const pesananHariIni = orders.filter(o => o.orderDate.toDateString() === today).length;
  const pesananPending = orders.filter(o => o.status === 'pending').length;

  const handleSaveProduct = async (productData) => {
    try {
      const processedData = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        stock: productData.unlimitedStock ? null : Number(productData.stock),
        image: productData.image,
        has_toppings: productData.hasToppings || false,
        toppings: productData.toppings || []
      };
      
      if (editingProduct) {
        // Update existing product
        await dbOperations.updateProduct(editingProduct.id, processedData);
        setProducts(products.map(p => 
          p.id === editingProduct.id 
            ? { 
                ...p, 
                ...productData, 
                price: Number(productData.price), 
                stock: productData.unlimitedStock ? null : Number(productData.stock),
                hasToppings: productData.hasToppings || false,
                toppings: productData.toppings || []
              }
            : p
        ));
      } else {
        // Create new product
        const newProductData = await dbOperations.createProduct(processedData);
        const newProduct = {
          id: newProductData.id,
          name: newProductData.name,
          description: newProductData.description,
          price: newProductData.price,
          stock: newProductData.stock,
          image: newProductData.image,
          hasToppings: newProductData.has_toppings,
          toppings: newProductData.toppings || []
        };
        setProducts([newProduct, ...products]);
      }
      
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Gagal menyimpan produk. Silakan coba lagi.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Anda yakin ingin menghapus produk ini?')) {
      try {
        await dbOperations.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk. Silakan coba lagi.');
      }
    }
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      onOrderStatusUpdate(orderId, newStatus, order.status);
    }
  };

  const handleSaveSettings = async (settingsData) => {
    try {
      await dbOperations.updateSettings(settingsData);
      setSettings(settingsData);
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan. Silakan coba lagi.');
    }
  };

  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <div className={`${bgColor} p-6 rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1`}>
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${color} shadow-md`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const ProductFormModal = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = useState(product || { 
      name: '', 
      description: '', 
      price: '', 
      stock: '', 
      image: '', 
      unlimitedStock: false,
      hasToppings: false,
      toppings: []
    });
    
    useEffect(() => {
      if (product) {
        setFormData({
          ...product,
          unlimitedStock: product.stock === null,
          stock: product.stock || '',
          hasToppings: product.hasToppings || false,
          toppings: product.toppings || []
        });
      } else {
        setFormData({ 
          name: '', 
          description: '', 
          price: '', 
          stock: '', 
          image: '', 
          unlimitedStock: false,
          hasToppings: false,
          toppings: []
        });
      }
    }, [product]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Produk' : 'Tambah Produk Baru'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Produk</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className="w-full border border-gray-200 rounded-xl shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Masukkan nama produk"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              rows="3" 
              className="w-full border border-gray-200 rounded-xl shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Deskripsikan produk Anda"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Harga (Rp)</label>
              <input 
                name="price" 
                type="number" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-200 rounded-xl shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stok</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={formData.unlimitedStock} 
                    onChange={(e) => setFormData(prev => ({ ...prev, unlimitedStock: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Stok Unlimited</span>
                </label>
                {!formData.unlimitedStock && (
                  <input 
                    name="stock" 
                    type="number" 
                    value={formData.stock} 
                    onChange={handleChange} 
                    required={!formData.unlimitedStock}
                    className="w-full border border-gray-200 rounded-xl shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0"
                  />
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL Gambar</label>
            <input 
              name="image" 
              value={formData.image} 
              onChange={handleChange} 
              required 
              className="w-full border border-gray-200 rounded-xl shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          {formData.image && (
            <img 
              src={formData.image} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-xl mt-4 bg-gray-100 border border-gray-200" 
            />
          )}
          
          <div>
            <label className="flex items-center mb-4">
              <input 
                type="checkbox" 
                checked={formData.hasToppings} 
                onChange={(e) => setFormData(prev => ({ ...prev, hasToppings: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300"
              />
              <span className="ml-2 text-sm font-semibold text-gray-700">Produk memiliki topping</span>
            </label>
            
            {formData.hasToppings && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Daftar Topping (pisahkan dengan koma)</label>
                <textarea 
                  value={Array.isArray(formData.toppings) ? formData.toppings.join(', ') : ''} 
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    toppings: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  }))} 
                  rows="3" 
                  className="w-full border border-gray-200 rounded-xl shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Oreo biscuits powder, Koko krunch, Biskuit stick"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 pt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  const SettingsModal = ({ isOpen, onClose, onSave, settings }) => {
    const [formData, setFormData] = useState(settings || { store_name: 'ArTyra 354', logo_url: '' });
    
    useEffect(() => {
      setFormData(settings || { store_name: 'ArTyra 354', logo_url: '' });
    }, [settings]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan Toko">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Toko</label>
            <input 
              name="store_name" 
              value={formData.store_name} 
              onChange={handleChange} 
              required 
              className="w-full border border-gray-200 rounded-xl shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Nama toko Anda"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL Logo (Opsional)</label>
            <input 
              name="logo_url" 
              value={formData.logo_url} 
              onChange={handleChange} 
              className="w-full border border-gray-200 rounded-xl shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
          
          {formData.logo_url && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preview Logo</label>
              <img 
                src={formData.logo_url} 
                alt="Logo Preview" 
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" 
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-4 pt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-gray-900">
                Dashboard <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Overview</span>
              </h3>
              <button 
                onClick={() => setIsSettingsModalOpen(true)} 
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold transition-all duration-200 text-sm"
              >
                ⚙️ Pengaturan Toko
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                icon={<DollarSign size={24} className="text-emerald-600"/>} 
                title="Omzet Hari Ini" 
                value={formatCurrency(omzetHariIni)} 
                color="bg-emerald-500 text-white"
                bgColor="bg-gradient-to-br from-emerald-50 to-green-50"
              />
              <StatCard 
                icon={<ListOrdered size={24} className="text-blue-600"/>} 
                title="Pesanan Hari Ini" 
                value={pesananHariIni} 
                color="bg-blue-500 text-white"
                bgColor="bg-gradient-to-br from-blue-50 to-indigo-50"
              />
              <StatCard 
                icon={<Clock size={24} className="text-amber-600"/>} 
                title="Menunggu Pembayaran" 
                value={pesananPending} 
                color="bg-amber-500 text-white"
                bgColor="bg-gradient-to-br from-amber-50 to-yellow-50"
              />
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="animate-fade-in">
            <h3 className="text-3xl font-black text-gray-900 mb-8">
              Manajemen <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Pesanan</span>
            </h3>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-4 font-bold">ID Pesanan</th>
                      <th className="px-6 py-4 font-bold">Pelanggan</th>
                      <th className="px-6 py-4 font-bold">Total</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 text-center font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-800 font-semibold">{order.id}</td>
                        <td className="px-6 py-4 font-semibold">{order.customer.name}</td>
                        <td className="px-6 py-4 font-semibold">{formatCurrency(order.total)}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={order.status} 
                            onChange={e => handleOrderStatusChange(order.id, e.target.value)} 
                            className={`${getStatusChip(order.status)} border-0 focus:ring-0 bg-transparent cursor-pointer`}
                          >
                            {['pending', 'paid', 'dikirim', 'selesai', 'dibatalkan'].map(s => (
                              <option key={s} value={s} className="bg-white text-black">{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => { setViewingOrder(order); setOrderDetailModalOpen(true); }} 
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                          >
                            <Eye size={18}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-gray-900">
                Manajemen <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Produk</span>
              </h3>
              <button 
                onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold transition-all duration-200"
              >
                <PlusCircle size={18} /> 
                Tambah Produk
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-4 font-bold">Produk</th>
                      <th className="px-6 py-4 font-bold">Harga</th>
                      <th className="px-6 py-4 font-bold">Stok</th>
                      <th className="px-6 py-4 text-center font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-4">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm border border-gray-100" 
                          />
                          <div>
                            <div className="font-bold text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-500 w-64 truncate mt-1">{p.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold">{formatCurrency(p.price)}</td>
                        <td className="px-6 py-4 font-semibold">
                          {p.stock === null ? (
                            <span className="text-green-600 font-bold">Unlimited</span>
                          ) : (
                            p.stock
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} 
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)} 
                              className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50 font-sans overflow-hidden">
      <aside className={`absolute md:relative z-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white w-64 flex-shrink-0 flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex shadow-2xl`}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white">Admin Panel</h2>
            <p className="text-xs text-gray-400 mt-1">KulinerPro Management</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => handleTabClick('dashboard')} 
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-left ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' : 'hover:bg-gray-700'}`}
          >
            <BarChart2 className="mr-3" size={20} /> 
            <span className="font-semibold">Dashboard</span>
          </button>
          <button 
            onClick={() => handleTabClick('orders')} 
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-left ${activeTab === 'orders' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' : 'hover:bg-gray-700'}`}
          >
            <ListOrdered className="mr-3" size={20} /> 
            <span className="font-semibold">Pesanan</span>
          </button>
          <button 
            onClick={() => handleTabClick('products')} 
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-left ${activeTab === 'products' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' : 'hover:bg-gray-700'}`}
          >
            <Package className="mr-3" size={20} /> 
            <span className="font-semibold">Produk</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center px-4 py-3 rounded-xl text-red-300 hover:bg-red-500 hover:text-white transition-all duration-200 font-semibold"
          >
            <LogOut className="mr-3" size={20} /> 
            Logout
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-lg shadow-sm p-6 flex items-center border-b border-gray-100">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-gray-600 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} />
          </button>
          <h2 className="ml-4 text-2xl font-bold text-gray-800 capitalize">{activeTab}</h2>
        </header>
        
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      <ProductFormModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onSave={handleSaveProduct} 
        product={editingProduct} 
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        onSave={handleSaveSettings} 
        settings={settings} 
      />
      
      <Modal 
        isOpen={isOrderDetailModalOpen} 
        onClose={() => setOrderDetailModalOpen(false)} 
        title={`Detail Pesanan: ${viewingOrder?.id}`}
        size="lg"
      >
        {viewingOrder && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Nama:</strong> {viewingOrder.customer.name}</div>
              {viewingOrder.customer.kelas && <div><strong>Kelas:</strong> {viewingOrder.customer.kelas}</div>}
              <div><strong>No. WA:</strong> {viewingOrder.customer.wa}</div>
              <div><strong>Tanggal:</strong> {viewingOrder.orderDate.toLocaleString('id-ID')}</div>
            </div>
            
            {viewingOrder.paymentMethod && (
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-4 rounded-xl border border-gray-100">
                <strong>Metode Pembayaran:</strong> {viewingOrder.paymentMethod === 'gopay' ? 'GoPay' : 'COD'}
                {viewingOrder.deliveryInfo && (
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Jadwal Pengiriman:</strong> {new Date(viewingOrder.deliveryInfo.date).toLocaleDateString('id-ID')} - {viewingOrder.deliveryInfo.time}
                  </div>
                )}
              </div>
            )}
            
            {viewingOrder.notes && (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>Catatan:</strong> {viewingOrder.notes}
              </div>
            )}
            
            <div className="border-t pt-4 mt-4">
              <strong>Item Dipesan:</strong>
              <ul className="list-disc pl-5 mt-2">
                {viewingOrder.items.map((item, i) => (
                  <li key={i} className="mb-1">
                    {item.name} x {item.qty} - {formatCurrency(item.price * item.qty)}
                    {item.toppings && item.toppings.length > 0 && (
                      <span className="text-indigo-600 ml-2">({item.toppings.join(', ')})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="font-bold border-t pt-4 mt-4 text-lg text-center bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
              Total: <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatCurrency(viewingOrder.total)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPanel;