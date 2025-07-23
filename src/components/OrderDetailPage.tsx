import React from 'react';
import { CheckCircle, AlertCircle, CreditCard, MapPin, Clock } from 'lucide-react';
import { getStatusChip, formatCurrency } from '../utils/helpers';

const OrderDetailPage = ({ orderId, orders, onBack }) => {
  const order = orders.find(o => o.numericId === orderId);
  
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Maaf, pesanan yang Anda cari tidak dapat ditemukan.</p>
          <button 
            onClick={onBack} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Kembali ke Toko
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Pesanan <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Berhasil</span> Dibuat!
            </h1>
            <p className="text-gray-600 text-lg">Terima kasih telah berbelanja di KulinerPro</p>
            <p className="text-gray-600 text-lg">Terima kasih telah berbelanja di ArTyra 354</p>
          </div>

          {/* Detail Pesanan */}
          <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 rounded-xl mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">No. Pesanan:</span>
                <span className="font-mono text-gray-900 bg-white px-3 py-1 rounded-lg text-sm">
                  {order.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Status:</span>
                <span className={getStatusChip(order.status)}>{order.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Tanggal:</span>
                <span className="text-gray-900">{order.orderDate.toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Pembeli:</span>
                <span className="text-gray-900">{order.customer.name}</span>
              </div>
            </div>
          </div>

          {/* Informasi Pembayaran */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
              <CreditCard className="mr-2" size={20} />
              Informasi Pembayaran
            </h3>
            
            {order.paymentMethod === 'gopay' ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                    <CreditCard size={20} className="text-white" />
                  </div>
                  <span className="font-bold text-green-800 text-lg">Pembayaran GoPay</span>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <p>Transfer ke nomor: <span className="font-mono bg-white px-2 py-1 rounded font-bold text-green-800">085216467520</span></p>
                  <p>Jumlah transfer: <span className="font-bold">{formatCurrency(order.total)}</span></p>
                  <p className="text-green-600 font-medium">Silakan lakukan pembayaran dan simpan bukti transfer</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <span className="font-bold text-orange-800 text-lg">Cash on Delivery (COD)</span>
                </div>
                {order.deliveryInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-700">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      <span>
                        Tanggal: <span className="font-bold">
                          {new Date(order.deliveryInfo.date).toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      <span>Jam: <span className="font-bold">{order.deliveryInfo.time}</span></span>
                    </div>
                  </div>
                )}
                <p className="text-orange-600 font-medium mt-3">Pembayaran dilakukan saat pesanan diantar</p>
              </div>
            )}
          </div>

          {/* Ringkasan Pesanan */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Ringkasan Pesanan</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
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
            </div>
            
            <div className="flex justify-between items-center font-black text-xl mt-6 pt-6 border-t-2 border-gray-200">
              <span className="text-gray-800">Total Pembayaran</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
              <h4 className="font-semibold text-yellow-800 mb-2">Catatan:</h4>
              <p className="text-yellow-700">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={onBack} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Kembali ke Toko
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;