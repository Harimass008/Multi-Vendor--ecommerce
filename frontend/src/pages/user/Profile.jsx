// pages/user/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store';
import { userAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiUser, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '', isDefault: false });

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '' });
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch (_) { toast.error('Failed to update'); }
    setSaving(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.addAddress(addrForm);
      updateUser({ ...user, addresses: res.data.data.addresses });
      setAddrForm({ label: 'Home', street: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added!');
    } catch (_) { toast.error('Failed to add address'); }
  };

  const handleRemoveAddress = async (id) => {
    try {
      const res = await userAPI.removeAddress(id);
      updateUser({ ...user, addresses: res.data.data.addresses });
      toast.success('Address removed');
    } catch (_) { }
  };

  const tabs = [{ key: 'profile', label: 'Profile', icon: FiUser }, { key: 'addresses', label: 'Addresses', icon: FiMapPin }];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
            </div>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot change)</label>
              <input type="email" className="input bg-gray-50" value={user?.email} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <input type="text" className="input bg-gray-50" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} disabled />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'addresses' && (
        <div className="space-y-4">
          {user?.addresses?.map(addr => (
            <div key={addr._id} className="card flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{addr.label}</span>
                  {addr.isDefault && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                <p className="text-sm text-gray-600">{addr.state} - {addr.pincode}</p>
              </div>
              <button onClick={() => handleRemoveAddress(addr._id)} className="text-red-400 hover:text-red-600">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiPlus size={16} className="text-primary" /> Add New Address</h3>
            <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                <select className="input text-sm" value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))}>
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              {[
                { label: 'Street', key: 'street', col: 2 },
                { label: 'City', key: 'city', col: 1 },
                { label: 'State', key: 'state', col: 1 },
                { label: 'Pincode', key: 'pincode', col: 1 },
              ].map(({ label, key, col }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" className="input text-sm" value={addrForm[key]} onChange={e => setAddrForm(p => ({ ...p, [key]: e.target.value }))} required />
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="default" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))} />
                <label htmlFor="default" className="text-sm text-gray-600">Set as default</label>
              </div>
              <button type="submit" className="btn-primary text-sm col-span-2">Add Address</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
