import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI } from '../../api';
import { useCartStore } from '../../store';
import toast from 'react-hot-toast';
import { FiFilter, FiShoppingCart, FiStar, FiX, FiChevronDown } from 'react-icons/fi';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { addToCart } = useCartStore();

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page') || 1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ q, category, sort, minPrice, maxPrice, page, limit: 12 });
      setProducts(res.data.data.products);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
    } catch (_) {}
    setLoading(false);
  }, [q, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    productAPI.getCategories().then(r => setCategories(r.data.data.categories));
  }, []);

  const updateParam = (key, val) => {
    const params = Object.fromEntries(searchParams);
    if (val) params[key] = val; else delete params[key];
    params.page = '1';
    setSearchParams(params);
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    const result = await addToCart(productId);
    if (result.success) toast.success('Added to cart!');
    else toast.error(result.message);
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar Filters */}
      <aside className={`w-64 shrink-0 ${filtersOpen ? 'block' : 'hidden md:block'}`}>
        <div className="card sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filters</h3>
            <button onClick={() => setSearchParams({})} className="text-xs text-primary hover:underline">Clear All</button>
          </div>

          {/* Category */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => updateParam('category', '')}
                  className={`text-sm w-full text-left px-2 py-1 rounded ${!category ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'}`}
                >
                  All Categories
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat._id}>
                  <button
                    onClick={() => updateParam('category', cat._id)}
                    className={`text-sm w-full text-left px-2 py-1 rounded ${category === cat._id ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
            <div className="flex gap-2">
              <input
                type="number" placeholder="Min" className="input text-sm"
                value={minPrice} onChange={e => updateParam('minPrice', e.target.value)}
              />
              <input
                type="number" placeholder="Max" className="input text-sm"
                value={maxPrice} onChange={e => updateParam('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Min Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2].map(r => (
                <button
                  key={r}
                  onClick={() => updateParam('rating', r)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary w-full"
                >
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={14} className={i < r ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                  <span>& above</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Products */}
      <div className="flex-1">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden flex items-center gap-2 text-sm border border-gray-300 px-3 py-2 rounded-lg">
              <FiFilter size={16} /> Filters
            </button>
            <p className="text-sm text-gray-500">
              {q && <span className="mr-2">Results for "<strong>{q}</strong>"</span>}
              <span>{total} products</span>
            </p>
          </div>
          <select
            className="input text-sm w-auto"
            value={sort}
            onChange={e => updateParam('sort', e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Active Filters */}
        {(q || category || minPrice || maxPrice) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {q && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
              Search: {q} <button onClick={() => updateParam('q', '')}><FiX size={12} /></button>
            </span>}
            {category && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
              Category <button onClick={() => updateParam('category', '')}><FiX size={12} /></button>
            </span>}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-700 text-lg">No products found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <Link key={product._id} to={`/products/${product._id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="relative overflow-hidden">
                  <img
                    src={product.images[0]?.url || '/placeholder.png'} alt={product.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discountPercentage > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 truncate">{product.vendorId?.storeName}</p>
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mt-0.5 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-primary text-sm">₹{product.discountedPrice.toLocaleString()}</span>
                      {product.discountPercentage > 0 && (
                        <span className="text-xs text-gray-400 line-through ml-1">₹{product.price.toLocaleString()}</span>
                      )}
                    </div>
                    <button onClick={(e) => handleAddToCart(e, product._id)}
                      className="bg-primary/10 text-primary p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">
                      <FiShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => updateParam('page', i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1 ? 'bg-primary text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-primary'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
