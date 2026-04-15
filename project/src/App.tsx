import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import MerchantMarketplace from './pages/MerchantMarketplace';
import ProductUpload from './pages/ProductUpload';
import OrderManagement from './pages/OrderManagement';
import ProductDetail from './pages/ProductDetail';
import AdminPanel from './pages/AdminPanel';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!user || !profile) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const homePath =
    profile.role === 'farmer' ? '/farmer/dashboard' :
    profile.role === 'admin' ? '/admin' :
    '/marketplace';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="/login" element={<Navigate to={homePath} replace />} />
      <Route path="/register" element={<Navigate to={homePath} replace />} />
      <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
      <Route path="/farmer/products/new" element={<ProductUpload />} />
      <Route path="/farmer/products/:id/edit" element={<ProductUpload />} />
      <Route path="/marketplace" element={<MerchantMarketplace />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/orders" element={<OrderManagement />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
