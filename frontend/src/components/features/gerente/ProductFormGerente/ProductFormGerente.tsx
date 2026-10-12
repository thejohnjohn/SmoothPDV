import React, { useState } from 'react';
import { Lightbulb, Package, Pencil } from 'lucide-react';
import type { Product, ProductFormData } from '../../../../types/products';
import { Button } from '../../../ui/Button/Button';
import { Card } from '../../../ui/Card/Card';
import { Input } from '../../../ui/Input/Input';

interface ProductFormGerenteProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
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

  const [prevProduct, setPrevProduct] = useState(product);
  if (product !== prevProduct) {
    setPrevProduct(product);
    if (product) {
      setFormData({
        descricao: product.descricao || '',
        preco: product.preco?.toString() || '',
        categoria: product.categoria || ''
      });
    }
  }

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
    <Card padding="none" className="p-6">
      <h3 className="flex items-center gap-2 text-xl font-bold text-ink mb-4">
        {product ? (
          <>
            <Pencil className="h-5 w-5" aria-hidden="true" />
            Editar Produto
          </>
        ) : (
          <>
            <Package className="h-5 w-5" aria-hidden="true" />
            Novo Produto
          </>
        )}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Descrição do Produto *"
          type="text"
          value={formData.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          error={errors.descricao}
          placeholder="Ex: Smartphone Samsung Galaxy S23"
          required
        />

        <div className="relative">
          <span className="absolute left-3 top-[2.875rem] transform -translate-y-1/2 text-ink-muted">
            R$
          </span>
          <Input
            label="Preço (R$) *"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.preco}
            onChange={(e) => handleChange('preco', e.target.value)}
            error={errors.preco}
            placeholder="0.00"
            required
            className="pl-10"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">
            Categoria
          </label>
          <select
            value={formData.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-secondary-50 border border-secondary-100 text-secondary-700 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="font-medium text-sm">
                Informações importantes
              </p>
              <p className="text-sm mt-1">
                O produto será cadastrado automaticamente na sua loja.
                Certifique-se de que o preço está correto antes de salvar.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            {loading ? 'Salvando...' : (product ? 'Atualizar Produto' : 'Cadastrar Produto')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};
