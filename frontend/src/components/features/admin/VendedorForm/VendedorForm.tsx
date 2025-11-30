import React, { useState, useEffect } from 'react';
import type { Vendedor, Loja } from '../../../../types/admin';

interface VendedorFormProps {
  vendedor?: Vendedor | null;
  lojas: Loja[];
  onSubmit: (data: Omit<Vendedor, 'id' | 'criado_em'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const VendedorForm: React.FC<VendedorFormProps> = ({
  vendedor,
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vendedor) {
      setFormData({
        nome: vendedor.nome,
        email: vendedor.email,
        loja_id: vendedor.loja_id.toString(),
        status: vendedor.status
      });
    }
  }, [vendedor]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.loja_id) {
      newErrors.loja_id = 'Loja é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit({
      ...formData,
      loja_id: parseInt(formData.loja_id)
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const lojasAtivas = lojas.filter(loja => loja.status === 'ativo');

  return (
    <div className="bg-white rounded-xl border border-black-light p-6">
      <h3 className="text-xl font-bold text-black mb-4">
        {vendedor ? '✏️ Editar Vendedor' : '👤 Novo Vendedor'}
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
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.nome ? 'border-red-500' : 'border-black-light'
            }`}
            placeholder="Digite o nome completo"
            required
          />
          {errors.nome && (
            <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            E-mail *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-black-light'
            }`}
            placeholder="email@exemplo.com"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Loja *
          </label>
          <select
            value={formData.loja_id}
            onChange={(e) => handleChange('loja_id', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.loja_id ? 'border-red-500' : 'border-black-light'
            }`}
            required
          >
            <option value="">Selecione uma loja</option>
            {lojasAtivas.map(loja => (
              <option key={loja.id} value={loja.id}>
                {loja.nome}
              </option>
            ))}
          </select>
          {errors.loja_id && (
            <p className="text-red-500 text-sm mt-1">{errors.loja_id}</p>
          )}
          {lojasAtivas.length === 0 && (
            <p className="text-orange-500 text-sm mt-1">
              Nenhuma loja ativa disponível. Cadastre uma loja primeiro.
            </p>
          )}
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-lg">💡</span>
            <div>
              <p className="text-blue-800 font-medium text-sm">
                Informações importantes
              </p>
              <p className="text-blue-600 text-sm mt-1">
                O vendedor receberá um e-mail com instruções para acessar o sistema.
                Certifique-se de que o e-mail está correto.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || lojasAtivas.length === 0}
            className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : (vendedor ? 'Atualizar Vendedor' : 'Cadastrar Vendedor')}
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
