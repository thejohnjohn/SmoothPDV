import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DropdownGerente } from '../../components/features/gerente/DropdownGerente/DropdownGerente';
import { ListaLojas } from '../../components/features/admin/ListaLojas/ListaLojas';

// Mock data
const lojasMock = [
  { id: 1, nome: 'Loja Centro', responsavel: 'João Silva', status: 'ativo' as const },
  { id: 2, nome: 'Loja Shopping', responsavel: 'Maria Santos', status: 'ativo' as const },
];

const opcoesFiltro = [
  { id: 'todas', nome: '📋 Todas as Lojas' },
  { id: 'ativas', nome: '✅ Lojas Ativas' },
  { id: 'minhas', nome: '👤 Minhas Lojas' },
];

export const Gerente: React.FC = () => {
  const { user } = useAuth();
  const [filtroSelecionado, setFiltroSelecionado] = useState('todas');
  const [mostrarFormLoja, setMostrarFormLoja] = useState(false);

  const handleSelecionarLoja = (loja: any) => {
    console.log('Loja selecionada:', loja);
  };

  const handleDeletarLoja = (id: number) => {
    console.log('Deletar loja:', id);
  };

  const handleAtualizarLoja = (id: number) => {
    console.log('Atualizar loja:', id);
  };

  const handleAdicionarLoja = () => {
    setMostrarFormLoja(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">👔 Painel do Gerente</h1>
          <p className="text-black-medium mt-1">
            Gerencie suas lojas e equipe
          </p>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="flex gap-4 items-center">
        <div className="w-64">
          <DropdownGerente
            opcoes={opcoesFiltro}
            valorSelecionado={filtroSelecionado}
            onMudarValor={setFiltroSelecionado}
          />
        </div>
        
        <button
          onClick={handleAdicionarLoja}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          + Adicionar Loja
        </button>
      </div>

      {/* Lista de Lojas */}
      <div className="bg-white rounded-xl border border-black-light p-6">
        <h2 className="text-xl font-bold text-black mb-4">
          🏪 Lojas {filtroSelecionado !== 'todas' ? `(${opcoesFiltro.find(o => o.id === filtroSelecionado)?.nome})` : ''}
        </h2>
        <ListaLojas
          lojas={lojasMock}
          onSelecionarLoja={handleSelecionarLoja}
          onDeletarLoja={handleDeletarLoja}
          onAtualizarLoja={handleAtualizarLoja}
        />
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-black-light p-6 text-center">
          <div className="text-3xl mb-2">🏪</div>
          <h3 className="font-bold text-black">Total de Lojas</h3>
          <p className="text-2xl font-bold text-primary">{lojasMock.length}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-black-light p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="font-bold text-black">Lojas Ativas</h3>
          <p className="text-2xl font-bold text-success">{lojasMock.filter(l => l.status === 'ativo').length}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-black-light p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-bold text-black">Equipe</h3>
          <p className="text-2xl font-bold text-secondary">12</p>
        </div>
      </div>
    </div>
  );
};