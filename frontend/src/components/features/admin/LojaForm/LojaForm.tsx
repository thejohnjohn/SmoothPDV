import React, { useState } from 'react';
import { Building2, Lightbulb, Pencil } from 'lucide-react';
import type { Loja } from '../../../../types/admin';
import { Button } from '../../../ui/Button/Button';
import { Card } from '../../../ui/Card/Card';
import { Input } from '../../../ui/Input/Input';

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

  const [prevLoja, setPrevLoja] = useState(loja);
  if (loja !== prevLoja) {
    setPrevLoja(loja);
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
  }

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
    <Card>
      <h3 className="flex items-center gap-2 text-xl font-bold text-ink mb-4">
        {loja ? (
          <>
            <Pencil className="h-5 w-5" aria-hidden="true" />
            Editar Loja
          </>
        ) : (
          <>
            <Building2 className="h-5 w-5" aria-hidden="true" />
            Nova Loja
          </>
        )}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Nome da Loja *"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Ex: Loja Centro, Loja Shopping"
          error={errors.nome}
          required
        />

        <Input
          type="text"
          label="CNPJ *"
          value={formatCNPJ(formData.cnpj)}
          onChange={(e) => handleChange('cnpj', e.target.value)}
          placeholder="00.000.000/0000-00"
          maxLength={18}
          error={errors.cnpj}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-ink">
            Endereço Completo *
          </label>
          <textarea
            value={formData.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            rows={3}
            className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              errors.endereco ? 'border-error-500' : 'border-line'
            }`}
            placeholder="Rua, número, bairro, cidade - Estado"
            required
          />
          {errors.endereco && (
            <p className="text-xs font-semibold text-error-600">{errors.endereco}</p>
          )}
        </div>

        <Input
          type="text"
          label="Telefone *"
          value={formatTelefone(formData.telefone)}
          onChange={(e) => handleChange('telefone', e.target.value)}
          placeholder="(11) 99999-9999"
          maxLength={15}
          error={errors.telefone}
          required
        />

        <Input
          type="email"
          label="E-mail *"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="loja@exemplo.com"
          error={errors.email}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-ink">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as 'ativo' | 'inativo')}
            className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div className="bg-secondary-50 border border-secondary-100 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-secondary-500" aria-hidden="true" />
            <div>
              <p className="text-secondary-700 font-medium text-sm">
                Informações importantes
              </p>
              <p className="text-secondary-700 text-sm mt-1">
                Todos os campos marcados com * são obrigatórios. 
                O CNPJ será armazenado apenas com números.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            {loading ? 'Salvando...' : (loja ? 'Atualizar Loja' : 'Cadastrar Loja')}
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
