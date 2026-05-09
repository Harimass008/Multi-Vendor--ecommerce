import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiPlus, FiMinus } from 'react-icons/fi';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPercentage: '0',
    stock: '', category: '', tags: '', isActive: true,
  });

  useEffect(() => {
    productAPI.getCategories().then(r => setCategories(r.data.data.categories));
    if (isEdit) {
      productAPI.getById(id).then(r => {
        const p = r.data.data.product;
        setForm({
          name: p.name, description: p.description, price: p.price,
          discountPercentage: p.discountPercentage, stock: p.stock,
          category: p.category?._id || p.category, tags: p.tags?.join(', ') || '',
          isActive: p.isActive,
        });
        setSpecs(p.specifications?.length ? p.specifications : [{ key: '', value: '' }]);
        setImagePreviews(p.images?.map(i => i.url) || []);
      });
    }
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (idx) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags') return;
        fd.append(k, v);
      });
      fd.append('specifications', JSON.stringify(specs.filter(s => s.key)));
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      imageFiles.forEach(f => fd.append('images', f));

      if (isEdit) await productAPI.update(id, fd);
      else await productAPI.create(fd);

      toast.success(`Product ${isEdit ? 'updated' : 'created'}!`);
      navigate('/vendor/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button onClick={() => navigate('/vendor/products')} className="text-sm text-primary hover:underline mb-2 block">← Back</button>
        <h1 className="font-display text-2xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input type="text" className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea rows={4} className="input resize-none" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input type="text" className="input" placeholder="e.g. electronics, gadget, wireless" value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Pricing & Stock</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input type="number" min="0" className="input" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input type="number" min="0" max="100" className="input" value={form.discountPercentage} onChange={e => setForm(p => ({...p, discountPercentage: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input type="number" min="0" className="input" value={form.stock} onChange={e => setForm(p => ({...p, stock: e.target.value}))} required />
            </div>
          </div>
          {form.price && form.discountPercentage > 0 && (
            <p className="text-sm text-green-600">Final price: ₹{Math.round(form.price - (form.price * form.discountPercentage / 100)).toLocaleString()}</p>
          )}
        </div>

        {/* Images */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Product Images</h2>
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <FiX size={10} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <FiUpload size={18} className="text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Upload</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <p className="text-xs text-gray-400">Max 5 images, 5MB each</p>
        </div>

        {/* Specifications */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Specifications (optional)</h2>
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Key (e.g. Color)" className="input text-sm" value={spec.key} onChange={e => { const s = [...specs]; s[i].key = e.target.value; setSpecs(s); }} />
                <input type="text" placeholder="Value" className="input text-sm" value={spec.value} onChange={e => { const s = [...specs]; s[i].value = e.target.value; setSpecs(s); }} />
                {specs.length > 1 && (
                  <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="text-red-400">
                    <FiMinus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])} className="text-sm text-primary hover:underline flex items-center gap-1">
            <FiPlus size={14} /> Add specification
          </button>
        </div>

        {/* Status */}
        <div className="card flex items-center gap-3">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({...p, isActive: e.target.checked}))} className="w-4 h-4" />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Product is active (visible to customers)</label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/vendor/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
