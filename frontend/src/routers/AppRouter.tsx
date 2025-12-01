import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout/Layout';

// Pages
import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Products } from '../pages/Products/Products';
import { Sales } from '../pages/Sales/Sales';
import { PDV } from '../pages/PDV/PDV';
import { Admin } from '../pages/Admin/Admin';
import { Gerente } from '../pages/Gerente/Gerente';
import { VendedoresGerente } from '../pages/Gerente/VendedoresGerente/VendedoresGerente';
import { ProdutosGerente } from '../pages/Gerente/ProdutosGerente/ProdutosGerente'; // NOVA PÁGINA

export const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getDefaultRoute = () => {
    if (!user) return '/login';
    
    switch (user.tipo) {
      case 'ADMIN':
        return '/admin';
      case 'GERENTE':
        return '/gerente';
      case 'VENDEDOR':
        return '/pdv';
      default:
        return '/pdv';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to={getDefaultRoute()} />} 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={user ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to={getDefaultRoute()} />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pdv" element={<PDV />} />
        <Route path="products" element={<Products />} />
        <Route path="sales" element={<Sales />} />
        
        {/* Rotas específicas por tipo de usuário */}
        <Route path="admin" element={<Admin />} />
        
        {/* 🆕 ROTAS DO GERENTE */}
        <Route path="gerente" element={<Gerente />} />
        <Route path="gerente/vendedores" element={<VendedoresGerente />} />
        <Route path="gerente/produtos" element={<ProdutosGerente />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};