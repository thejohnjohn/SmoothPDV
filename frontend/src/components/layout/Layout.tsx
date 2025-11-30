import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';
import { useAuth } from '../../hooks/useAuth';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  
  // Verifica se o usuário é vendedor (não mostra sidebar)
  const isVendedor = user?.tipo === 'VENDEDOR';

  return (
    <div className="flex h-screen bg-white-light font-nunito">
      {/* Sidebar - apenas para Admin e Gerente */}
      {!isVendedor && (
        <aside className="w-64 bg-white border-r border-black-light flex-shrink-0">
          <Sidebar />
        </aside>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-black-light shadow-sm flex-shrink-0">
          <Header />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};