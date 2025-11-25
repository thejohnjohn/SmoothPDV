import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';
import { useAuth } from '../../hooks/useAuth'; // Ajuste o caminho conforme necessário

export const Layout: React.FC = () => {
  const { user } = useAuth();
  
  // Verifica se o usuário é funcionário (não admin)
  const isEmployee = user?.tipo === 'VENDEDOR';

  return (
    <div className="flex flex-col h-screen bg-white-light font-nunito">
      {/* Header - fixo no topo */}
      <header className="bg-white border-b border-black-light shadow-sm">
        <Header />
      </header>

      {/* Container principal - Sidebar + Main lado a lado */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - coluna à esquerda (apenas para não-funcionários) */}
        {!isEmployee && (
          <aside className="w-64 bg-white border-r border-black-light">
            <Sidebar />
          </aside>
        )}

        {/* Main content - área principal rolável */}
        <main className={`${isEmployee ? 'flex-1' : 'flex-1'} overflow-auto`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};