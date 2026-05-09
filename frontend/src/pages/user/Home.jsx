// pages/user/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../../api';
import { useCartStore } from '../../store';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiStar, FiArrowRight } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const result = await addToCart(product._id);
    if (result.success) toast.success('Added to cart!');
    else toast.error(result.message);
  };

  return (
    <Link to={`/products/${product._id}`} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]?.url || '/placeholder.png'} alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            -{product.discountPercentage}%
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{product.vendorId?.storeName}</p>
        <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
          <span className="text-xs text-gray-500">{product.rating.toFixed(1)} ({product.totalReviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-primary">₹{product.discountedPrice.toLocaleString()}</span>
            {product.discountPercentage > 0 && (
              <span className="text-xs text-gray-400 line-through ml-2">₹{product.price.toLocaleString()}</span>
            )}
          </div>
          <button onClick={handleAddToCart} className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getAll({ sort: 'popular', limit: 8 }),
          productAPI.getCategories(),
        ]);
        setFeaturedProducts(prodRes.data.data.products);
        const newRes = await productAPI.getAll({ sort: 'latest', limit: 4 });
        setNewArrivals(newRes.data.data.products);
        setCategories(catRes.data.data.categories);
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-10 text-white">
        <div className="max-w-lg">
          <h1 className="font-display text-4xl font-bold mb-4">Shop from the Best Vendors</h1>
          <p className="text-primary-light mb-6">Discover thousands of products from verified sellers across India.</p>
          <button onClick={() => navigate('/products')} className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
            Shop Now <FiArrowRight />
          </button>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  {cat.image ? <img src={cat.image} alt={cat.name} className="w-8 h-8 object-cover rounded-full" />
                    : <span className="text-2xl">🛍️</span>}
                </div>
                <p className="text-sm font-medium text-gray-700">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-800">Popular Products</h2>
          <Link to="/products?sort=popular" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-gray-800">New Arrivals</h2>
            <Link to="/products?sort=latest" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Vendor CTA */}
      <section className="bg-dark text-white rounded-2xl p-8 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">Want to Sell on ShopHub?</h2>
        <p className="text-gray-400 mb-6">Join thousands of vendors and grow your business.</p>
        <Link to="/vendor/register" className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors inline-block">
          Start Selling
        </Link>
      </section>
    </div>
  );
}

export { ProductCard };
