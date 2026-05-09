// pages/admin/Users.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiSearch, FiUserX, FiUserCheck } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getUsers({ search }).then(r => { setUsers(r.data.data.users); setLoading(false); });
  };
  useEffect(() => { fetchUsers(); }, [search]);

  const handleBan = async (id, name, isBanned) => {
    if (!window.confirm(`${isBanned ? 'Unban' : 'Ban'} ${name}?`)) return;
    try {
      await adminAPI.banUser(id);
      setUsers(prev => prev.map(u => u._id === id ? {...u, isBanned: !u.isBanned} : u));
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'}`);
    } catch (_) { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">Users Management</h1>
      <div className="card">
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
          <input type="text" placeholder="Search users..." className="input pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center">
                          {u.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3 text-gray-500">{u.phone || '-'}</td>
                    <td className="py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={u.isBanned ? 'badge-rejected' : 'badge-approved'}>
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => handleBan(u._id, u.name, u.isBanned)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${u.isBanned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                        {u.isBanned ? <><FiUserCheck size={12} /> Unban</> : <><FiUserX size={12} /> Ban</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center text-gray-400 py-8">No users found</p>}
          </div>
        )}
      </div>
    </div>
  );
}
