import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wheat, LayoutDashboard, ShoppingBag, ClipboardList, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const farmerLinks = [
    { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
  ];

  const merchantLinks = [
    { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { to: '/orders', icon: ClipboardList, label: 'My Orders' },
  ];

  const adminLinks = [
    { to: '/admin', icon: Shield, label: 'Admin Panel' },
    { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  ];

  const links =
    profile?.role === 'farmer' ? farmerLinks :
    profile?.role === 'admin' ? adminLinks :
    merchantLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-green-600 p-2 rounded-xl">
              <Wheat className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-green-800 font-bold text-lg">Nafi-AgriMarket</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive(to)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role} · {profile?.region}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm flex-shrink-0">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </div>
            </div>

            <button
              onClick={signOut}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive(to) ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 mt-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
