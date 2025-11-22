import React from 'react';
import { useAuth } from '../../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>Smooth PDV</h1>
        </div>
        
        <div className="header-actions">
          <span className="user-info">Olá, {user?.nome}</span>
          <button onClick={logout} className="btn-logout">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};