import React, { useState, useEffect } from 'react';
import type { Product } from '../../../../types/products';

interface ProductFormGerenteProps {
  product?: Product | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ProductFormGerente: React.FC<ProductFormGerenteProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    descricao: '',
    preco: '',
    categoria: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        descricao: product.descricao || '',
        preco: product.preco?.toString() || '',
        categoria: product.categoria || ''
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição do produto é obrigatória';
    }

    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
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
      descricao: formData.descricao,
      preco: parseFloat(formData.preco),
      categoria: formData.categoria || undefined
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const categories = [
    'Eletrônicos',
    'Informática',
    'Casa e Decoração',
    'Beleza e Perfumaria',
    'Livros',
    'Esportes',
    'Moda',
    'Alimentação',
    'Outros'
  ];

  return (
    <div className="bg-white rounded-xl border border-black-light p-6">
      <h3 className="text-xl font-bold text-black mb-4">
        {product ? '✏️ Editar Produto' : '📦 Novo Produto'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Descrição do Produto *
          </label>
          <input
            type="text"
            value={formData.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.descricao ? 'border-red-500' : 'border-black-light'
            }`}
            placeholder="Ex: Smartphone Samsung Galaxy S23"
            required
          />
          {errors.descricao && (
            <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Preço (R$) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              R$
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.preco}
              onChange={(e) => handleChange('preco', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.preco ? 'border-red-500' : 'border-black-light'
              }`}
              placeholder="0.00"
              required
            />
          </div>
          {errors.preco && (
            <p className="text-red-500 text-sm mt-1">{errors.preco}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Categoria
          </label>
          <select
            value={formData.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="w-full px-4 py-2 border border-black-light rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
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
                O produto será cadastrado automaticamente na sua loja.
                Certifique-se de que o preço está correto antes de salvar.
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
            {loading ? 'Salvando...' : (product ? 'Atualizar Produto' : 'Cadastrar Produto')}
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