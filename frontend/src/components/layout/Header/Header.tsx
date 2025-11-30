import React from 'react';
import { useAuth } from '../../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-black-light">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">⚡</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black font-nunito">
              Smooth PDV
            </h1>
          </div>
        </div>
        
        {/* Informações do Usuário e Logout */}
        <div className="flex items-center gap-4">
          {/* Informações do Usuário */}
          <div className="text-right">
            <p className="text-base font-bold text-black font-nunito">
              Olá, {user?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-black-medium font-nunito capitalize">
              {user?.tipo?.toLowerCase() || 'usuário'}
            </p>
          </div>

          {/* Botão Sair */}
          <button 
            onClick={logout}
            className="bg-error hover:bg-red-700 text-white px-4 py-2 rounded-lg font-nunito font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>🚪</span>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};