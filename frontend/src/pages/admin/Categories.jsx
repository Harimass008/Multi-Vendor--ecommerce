import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', isActive: true });

  const fetchCats = () => adminAPI.getCategories().then(r => setCategories(r.data.data.categories));
  useEffect(() => { fetchCats(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createCategory(form);
      toast.success('Category created!');
      setForm({ name: '', description: '' });
      fetchCats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, description: cat.description, isActive: cat.isActive });
  };

  const handleUpdate = async (id) => {
    try {
      await adminAPI.updateCategory(id, editForm);
      toast.success('Category updated!');
      setEditingId(null);
      fetchCats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success('Category deleted!');
      fetchCats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiPlus className="text-primary" /> Create Category</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} className="input resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Create Category'}</button>
          </form>
        </div>

        {/* List */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">All Categories ({categories.length})</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {categories.map(c => (
              <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                {editingId === c._id ? (
                  <div className="flex-1 space-y-2">
                    <input type="text" className="input text-sm" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                    <textarea rows={1} className="input text-sm resize-none" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm(p => ({ ...p, isActive: e.target.checked }))} />
                      Active
                    </label>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-sm text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.slug}</p>
                    {c.description && <p className="text-xs text-gray-500 mt-1">{c.description}</p>}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {editingId === c._id ? (
                    <>
                      <button onClick={() => handleUpdate(c._id)} className="text-green-600 hover:text-green-800">
                        <FiCheck size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800">
                        <FiX size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(c._id, c.name)} className="text-red-600 hover:text-red-800">
                        <FiTrash2 size={16} />
                      </button>
                    </>
                  )}
                  <span className={c.isActive ? 'badge-approved' : 'badge-rejected'}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
