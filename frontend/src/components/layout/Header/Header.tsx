import React from 'react';
import { useAuth } from '../../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-black-light shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo e Título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">⚡</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black font-nunito">
              Smooth PDV
            </h1>
            <p className="text-sm text-black-medium font-nunito">
              Sistema de Gestão
            </p>
          </div>
        </div>
        
        {/* Ações do Usuário */}
        <div className="flex items-center gap-4">
          {/* Informações do Usuário */}
          <div className="flex items-center gap-3 bg-white-medium rounded-lg px-4 py-2 border border-black-light">
            <div className="w-8 h-8 bg-primary-light text-primary rounded-full flex items-center justify-center text-sm font-bold">
              {user?.nome?.charAt(0) || 'U'}
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-black font-nunito">
                Olá, {user?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-black-medium font-nunito capitalize">
                {user?.tipo?.toLowerCase() || 'usuário'}
              </p>
            </div>
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