import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getMyProducts();
      setProducts(res.data.data.products);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await productAPI.delete(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (_) { toast.error('Failed to delete'); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products</p>
        </div>
        <Link to="/vendor/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      <div className="card">
        {/* Search */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
          <input type="text" placeholder="Search products..." className="input pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No products found.</p>
            <Link to="/vendor/products/new" className="text-primary hover:underline text-sm mt-2 block">+ Add your first product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Rating</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url || '/placeholder.png'} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                        <span className="font-medium text-gray-800 max-w-xs truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500">{p.category?.name}</td>
                    <td className="py-3">
                      <span className="font-bold text-primary">₹{p.discountedPrice.toLocaleString()}</span>
                      {p.discountPercentage > 0 && <span className="text-xs text-gray-400 ml-1 line-through">₹{p.price.toLocaleString()}</span>}
                    </td>
                    <td className="py-3">
                      <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {p.stock === 0 ? 'Out of stock' : p.stock}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">⭐ {p.rating.toFixed(1)}</td>
                    <td className="py-3">
                      <span className={p.isActive ? 'badge-approved' : 'badge-rejected'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/vendor/products/edit/${p._id}`} className="text-blue-500 hover:text-blue-700 p-1">
                          <FiEdit2 size={15} />
                        </Link>
                        <button onClick={() => handleDelete(p._id, p.name)} className="text-red-400 hover:text-red-600 p-1">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
