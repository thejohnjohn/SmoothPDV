import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: '📊'
    },
    { 
      path: user?.tipo === 'ADMIN' ? '/admin' : '/gerente', 
      label: user?.tipo === 'ADMIN' ? 'Admin' : 'Gerente', 
      icon: user?.tipo === 'ADMIN' ? '🏢' : '👔'
    },
    { 
      path: '/pdv', 
      label: 'PDV', 
      icon: '🛒'
    },
    { 
      path: '/products', 
      label: 'Produtos', 
      icon: '📦'
    },
    { 
      path: '/sales', 
      label: 'Vendas', 
      icon: '💰'
    },
  ];

  return (
    <aside className="w-full h-full bg-white font-nunito">
      {/* Header do Sidebar */}
      <div className="p-6 border-b border-black-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Menu</h2>
            <p className="text-sm text-black-medium">Navegação</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                    ${isActive 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-black-medium hover:bg-primary-light hover:text-black border border-transparent'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-base">{item.label}</span>
                  
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};