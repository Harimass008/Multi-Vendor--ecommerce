import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiSlash, FiTrash2 } from 'react-icons/fi';

export default function AdminVendors() {
  const [searchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [noteMap, setNoteMap] = useState({});

  const fetchVendors = () => {
    setLoading(true);
    adminAPI.getVendors({ status: statusFilter }).then(r => { setVendors(r.data.data.vendors); setLoading(false); });
  };
  useEffect(() => { fetchVendors(); }, [statusFilter]);

  const handleApprove = async (id, action) => {
    const note = noteMap[id] || '';
    if (action === 'reject' && !note) { toast.error('Please add a rejection reason'); return; }
    try {
      await adminAPI.approveVendor(id, { action, note });
      toast.success(`Vendor ${action === 'approve' ? 'approved' : 'rejected'}!`);
      fetchVendors();
    } catch (_) { toast.error('Failed'); }
  };

  const handleBan = async (id, action) => {
    try {
      await adminAPI.banVendor(id, action);
      toast.success(`Vendor ${action === 'ban' ? 'banned' : 'unbanned'}!`);
      fetchVendors();
    } catch (_) { toast.error('Failed'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteVendor(id);
      toast.success('Vendor deleted!');
      fetchVendors();
    } catch (_) { toast.error('Failed'); }
  };

  const statusColors = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', banned: 'badge-rejected' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-800">Vendors Management</h1>
        <select className="input w-auto text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />)}</div>
      ) : vendors.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No vendors found</p>
      ) : (
        <div className="space-y-4">
          {vendors.map(v => (
            <div key={v._id} className="card">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedVendor(expandedVendor === v._id ? null : v._id)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 font-bold flex items-center justify-center">
                    {v.storeName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{v.storeName}</p>
                    <p className="text-sm text-gray-400">{v.userId?.name} · {v.userId?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusColors[v.isBanned ? 'banned' : v.approvalStatus]}>
                    {v.isBanned ? 'banned' : v.approvalStatus}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {expandedVendor === v._id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{v.phone || '-'}</p></div>
                    <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{v.email}</p></div>
                    <div><p className="text-gray-500 text-xs">GST</p><p className="font-medium">{v.gstNumber || '-'}</p></div>
                    <div><p className="text-gray-500 text-xs">Total Sales</p><p className="font-bold text-primary">{v.totalSales || 0}</p></div>
                    <div><p className="text-gray-500 text-xs">Revenue</p><p className="font-bold text-green-600">₹{(v.totalRevenue || 0).toLocaleString()}</p></div>
                    <div><p className="text-gray-500 text-xs">Rating</p><p className="font-medium">⭐ {(v.rating || 0).toFixed(1)}</p></div>
                  </div>

                  {v.storeDescription && (
                    <div><p className="text-xs text-gray-500 mb-1">Description</p><p className="text-sm text-gray-700">{v.storeDescription}</p></div>
                  )}

                  {v.approvalNote && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                      <p className="font-medium text-yellow-800">Note: {v.approvalNote}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {v.approvalStatus === 'pending' ? (
                      <>
                        <textarea
                          rows={2} className="input text-sm resize-none"
                          placeholder="Rejection reason (required if rejecting)"
                          value={noteMap[v._id] || ''}
                          onChange={e => setNoteMap(p => ({ ...p, [v._id]: e.target.value }))}
                        />
                        <div className="flex gap-3">
                          <button onClick={() => handleApprove(v._id, 'approve')}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                            <FiCheckCircle size={16} /> Approve
                          </button>
                          <button onClick={() => handleApprove(v._id, 'reject')}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                            <FiXCircle size={16} /> Reject
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => handleBan(v._id, v.isBanned ? 'unban' : 'ban')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${v.isBanned ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-orange-600 text-white hover:bg-orange-700'}`}>
                          <FiSlash size={16} /> {v.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button onClick={() => handleDelete(v._id, v.storeName)}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                          <FiTrash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
