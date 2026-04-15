import { useEffect, useState } from 'react';
import { ClipboardList, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { supabase, Order } from '../lib/supabase';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Pending' },
  accepted: { icon: CheckCircle, color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Accepted' },
  rejected: { icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', label: 'Rejected' },
  delivered: { icon: Truck, color: 'text-green-600 bg-green-50 border-green-200', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'Cancelled' },
};

export default function OrderManagement() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (profile?.id) fetchOrders();
  }, [profile]);

  async function fetchOrders() {
    setLoading(true);
    const field = profile?.role === 'farmer' ? 'farmer_id' : 'merchant_id';
    const { data } = await supabase
      .from('orders')
      .select('*, products(name, unit, images, price), profiles!merchant_id(full_name, phone), profiles!farmer_id(full_name, phone)')
      .eq(field, profile!.id)
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: string) {
    const { data } = await supabase.from('orders').update({ status, updated_at: new Date() }).eq('id', orderId).select().maybeSingle();
    if (data) setOrders(os => os.map(o => o.id === orderId ? { ...o, status: data.status } : o));
  }

  const statuses = ['all', 'pending', 'accepted', 'delivered', 'rejected', 'cancelled'];
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const isFarmer = profile?.role === 'farmer';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{isFarmer ? 'Incoming Orders' : 'My Orders'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isFarmer ? 'Manage orders from merchants' : 'Track your purchase orders'}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {(['pending', 'accepted', 'delivered', 'rejected'] as const).map(status => {
            const count = orders.filter(o => o.status === status).length;
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`bg-white rounded-2xl border p-4 text-left transition-all hover:shadow-sm
                  ${filter === status ? 'ring-2 ring-green-400 border-green-200' : 'border-gray-100'}`}
              >
                <Icon className={`h-4 w-4 mb-2 ${config.color.split(' ')[0]}`} />
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 capitalize">{status}</p>
              </button>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize
                ${filter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No {filter !== 'all' ? filter : ''} orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const config = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
              const Icon = config.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          {(order as any).products?.images?.[0] ? (
                            <img src={(order as any).products.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{(order as any).products?.name}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {order.quantity} {(order as any).products?.unit} · ETB {order.total_price.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 capitalize">
                            Payment: {order.payment_method.replace('_', ' ')}
                          </p>
                          {isFarmer ? (
                            <p className="text-xs text-gray-500 mt-1">
                              Buyer: {(order as any).profiles?.full_name} · {(order as any).profiles?.phone}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-1">
                              Farmer: {(order as any)['profiles!farmer_id']?.full_name || 'Farmer'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>

                        {isFarmer && order.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(order.id, 'accepted')}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-all"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, 'rejected')}
                              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {isFarmer && order.status === 'accepted' && (
                          <button
                            onClick={() => updateStatus(order.id, 'delivered')}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all"
                          >
                            Mark Delivered
                          </button>
                        )}

                        {!isFarmer && order.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(order.id, 'cancelled')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
                        {order.notes}
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-50">
                    <p className="text-xs text-gray-400">
                      Ordered: {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
