import { useEffect, useState } from 'react';
import { Search, Filter, X, Zap, ShoppingCart } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { supabase, Product } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'vegetables', 'fruits', 'grains', 'livestock', 'dairy', 'other'];

const REGIONS = [
  'All Regions', 'Addis Ababa', 'Oromia', 'Amhara', 'SNNPR', 'Tigray',
  'Somali', 'Afar', 'Benishangul-Gumuz', 'Gambela', 'Harari', 'Dire Dawa'
];

interface OrderModal {
  product: Product;
  quantity: number;
  paymentMethod: 'cash' | 'telebirr' | 'bank_transfer';
  notes: string;
}

export default function MerchantMarketplace() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [region, setRegion] = useState('All Regions');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [orderModal, setOrderModal] = useState<OrderModal | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, profiles!farmer_id(full_name, phone, region, avatar_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'All' && p.category !== category) return false;
    if (region !== 'All Regions' && p.region !== region) return false;
    if (urgentOnly && !p.urgent_sale) return false;
    return true;
  });

  async function placeOrder() {
    if (!orderModal || !user) return;
    setOrdering(true);

    const { error } = await supabase.from('orders').insert({
      product_id: orderModal.product.id,
      farmer_id: orderModal.product.farmer_id,
      merchant_id: user.id,
      quantity: orderModal.quantity,
      total_price: orderModal.product.price * orderModal.quantity,
      payment_method: orderModal.paymentMethod,
      notes: orderModal.notes,
      status: 'pending',
    });

    setOrdering(false);
    if (!error) {
      setOrderModal(null);
      setSuccessMsg('Order placed successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce">
          <ShoppingCart className="h-4 w-4" /> {successMsg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Nafrob Agricultural Marketplace</h1>
          <p className="text-gray-500">Browse fresh produce from local farmers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>

            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
                ${urgentOnly ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Zap className="h-4 w-4" /> Urgent Sales
            </button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize
                  ${category === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
          {(search || category !== 'All' || region !== 'All Regions' || urgentOnly) && (
            <button
              onClick={() => { setSearch(''); setCategory('All'); setRegion('All Regions'); setUrgentOnly(false); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Filter className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-gray-600 font-semibold mb-1">No products found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onOrder={p => setOrderModal({ product: p, quantity: 1, paymentMethod: 'cash', notes: '' })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Place Order</h2>
                <button onClick={() => setOrderModal(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-green-50 rounded-2xl p-4 mb-5">
                <h3 className="font-semibold text-green-900">{orderModal.product.name}</h3>
                <p className="text-green-700 text-sm mt-0.5">
                  ETB {orderModal.product.price.toLocaleString()} per {orderModal.product.unit}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Quantity ({orderModal.product.unit})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={orderModal.product.quantity}
                    value={orderModal.quantity}
                    onChange={e => setOrderModal(m => m ? { ...m, quantity: Math.max(1, +e.target.value) } : null)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Max: {orderModal.product.quantity} {orderModal.product.unit}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cash', 'telebirr', 'bank_transfer'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => setOrderModal(m => m ? { ...m, paymentMethod: method } : null)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all capitalize
                          ${orderModal.paymentMethod === method ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {method.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
                  <textarea
                    value={orderModal.notes}
                    onChange={e => setOrderModal(m => m ? { ...m, notes: e.target.value } : null)}
                    placeholder="Any special instructions..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({orderModal.quantity} {orderModal.product.unit})</span>
                    <span className="font-semibold text-gray-900">
                      ETB {(orderModal.product.price * orderModal.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={ordering}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-all"
                >
                  {ordering ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
