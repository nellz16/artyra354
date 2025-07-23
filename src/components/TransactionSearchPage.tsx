import React, { useState } from 'react';
import { Search, ArrowLeft, FileText } from 'lucide-react';
import { getStatusChip, formatCurrency } from '../utils/helpers';

const TransactionSearchPage = ({ orders, onBack }) => {
  const [searchInput, setSearchInput] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setFoundOrder(null);
    
    if (!searchInput.trim()) {
      setSearchMessage('Silakan masukkan ID Pesanan.');
      return;
    }

    const numericId = searchInput.toUpperCase().replace('TYO-', '').trim();
    const order = orders.find(o => o.numericId.toString() === numericId);
    
    if (order) {
      setFoundOrder(order);
      setSearchMessage('');
    } else {
      setSearchMessage(`Pesanan dengan ID "${searchInput}" tidak ditemukan.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800 font-semibold bg-white hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali ke Toko
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Lacak</span> Pesanan
            </h1>
            <p className="text-gray-600 text-lg">Masukkan ID pesanan untuk melihat status terkini</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Pesanan
              </label>
              <input 
                type="text" 
                value={searchInput} 
                onChange={e => setSearchInput(e.target.value)} 
                placeholder="Contoh: TYO-1721724000001" 
                className="w-full rounded-xl border-gray-200 h-14 px-4 text-lg focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 shadow-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                Masukkan ID pesanan lengkap atau hanya angka setelah TYO-
              </p>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
            >
              <Search size={20} />
              Lacak Pesanan
            </button>
          </form>
        </div>

        {/* Pesan Pencarian */}
        {searchMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center shadow-sm">
            <FileText className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="font-medium">{searchMessage}</p>
          </div>
        )}

        {/* Hasil Pencarian */}
        {foundOrder && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Detail Pesanan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">ID Pesanan:</span>
                <span className="font-mono font-semibold text-gray-900">{foundOrder.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Nama:</span>
                <span className="font-semibold text-gray-900">{foundOrder.customer.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-semibold text-gray-900">
                  {foundOrder.orderDate.toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Status:</span>
                <span className={getStatusChip(foundOrder.status)}>{foundOrder.status}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Items Pesanan</h3>
              {foundOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="font-semibold text-gray-800">{item.name} x {item.qty}</span>
                    {item.toppings && item.toppings.length > 0 && (
                      <p className="text-xs text-indigo-600 mt-1">
                        Topping: {item.toppings.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              ))}
              
              <div className="flex justify-between items-center font-black text-xl mt-4 pt-4 border-t-2 border-gray-200">
                <span className="text-gray-800">Total</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(foundOrder.total)}
                </span>
              </div>
            </div>

            {foundOrder.paymentMethod && (
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Metode Pembayaran:</span>{' '}
                  <span className="font-bold text-gray-800 capitalize">
                    {foundOrder.paymentMethod === 'gopay' ? 'GoPay' : 'COD (Cash on Delivery)'}
                  </span>
                </p>
                {foundOrder.deliveryInfo && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold">Jadwal Pengiriman:</span>{' '}
                    <span className="font-bold text-gray-800">
                      {new Date(foundOrder.deliveryInfo.date).toLocaleDateString('id-ID')} - {foundOrder.deliveryInfo.time}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionSearchPage;