import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Eye, EyeOff, AlertCircle, Tractor, ShoppingCart, MapPin, Phone, User, Mail, Lock, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const REGIONS = [
  'Addis Ababa', 'Oromia', 'Amhara', 'SNNPR', 'Tigray',
  'Somali', 'Afar', 'Benishangul-Gumuz', 'Gambela', 'Harari', 'Dire Dawa'
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '' as 'farmer' | 'merchant' | '',
    region: '',
  });

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  function nextStep() {
    if (step === 1) {
      if (!form.role) { setError('Please select your role'); return; }
    }
    if (step === 2) {
      if (!form.full_name || !form.email || !form.phone) {
        setError('All fields are required'); return;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.email)) { setError('Invalid email address'); return; }
    }
    setError('');
    setStep(s => s + 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (!form.region) {
      setError('Please select your region'); return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: form.full_name,
        phone: form.phone,
        role: form.role,
        region: form.region,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    navigate(form.role === 'farmer' ? '/farmer/dashboard' : '/marketplace', { replace: true });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Wheat className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Nafi-AgriMarket</h1>
            <p className="text-green-200 text-sm">Farm to Market Platform</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              Join Thousands of<br />
              <span className="text-green-200">Farmers & Merchants</span>
            </h2>
            <p className="text-green-100 leading-relaxed">
              Create your free account and start trading agricultural products directly, with fair prices and no middlemen.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { step: 1, label: 'Choose your role', active: step >= 1 },
              { step: 2, label: 'Personal information', active: step >= 2 },
              { step: 3, label: 'Security & Location', active: step >= 3 },
            ].map(item => (
              <div key={item.step} className={`flex items-center gap-3 transition-all ${item.active ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                  ${step > item.step ? 'bg-white text-green-700' : item.active ? 'bg-white/20 text-white border-2 border-white' : 'bg-white/10 text-green-300 border border-white/20'}`}>
                  {step > item.step ? '✓' : item.step}
                </div>
                <span className={`text-sm font-medium ${item.active ? 'text-white' : 'text-green-300'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-green-200 text-sm">Free to join. No hidden fees.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="bg-green-600 p-2.5 rounded-xl">
              <Wheat className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-green-800 text-xl font-bold">Nafi-AgriMarket</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300
                    ${step >= s ? 'bg-green-500' : 'bg-gray-100'}`} />
                ))}
              </div>
              <h2 className="text-gray-900 text-2xl font-bold">
                {step === 1 ? 'Choose your role' : step === 2 ? 'Your information' : 'Almost done!'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">Step {step} of 3</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">Are you a farmer or a merchant?</p>
                {[
                  { value: 'farmer', icon: Tractor, title: 'I am a Farmer', desc: 'I grow and sell agricultural products' },
                  { value: 'merchant', icon: ShoppingCart, title: 'I am a Merchant', desc: 'I buy agricultural products to resell' },
                ].map(({ value, icon: Icon, title, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('role', value)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left
                      ${form.role === value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}
                  >
                    <div className={`p-3 rounded-xl ${form.role === value ? 'bg-green-500' : 'bg-gray-200'}`}>
                      <Icon className={`h-6 w-6 ${form.role === value ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${form.role === value ? 'text-green-800' : 'text-gray-800'}`}>{title}</p>
                      <p className={`text-sm ${form.role === value ? 'text-green-600' : 'text-gray-500'}`}>{desc}</p>
                    </div>
                  </button>
                ))}
                <button onClick={nextStep} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {[
                  { field: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Abebe Bekele', Icon: User },
                  { field: 'email', label: 'Email Address', type: 'email', placeholder: 'abebe@example.com', Icon: Mail },
                  { field: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+251 911 234 567', Icon: Phone },
                ].map(({ field, label, type, placeholder, Icon }) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={type}
                        value={form[field as keyof typeof form]}
                        onChange={e => update(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm">
                    Back
                  </button>
                  <button onClick={nextStep} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Region</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={form.region}
                      onChange={e => update('region', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm appearance-none"
                    >
                      <option value="">Select your region</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {[
                  { field: 'password', label: 'Password', placeholder: 'Min. 6 characters' },
                  { field: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat your password' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form[field as keyof typeof form]}
                        onChange={e => update(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                      />
                      {field === 'password' && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-green-200">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:text-green-700 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
