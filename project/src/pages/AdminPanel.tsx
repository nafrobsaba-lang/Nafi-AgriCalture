import { useEffect, useState } from 'react';
import { Users, Package, ShoppingBag, TrendingUp, Tractor, ShoppingCart, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { supabase, Profile, Product, Order } from '../lib/supabase';

export default function AdminPanel() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'products' | 'orders'>('overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [{ data: u }, { data: p }, { data: o }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*, profiles!farmer_id(full_name)').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, products(name), profiles!merchant_id(full_name)').order('created_at', { ascending: false }),
    ]);
    setUsers(u || []);
    setProducts((p as Product[]) || []);
    setOrders((o as Order[]) || []);
    setLoading(false);
  }

  async function toggleProductStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { data } = await supabase.from('products').update({ status: newStatus }).eq('id', id).select().maybeSingle();
    if (data) setProducts(ps => ps.map(p => p.id === id ? { ...p, status: data.status } : p));
  }

  const farmers = users.filter(u => u.role === 'farmer');
  const merchants = users.filter(u => u.role === 'merchant');
  const activeProducts = products.filter(p => p.status === 'active');
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total_price, 0);

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.region.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50',
    accepted: 'text-blue-600 bg-blue-50',
    rejected: 'text-red-600 bg-red-50',
    delivered: 'text-green-600 bg-green-50',
    cancelled: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the entire NafrobMarket platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit flex-wrap">
          {(['overview', 'users', 'products', 'orders'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: users.length, icon: Users, sub: `${farmers.length} farmers, ${merchants.length} merchants`, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Active Products', value: activeProducts.length, icon: Package, sub: `${products.length} total listings`, color: 'bg-green-50 text-green-600' },
                    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, sub: `${orders.filter(o => o.status === 'pending').length} pending`, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Revenue Delivered', value: `ETB ${(totalRevenue / 1000).toFixed(1)}K`, icon: TrendingUp, sub: `${orders.filter(o => o.status === 'delivered').length} completed`, color: 'bg-emerald-50 text-emerald-600' },
                  ].map(({ label, value, icon: Icon, sub, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-sm text-gray-700 font-medium mt-0.5">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">User Distribution</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Farmers', count: farmers.length, icon: Tractor, color: 'bg-green-100 text-green-700' },
                        { label: 'Merchants', count: merchants.length, icon: ShoppingCart, color: 'bg-blue-100 text-blue-700' },
                      ].map(({ label, count, icon: Icon, color }) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${color}`}><Icon className="h-4 w-4" /></div>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 font-medium">{label}</span>
                              <span className="text-gray-500">{count}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${label === 'Farmers' ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${users.length ? (count / users.length) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 4).map(order => (
                        <div key={order.id} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium text-gray-800">{(order as any).products?.name}</p>
                            <p className="text-xs text-gray-400">{(order as any).profiles?.full_name}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div>
                <div className="relative mb-5">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm max-w-md"
                  />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Name</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Role</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Region</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Phone</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                                  {u.full_name?.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-800">{u.full_name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                                ${u.role === 'farmer' ? 'bg-green-100 text-green-700' : u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-600">{u.region}</td>
                            <td className="px-5 py-4 text-gray-600">{u.phone}</td>
                            <td className="px-5 py-4 text-gray-400">
                              {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'products' && (
              <div>
                <div className="relative mb-5">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm max-w-md"
                  />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Product</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Farmer</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Category</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Price</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                          <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 font-medium text-gray-800">{p.name}</td>
                            <td className="px-5 py-4 text-gray-600">{(p as any).profiles?.full_name}</td>
                            <td className="px-5 py-4 capitalize text-gray-600">{p.category}</td>
                            <td className="px-5 py-4 text-gray-800">ETB {p.price.toLocaleString()}/{p.unit}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => toggleProductStatus(p.id, p.status)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all
                                  ${p.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                              >
                                {p.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Product</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Merchant</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Quantity</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Total</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Payment</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 font-medium text-gray-800">{(o as any).products?.name}</td>
                          <td className="px-5 py-4 text-gray-600">{(o as any).profiles?.full_name}</td>
                          <td className="px-5 py-4 text-gray-600">{o.quantity}</td>
                          <td className="px-5 py-4 font-semibold text-gray-800">ETB {o.total_price.toLocaleString()}</td>
                          <td className="px-5 py-4 capitalize text-gray-600">{o.payment_method.replace('_', ' ')}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[o.status]}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-400">
                            {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
