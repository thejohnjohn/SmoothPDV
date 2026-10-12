import React from 'react';
import { LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-surface border-b border-line">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 shadow-lg">
            <Zap className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink font-nunito">
              Smooth PDV
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-base font-bold text-ink font-nunito">
              Olá, {user?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-ink-muted font-nunito capitalize">
              {user?.tipo?.toLowerCase() || 'usuário'}
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-error-600 px-4 py-2 font-nunito text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-error-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};
