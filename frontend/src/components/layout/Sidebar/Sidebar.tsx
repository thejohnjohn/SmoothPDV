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
      icon: '📊', 
      roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'CLIENTE'] 
    },
    { 
      path: '/pdv', 
      label: 'PDV', 
      icon: '🛒', 
      roles: ['ADMIN', 'GERENTE', 'VENDEDOR'] 
    },
    { 
      path: '/sales', 
      label: 'Vendas', 
      icon: '💰', 
      roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'CLIENTE'] 
    },
    { 
      path: '/products', 
      label: 'Produtos', 
      icon: '📦', 
      roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'CLIENTE'] 
    },
    { 
      path: '/customers', 
      label: 'Clientes', 
      icon: '👥', 
      roles: ['ADMIN', 'GERENTE'] 
    },
    { 
      path: '/reports', 
      label: 'Relatórios', 
      icon: '📋', 
      roles: ['ADMIN', 'GERENTE'] 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !['CLIENTE', 'VENDEDOR'].includes(user?.tipo || 'CLIENTE')
  );

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
          {filteredMenuItems.map(item => {
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
                  
                  {/* Indicador de página ativa */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer do Sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black-light bg-white-medium">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
            {user?.nome?.charAt(0) || 'U'}
          </div>
          <p className="text-sm font-bold text-black truncate">
            {user?.nome || 'Usuário'}
          </p>
          <p className="text-xs text-black-medium capitalize">
            {user?.tipo?.toLowerCase() || 'cliente'}
          </p>
        </div>
      </div>
    </aside>
  );
};