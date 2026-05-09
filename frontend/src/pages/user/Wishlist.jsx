import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../../api';
import { useCartStore } from '../../store';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    wishlistAPI.get().then(r => { setProducts(r.data.data.wishlist.products || []); setLoading(false); });
  }, []);

  const handleRemove = async (productId) => {
    await wishlistAPI.toggle(productId);
    setProducts(prev => prev.filter(p => p._id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId);
    if (result.success) toast.success('Added to cart!');
    else toast.error(result.message);
  };

  if (loading) return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />)}</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FiHeart className="text-red-500 fill-red-500" /> Wishlist ({products.length})
      </h1>
      {products.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="font-display text-xl font-bold text-gray-600 mb-2">Your wishlist is empty</h2>
          <Link to="/products" className="btn-primary inline-block mt-4">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
              <Link to={`/products/${p._id}`} className="block relative overflow-hidden">
                <img src={p.images?.[0]?.url || '/placeholder.png'} alt={p.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="p-3">
                <Link to={`/products/${p._id}`}>
                  <p className="font-medium text-gray-800 text-sm line-clamp-2 hover:text-primary">{p.name}</p>
                </Link>
                <p className="text-primary font-bold mt-1">₹{p.discountedPrice?.toLocaleString()}</p>
                {p.price !== p.discountedPrice && (
                  <p className="text-xs text-gray-400 line-through">₹{p.price?.toLocaleString()}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAddToCart(p._id)} className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1">
                    <FiShoppingCart size={13} /> Add to Cart
                  </button>
                  <button onClick={() => handleRemove(p._id)} className="p-1.5 text-red-400 hover:text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
