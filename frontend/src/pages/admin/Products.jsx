// pages/admin/Products.jsx
import { useState, useEffect } from 'react';
import { productAPI } from '../../api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getAll({ limit: 50 }).then(r => { setProducts(r.data.data.products); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">All Products</h1>
      <div className="card">
        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Vendor</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img src={p.images?.[0]?.url || '/placeholder.png'} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-medium max-w-xs truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500">{p.vendorId?.storeName}</td>
                    <td className="py-3 text-gray-500">{p.category?.name}</td>
                    <td className="py-3 font-bold text-primary">₹{p.discountedPrice.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={p.stock === 0 ? 'text-red-500 font-medium' : p.stock <= 5 ? 'text-yellow-600 font-medium' : 'text-green-600'}>
                        {p.stock === 0 ? '0 (OOS)' : p.stock}
                      </span>
                    </td>
                    <td className="py-3">⭐ {p.rating.toFixed(1)}</td>
                    <td className="py-3">
                      <span className={p.isActive ? 'badge-approved' : 'badge-rejected'}>{p.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <p className="text-center text-gray-400 py-8">No products</p>}
          </div>
        )}
      </div>
    </div>
  );
}
