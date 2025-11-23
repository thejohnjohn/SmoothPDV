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
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {filteredMenuItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};