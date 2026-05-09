import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store';
import { vendorAPI } from '../../api';
import toast from 'react-hot-toast';

export default function VendorProfile() {
  const { vendor, updateVendor } = useAuthStore();
  const [form, setForm] = useState({
    storeName: vendor?.storeName || '',
    storeDescription: vendor?.storeDescription || '',
    phone: vendor?.phone || '',
    gstNumber: vendor?.gstNumber || '',
    address: { street: vendor?.address?.street || '', city: vendor?.address?.city || '', state: vendor?.address?.state || '', pincode: vendor?.address?.pincode || '' },
    bankDetails: { accountNumber: vendor?.bankDetails?.accountNumber || '', ifscCode: vendor?.bankDetails?.ifscCode || '', bankName: vendor?.bankDetails?.bankName || '', accountHolderName: vendor?.bankDetails?.accountHolderName || '' },
  });

  useEffect(() => {
    setForm({
      storeName: vendor?.storeName || '',
      storeDescription: vendor?.storeDescription || '',
      phone: vendor?.phone || '',
      gstNumber: vendor?.gstNumber || '',
      address: {
        street: vendor?.address?.street || '',
        city: vendor?.address?.city || '',
        state: vendor?.address?.state || '',
        pincode: vendor?.address?.pincode || '',
      },
      bankDetails: {
        accountNumber: vendor?.bankDetails?.accountNumber || '',
        ifscCode: vendor?.bankDetails?.ifscCode || '',
        bankName: vendor?.bankDetails?.bankName || '',
        accountHolderName: vendor?.bankDetails?.accountHolderName || '',
      },
    });
  }, [vendor]);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await vendorAPI.updateProfile(form);
      updateVendor(res.data.data.vendor);
      toast.success('Profile updated!');
    } catch (_) { toast.error('Failed to update'); }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">Store Profile</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Store Information</h2>
          {[
            { label: 'Store Name', key: 'storeName', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'tel' },
            { label: 'GST Number', key: 'gstNumber', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} className="input" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea rows={3} className="input resize-none" value={form.storeDescription} onChange={e => setForm(p => ({ ...p, storeDescription: e.target.value }))} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Business Address</h2>
          <div className="grid grid-cols-2 gap-3">
            {['street', 'city', 'state', 'pincode'].map(k => (
              <div key={k} className={k === 'street' ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{k}</label>
                <input type="text" className="input" value={form.address[k]} onChange={e => setForm(p => ({ ...p, address: { ...p.address, [k]: e.target.value } }))} />
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Bank Details</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Account Holder Name', key: 'accountHolderName', col: 2 },
              { label: 'Account Number', key: 'accountNumber', col: 1 },
              { label: 'IFSC Code', key: 'ifscCode', col: 1 },
              { label: 'Bank Name', key: 'bankName', col: 2 },
            ].map(({ label, key, col }) => (
              <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="text" className="input" value={form.bankDetails[key]} onChange={e => setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, [key]: e.target.value } }))} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
