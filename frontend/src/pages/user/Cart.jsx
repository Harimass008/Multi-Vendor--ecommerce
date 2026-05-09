import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem, isLoading } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />)}
    </div>
  );

  if (!cart || cart.items.length === 0) return (
    <div className="text-center py-20">
      <FiShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
      <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Add items to continue shopping</p>
      <Link to="/products" className="btn-primary inline-flex items-center gap-2">Browse Products <FiArrowRight /></Link>
    </div>
  );

  // Group by vendor
  const vendorGroups = cart.items.reduce((acc, item) => {
    const vid = item.vendorId?._id || item.vendorId;
    if (!acc[vid]) acc[vid] = { name: item.vendorId?.storeName || 'Vendor', items: [] };
    acc[vid].items.push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">Shopping Cart ({cart.totalItems} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(vendorGroups).map(([vid, group]) => (
            <div key={vid} className="card">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 border-b pb-2">🏪 {group.name}</p>
              <div className="space-y-4">
                {group.items.map(item => (
                  <div key={item._id} className="flex gap-4">
                    <Link to={`/products/${item.productId?._id || item.productId}`}>
                      <img
                        src={item.productId?.images?.[0]?.url || '/placeholder.png'}
                        alt={item.productId?.name}
                        className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.productId?._id || item.productId}`}>
                        <p className="font-medium text-gray-800 text-sm line-clamp-2 hover:text-primary">{item.productId?.name || 'Product'}</p>
                      </Link>
                      <p className="text-primary font-bold mt-1">₹{item.discountedPrice.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateItem(item.productId?._id || item.productId, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.productId?._id || item.productId, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-gray-700">₹{(item.discountedPrice * item.quantity).toLocaleString()}</p>
                          <button onClick={() => removeItem(item.productId?._id || item.productId)} className="text-red-400 hover:text-red-600 transition-colors">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>₹{cart.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-base">
                <span>Total</span>
                <span className="text-primary">₹{cart.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              Proceed to Checkout <FiArrowRight />
            </button>
            <Link to="/products" className="block text-center text-sm text-primary mt-3 hover:underline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
