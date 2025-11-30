import React, { useState, useEffect } from 'react';
import type { Gerente, Loja } from '../../../../types/admin';

interface GerenteFormProps {
  gerente?: Gerente | null;
  lojas: Loja[];
  onSubmit: (data: Omit<Gerente, 'id' | 'criado_em'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const GerenteForm: React.FC<GerenteFormProps> = ({
  gerente,
  lojas,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    loja_id: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  useEffect(() => {
    if (gerente) {
      setFormData({
        nome: gerente.nome,
        email: gerente.email,
        loja_id: gerente.loja_id?.toString() || '',
        status: gerente.status
      });
    }
  }, [gerente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      loja_id: formData.loja_id ? parseInt(formData.loja_id) : undefined
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-black-light p-6">
      <h3 className="text-xl font-bold text-black mb-4">
        {gerente ? '✏️ Editar Gerente' : '👔 Novo Gerente'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            className="w-full px-4 py-2 border border-black-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            E-mail *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-2 border border-black-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Loja (Opcional)
          </label>
          <select
            value={formData.loja_id}
            onChange={(e) => handleChange('loja_id', e.target.value)}
            className="w-full px-4 py-2 border border-black-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Selecione uma loja</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>
                {loja.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as 'ativo' | 'inativo')}
            className="w-full px-4 py-2 border border-black-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (gerente ? 'Atualizar' : 'Cadastrar')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all duration-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
