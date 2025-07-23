import React from 'react';
import { ShoppingCart } from 'lucide-react';

const ProductCard = React.memo(({ product, onProductClick }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100">
      <div className="overflow-hidden h-56 relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 truncate mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed h-12 overflow-hidden mb-4">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <p className="text-indigo-600 font-bold text-xl">Rp {product.price.toLocaleString('id-ID')}</p>
          {product.stock !== null && (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Stok: {product.stock}
            </span>
          )}
        </div>
        <button 
          onClick={() => onProductClick(product)} 
          disabled={product.stock !== null && product.stock <= 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <ShoppingCart size={16} />
          {(product.stock === null || product.stock > 0) ? 'Tambah Keranjang' : 'Stok Habis'}
        </button>
      </div>
    </div>
  );
});

export default ProductCard;