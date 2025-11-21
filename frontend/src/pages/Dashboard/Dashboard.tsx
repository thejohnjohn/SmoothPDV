import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.nome}!</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Vendas Hoje</h3>
          <span className="stat-value">R$ 2.890,00</span>
        </div>
        
        <div className="stat-card">
          <h3>Produtos</h3>
          <span className="stat-value">45</span>
        </div>
        
        <div className="stat-card">
          <h3>Clientes</h3>
          <span className="stat-value">12</span>
        </div>
      </div>
    </div>
  );
};