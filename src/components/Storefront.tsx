import React, { useState } from 'react';
import { ShoppingCart, Search, FileText } from 'lucide-react';
import ProductCard from './ProductCard';

const Storefront = ({ products, settings, onProductClick, onCheckout, cart, onTrackOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {settings.logo_url ? (
              <div className="flex items-center">
                <img 
                  src={settings.logo_url} 
                  alt={settings.store_name}
                  className="h-10 w-10 rounded-full object-cover mr-3 shadow-md border-2 border-white"
                />
                <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  {settings.store_name}
                </h1>
              </div>
            ) : (
              <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                {settings.store_name}
              </h1>
            )}
            <span className="ml-2 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-full">
              Fresh
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={onTrackOrder} 
              className="hidden sm:flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <Search size={16} className="mr-2"/> 
              Lacak Pesanan
            </button>
            
            <button 
              onClick={onCheckout} 
              className="relative text-gray-600 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 p-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow-lg">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 animate-fade-in">
        <div className="mb-12 text-center">
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Menu <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Andalan</span> Kami
            </h2>
            <div className="absolute -top-2 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60 blur-sm"></div>
          </div>
          
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Nikmati kelezatan menu pilihan terbaik yang dibuat dengan cinta dan bahan berkualitas tinggi
          </p>
          
          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input 
                type="search" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Cari menu favoritmu..." 
                className="block w-full rounded-2xl border-gray-200 pl-12 py-4 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-xl focus:shadow-xl" 
              />
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onProductClick={onProductClick} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-gray-500">Coba kata kunci pencarian yang lain atau lihat semua menu kami.</p>
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mt-16 md:hidden">
          <button 
            onClick={onTrackOrder} 
            className="flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-100"
          >
            <Search size={16} className="mr-2"/> 
            Lacak Pesanan
          </button>
        </div>
      </main>
    </div>
  );
};

export default Storefront;