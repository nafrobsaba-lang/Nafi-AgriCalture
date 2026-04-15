import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Eye, EyeOff, AlertCircle, Leaf, ShoppingBag, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const path =
        profile?.role === 'farmer' ? '/farmer/dashboard' :
        profile?.role === 'admin' ? '/admin' :
        '/marketplace';

      navigate(path, { replace: true });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Wheat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">Nafi-AgriMarket</h1>
              <p className="text-green-200 text-sm">Farm to Market Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-4">
              Connecting Farmers<br />
              <span className="text-green-200">to Markets</span>
            </h2>
            <p className="text-green-100 text-lg leading-relaxed">
              A direct marketplace where farmers sell fresh produce and merchants find the best quality agricultural goods.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Leaf, title: 'Fresh Produce', desc: 'Direct from farm to your doorstep' },
              { icon: ShoppingBag, title: 'Easy Ordering', desc: 'Simple ordering and tracking system' },
              { icon: TrendingUp, title: 'Fair Prices', desc: 'Transparent pricing with no middlemen' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="bg-white/20 p-2.5 rounded-xl flex-shrink-0">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-green-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-green-200 text-sm">
            Empowering Ethiopian farmers &amp; merchants since 2026.&copy;Developed by Nafrob Husen
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="bg-green-600 p-3 rounded-2xl">
              <Wheat className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-green-800 text-2xl font-bold">AgriMarket</h1>
              <p className="text-green-600 text-xs">Farm to Market Platform</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-gray-900 text-3xl font-bold mb-2">Welcome back</h2>
              <p className="text-gray-500 text-base">Sign in to your Nafi-AgriMarket account</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="farmer@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-base shadow-lg shadow-green-200 hover:shadow-green-300 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
            <span>Secure Login</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>SSL Encrypted</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Private &amp; Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
