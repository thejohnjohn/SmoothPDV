import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  DollarSign,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> },
      { path: '/pdv', label: 'PDV', icon: <ShoppingCart className="h-4 w-4" aria-hidden="true" /> },
      { path: '/sales', label: 'Vendas', icon: <DollarSign className="h-4 w-4" aria-hidden="true" /> },
    ];

    if (user?.tipo === 'ADMIN') {
      return [
        ...baseItems,
        { path: '/admin', label: 'Admin', icon: <Building2 className="h-4 w-4" aria-hidden="true" /> },
      ];
    }

    if (user?.tipo === 'GERENTE') {
      return [
        ...baseItems,
        { path: '/gerente', label: 'Gerente', icon: <Briefcase className="h-4 w-4" aria-hidden="true" /> },
        { path: '/gerente/produtos', label: 'Produtos', icon: <Package className="h-4 w-4" aria-hidden="true" /> },
        { path: '/gerente/vendedores', label: 'Vendedores', icon: <Users className="h-4 w-4" aria-hidden="true" /> },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="h-full w-full bg-surface font-nunito">
      <div className="border-b border-line p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
            <Zap className="h-5 w-5 text-primary-700" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Menu</h2>
            <p className="text-sm text-ink-muted">Navegação</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'border border-transparent text-ink-muted hover:bg-primary-100 hover:text-ink'
                    }
                  `}
                >
                  {item.icon}
                  <span className="text-base">{item.label}</span>

                  {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-surface"></div>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
