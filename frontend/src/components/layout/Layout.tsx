import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};