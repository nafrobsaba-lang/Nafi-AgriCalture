import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Phone, Zap, ShoppingCart, Star, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { supabase, Product } from '../lib/supabase';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showOrder, setShowOrder] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'telebirr' | 'bank_transfer'>('cash');
  const [notes, setNotes] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (id) {
      supabase
        .from('products')
        .select('*, profiles!farmer_id(full_name, phone, region, avatar_url)')
        .eq('id', id)
        .maybeSingle()
        .then(({ data }) => {
          setProduct(data as Product);
          setLoading(false);
        });
    }
  }, [id]);

  async function placeOrder() {
    if (!product || !user) return;
    setOrdering(true);
    const { error } = await supabase.from('orders').insert({
      product_id: product.id,
      farmer_id: product.farmer_id,
      merchant_id: user.id,
      quantity,
      total_price: product.price * quantity,
      payment_method: paymentMethod,
      notes,
      status: 'pending',
    });
    setOrdering(false);
    if (!error) {
      setOrdered(true);
      setTimeout(() => { setShowOrder(false); setOrdered(false); }, 2000);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium">
          Go back
        </button>
      </div>
    </div>
  );

  const images = product.images?.length ? product.images : ['https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?w=600'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-green-500' : 'border-gray-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              {product.urgent_sale && (
                <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Zap className="h-3 w-3" /> Urgent Sale
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-500 capitalize mt-1">{product.category}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-700">ETB {product.price.toLocaleString()}</span>
              <span className="text-gray-400">/ {product.unit}</span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Available quantity</span>
                <span className="font-semibold text-gray-900">{product.quantity} {product.unit}</span>
              </div>
              {product.harvest_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Harvest date</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(product.harvest_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Location</span>
                <span className="font-semibold text-gray-900">{product.region}</span>
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.profiles && (
              <div className="border border-gray-100 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Farmer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                    {product.profiles.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{product.profiles.full_name}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {product.profiles.region}
                    </p>
                  </div>
                  <a
                    href={`tel:${product.profiles.phone}`}
                    className="ml-auto flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-all"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                </div>
                <div className="flex items-center gap-1 mt-3 text-amber-500">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= 4 ? 'fill-current' : 'text-gray-200 fill-current'}`} />)}
                  <span className="text-gray-500 text-xs ml-1">4.8 (12 reviews)</span>
                </div>
              </div>
            )}

            {profile?.role === 'merchant' && (
              <button
                onClick={() => setShowOrder(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 text-base"
              >
                <ShoppingCart className="h-5 w-5" /> Place Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Drawer */}
      {showOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button onClick={() => setShowOrder(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {ordered ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Order Placed!</h3>
                <p className="text-gray-500 text-sm">The farmer will review your order shortly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity ({product.unit})</label>
                  <input
                    type="number" min={1} max={product.quantity} value={quantity}
                    onChange={e => setQuantity(Math.max(1, +e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cash', 'telebirr', 'bank_transfer'] as const).map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)}
                        className={`py-2 text-xs font-medium rounded-xl border transition-all capitalize
                          ${paymentMethod === m ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="Optional instructions..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
                </div>
                <div className="flex justify-between items-center bg-green-50 rounded-xl px-4 py-3">
                  <span className="text-sm text-green-800 font-medium">Total</span>
                  <span className="text-green-800 font-bold">ETB {(product.price * quantity).toLocaleString()}</span>
                </div>
                <button onClick={placeOrder} disabled={ordering}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-all">
                  {ordering ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
