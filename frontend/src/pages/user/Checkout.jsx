import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../../store';
import { orderAPI, paymentAPI, couponAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiTag, FiCheck } from 'react-icons/fi';

export default function Checkout() {
  const { cart, fetchCart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('mock');
  const [useNewAddress, setUseNewAddress] = useState(true);

  useEffect(() => {
    fetchCart();
    if (user?.addresses?.length) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(def);
      setUseNewAddress(false);
    }
  }, []);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate({ code: coupon, orderAmount: cart.totalAmount });
      setCouponData(res.data.data);
      toast.success(`Coupon applied! Save ₹${res.data.data.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    }
    setCouponLoading(false);
  };

  const finalTotal = cart ? cart.totalAmount - (couponData?.discountAmount || 0) : 0;

  const handlePlaceOrder = async () => {
    const address = useNewAddress ? newAddress : selectedAddress;
    if (!address?.street || !address?.city || !address?.pincode) {
      toast.error('Please fill in delivery address'); return;
    }
    setLoading(true);
    try {
      const res = await orderAPI.create({
        shippingAddress: address,
        paymentMethod,
        couponCode: couponData ? coupon : undefined,
      });
      const order = res.data.data.order;

      if (paymentMethod === 'mock') {
        // Mock payment verify
        await paymentAPI.verify({ orderId: order._id, paymentId: 'MOCK-' + Date.now() });
        toast.success('Order placed successfully! 🎉');
        navigate(`/orders/${order._id}`);
      } else {
        toast.success('Order created! Redirecting to payment...');
        navigate(`/orders/${order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  if (!cart || cart.items.length === 0) {
    navigate('/cart'); return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Delivery Address</h2>

            {/* Saved addresses */}
            {user?.addresses?.length > 0 && (
              <div className="space-y-3 mb-4">
                {user.addresses.map(addr => (
                  <label key={addr._id} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${!useNewAddress && selectedAddress?._id === addr._id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <input type="radio" name="address" checked={!useNewAddress && selectedAddress?._id === addr._id}
                      onChange={() => { setSelectedAddress(addr); setUseNewAddress(false); }} className="mt-1" />
                    <div className="text-sm">
                      <p className="font-medium">{addr.label} {addr.isDefault && <span className="text-xs text-primary">(Default)</span>}</p>
                      <p className="text-gray-600">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}
                <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${useNewAddress ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                  <input type="radio" name="address" checked={useNewAddress} onChange={() => setUseNewAddress(true)} />
                  <span className="text-sm font-medium">+ Add new address</span>
                </label>
              </div>
            )}

            {(useNewAddress || !user?.addresses?.length) && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name', key: 'name', col: 2 },
                  { label: 'Phone', key: 'phone', col: 1 },
                  { label: 'Street Address', key: 'street', col: 2 },
                  { label: 'City', key: 'city', col: 1 },
                  { label: 'State', key: 'state', col: 1 },
                  { label: 'Pincode', key: 'pincode', col: 1 },
                ].map(({ label, key, col }) => (
                  <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text" className="input"
                      value={newAddress[key]}
                      onChange={e => setNewAddress(p => ({...p, [key]: e.target.value}))}
                      required
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { value: 'mock', label: 'Mock Payment (Testing)', desc: 'Instant order confirmation' },
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === opt.value ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                  <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-24 space-y-4">
            <h2 className="font-semibold text-gray-800">Order Summary</h2>

            {/* Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.items.map(item => (
                <div key={item._id} className="flex gap-2 text-xs text-gray-600">
                  <img src={item.productId?.images?.[0]?.url || '/placeholder.png'} alt="" className="w-10 h-10 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.productId?.name}</p>
                    <p className="text-gray-800 font-medium">₹{item.discountedPrice} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text" placeholder="Coupon code" className="input text-sm flex-1"
                  value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                />
                <button onClick={applyCoupon} disabled={couponLoading} className="btn-primary text-sm px-3">
                  <FiTag size={16} />
                </button>
              </div>
              {couponData && (
                <div className="flex items-center gap-2 text-green-600 text-xs mt-2">
                  <FiCheck size={14} /> Saving ₹{couponData.discountAmount}
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm border-t pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{cart.totalAmount.toLocaleString()}</span>
              </div>
              {couponData && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-₹{couponData.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span><span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
                <span>Total</span><span className="text-primary">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full">
              {loading ? 'Placing Order...' : `Place Order · ₹${finalTotal.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
