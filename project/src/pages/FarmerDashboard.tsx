import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, ClipboardList, TrendingUp, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { supabase, Product, Order } from '../lib/supabase';

export default function FarmerDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile]);

  async function fetchData() {
    setLoading(true);
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from('products').select('*').eq('farmer_id', profile!.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, products(name, unit, images), profiles!merchant_id(full_name, phone)').eq('farmer_id', profile!.id).order('created_at', { ascending: false }),
    ]);
    setProducts(prods || []);
    setOrders((ords as Order[]) || []);
    setLoading(false);
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return;
    await supabase.from('products').delete().eq('id', product.id);
    setProducts(ps => ps.filter(p => p.id !== product.id));
  }

  async function handleOrderStatus(orderId: string, status: string) {
    const { data } = await supabase.from('orders').update({ status }).eq('id', orderId).select().maybeSingle();
    if (data) setOrders(os => os.map(o => o.id === orderId ? { ...o, status: data.status } : o));
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeProducts = products.filter(p => p.status === 'active');
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total_price, 0);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {profile?.full_name?.split(' ')[0]}
            </h1>
            <p className="text-gray-500 mt-1">Manage your products and incoming orders</p>
          </div>
          <button
            onClick={() => navigate('/farmer/products/new')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-100"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Products', value: activeProducts.length, icon: Package, color: 'text-green-600 bg-green-50' },
            { label: 'Pending Orders', value: pendingOrders.length, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
            { label: 'Total Orders', value: orders.length, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[
            { key: 'products', label: `Products (${products.length})` },
            { key: 'orders', label: `Orders (${orders.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'products' | 'orders')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : activeTab === 'products' ? (
          products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <h3 className="text-gray-600 font-semibold mb-2">No products yet</h3>
              <p className="text-gray-400 text-sm mb-4">Start by adding your first product to the marketplace</p>
              <button
                onClick={() => navigate('/farmer/products/new')}
                className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-700 transition-all"
              >
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showActions
                  onEdit={() => navigate(`/farmer/products/${p.id}/edit`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No orders received yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {(order as any).products?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {order.quantity} {(order as any).products?.unit} · ETB {order.total_price.toLocaleString()} · {order.payment_method.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Buyer: {(order as any).profiles?.full_name} · {(order as any).profiles?.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOrderStatus(order.id, 'accepted')}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-all"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleOrderStatus(order.id, 'rejected')}
                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleOrderStatus(order.id, 'delivered')}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                  {order.notes && (
                    <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
                      Note: {order.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
