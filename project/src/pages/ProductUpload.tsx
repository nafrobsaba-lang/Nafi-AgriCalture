import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'livestock', 'dairy', 'other'];
const UNITS = ['kg', 'quintal', 'piece', 'liter', 'ton'];

const PEXELS_IMAGES: Record<string, string[]> = {
  vegetables: ['https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?w=400', 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?w=400'],
  fruits: ['https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?w=400', 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?w=400'],
  grains: ['https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?w=400', 'https://images.pexels.com/photos/1537169/pexels-photo-1537169.jpeg?w=400'],
  livestock: ['https://images.pexels.com/photos/422220/pexels-photo-422220.jpeg?w=400', 'https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg?w=400'],
  dairy: ['https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?w=400', 'https://images.pexels.com/photos/416656/pexels-photo-416656.jpeg?w=400'],
  other: ['https://images.pexels.com/photos/1447537/pexels-photo-1447537.jpeg?w=400'],
};

interface ProductForm {
  name: string;
  category: string;
  price: string;
  quantity: string;
  unit: string;
  description: string;
  harvest_date: string;
  urgent_sale: boolean;
  images: string[];
}

export default function ProductUpload() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ProductForm>({
    name: '', category: 'vegetables', price: '', quantity: '',
    unit: 'kg', description: '', harvest_date: '', urgent_sale: false, images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      supabase.from('products').select('*').eq('id', id).maybeSingle().then(({ data }) => {
        if (data) {
          setForm({
            name: data.name,
            category: data.category,
            price: String(data.price),
            quantity: String(data.quantity),
            unit: data.unit,
            description: data.description || '',
            harvest_date: data.harvest_date || '',
            urgent_sale: data.urgent_sale || false,
            images: data.images || [],
          });
        }
        setFetchingProduct(false);
      });
    }
  }, [id, isEdit]);

  function update(field: string, value: string | boolean | string[]) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  function addSampleImage(url: string) {
    if (form.images.includes(url)) {
      update('images', form.images.filter(i => i !== url));
    } else if (form.images.length < 3) {
      update('images', [...form.images, url]);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.quantity) {
      setError('Name, price, and quantity are required');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      description: form.description,
      harvest_date: form.harvest_date || null,
      urgent_sale: form.urgent_sale,
      images: form.images.length > 0 ? form.images : [PEXELS_IMAGES[form.category][0]],
    };

    if (isEdit) {
      const { error: err } = await supabase.from('products').update({ ...payload, updated_at: new Date() }).eq('id', id).eq('farmer_id', profile!.id);
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      const { error: err } = await supabase.from('products').insert({
        ...payload,
        farmer_id: profile!.id,
        region: profile!.region,
        status: 'active',
      });
      if (err) { setError(err.message); setLoading(false); return; }
    }

    setSuccess(true);
    setTimeout(() => navigate('/farmer/dashboard'), 1500);
    setLoading(false);
  }

  if (fetchingProduct) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center py-16"><div className="h-8 w-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/farmer/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-gray-500 text-sm">{isEdit ? 'Update your product listing' : 'List your produce on the marketplace'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-green-700 text-sm">Product {isEdit ? 'updated' : 'added'} successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-base">Product Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g., Fresh Tomatoes"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm appearance-none capitalize"
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
                <select
                  value={form.unit}
                  onChange={e => update('unit', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm appearance-none"
                >
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (ETB) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={e => update('quantity', e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe your product, freshness, quality, etc."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Harvest Date</label>
              <input
                type="date"
                value={form.harvest_date}
                onChange={e => update('harvest_date', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => update('urgent_sale', !form.urgent_sale)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.urgent_sale ? 'bg-red-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.urgent_sale ? 'left-7' : 'left-1'}`} />
              </div>
              <div className="flex items-center gap-2">
                <Zap className={`h-4 w-4 ${form.urgent_sale ? 'text-red-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">Urgent Sale</span>
                <span className="text-xs text-gray-400">(needs to sell fast)</span>
              </div>
            </label>
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-4 w-4 text-gray-600" />
              <h2 className="font-semibold text-gray-900 text-base">Product Images</h2>
              <span className="text-xs text-gray-400">({form.images.length}/3 selected)</span>
            </div>

            <p className="text-sm text-gray-500 mb-4">Select up to 3 images for your product:</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(PEXELS_IMAGES[form.category] || PEXELS_IMAGES.other).map((url, i) => (
                <div
                  key={i}
                  onClick={() => addSampleImage(url)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                    ${form.images.includes(url) ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {form.images.includes(url) && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {form.images.indexOf(url) + 1}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-100 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Updating...' : 'Adding Product...'}
              </span>
            ) : isEdit ? 'Update Product' : 'Add to Marketplace'}
          </button>
        </form>
      </div>
    </div>
  );
}
