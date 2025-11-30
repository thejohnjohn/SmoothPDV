import React, { useState, useEffect } from 'react';
import type { Loja } from '../../../../types/admin';

interface LojaFormProps {
  loja?: Loja | null;
  onSubmit: (data: Omit<Loja, 'id' | 'criado_em'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const LojaForm: React.FC<LojaFormProps> = ({
  loja,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loja) {
      setFormData({
        nome: loja.nome || '',
        cnpj: loja.cnpj || '',
        endereco: loja.endereco || '',
        telefone: loja.telefone || '',
        email: loja.email || '',
        status: loja.status || 'ativo'
      });
    }
  }, [loja]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da loja é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!/^\d{14}$/.test(formData.cnpj.replace(/\D/g, ''))) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Formatar CNPJ para apenas números antes de enviar
    const dataToSubmit = {
      ...formData,
      cnpj: formData.cnpj.replace(/\D/g, '')
    };

    await onSubmit(dataToSubmit);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Formatadores para os campos
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 5) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      } else if (numbers.length <= 8) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      } else if (numbers.length <= 12) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      } else {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
      }
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return `(${numbers}`;
      } else if (numbers.length <= 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      }
    }
    return value;
  };

  return (
    <div className="bg-white rounded-xl border border-black-light p-6">
      <h3 className="text-xl font-bold text-black mb-4">
        {loja ? '✏️ Editar Loja' : '🏢 Nova Loja'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nome da Loja *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.nome ? 'border-red-500' : 'border-black-light'
            }`}
            placeholder="Ex: Loja Centro, Loja Shopping"
            required
          />
          {errors.nome && (
            <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            CNPJ *
          </label>
          <input
            type="text"
            value={formatCNPJ(formData.cnpj)}
            onChange={(e) => handleChange('cnpj', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.cnpj ? 'border-red-500' : 'border-black-light'
            }`}
            placeholder="00.000.000/0000-00"
            maxLength={18}
            required
          />
          {errors.cnpj && (
            <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Endereço Completo *
          </label>
          <textarea
            value={formData.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.endereco ? 'border-red-500' : 'border-black-light'
            }`}
            placeholder="Rua, número, bairro, cidade - Estado"
            required
          />
          {errors.endereco && (
            <p className="text-red-500 text-sm mt-1">{errors.endereco}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Telefone *
          </label>
          <input
            type="text"
            value={formatTelefone(formData.telefone)}
            onChange={(e) => handleChange('telefone', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.telefone ? 'border-red-500' : 'border-black-light'
            }`}
            placeholder="(11) 99999-9999"
            maxLength={15}
            required
          />
          {errors.telefone && (
            <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
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
            placeholder="loja@exemplo.com"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
                Todos os campos marcados com * são obrigatórios. 
                O CNPJ será armazenado apenas com números.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (loja ? 'Atualizar Loja' : 'Cadastrar Loja')}
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