import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Lightbulb, Pencil, User } from 'lucide-react';
import type { Loja, Vendedor, VendedorCreateData } from '../../../../types/admin';
import { Button } from '../../../ui/Button/Button';
import { Card } from '../../../ui/Card/Card';
import { Input } from '../../../ui/Input/Input';

interface VendedorFormProps {
  vendedor?: Vendedor | null;
  lojas: Loja[];
  onSubmit: (data: VendedorCreateData) => Promise<void>;
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
  const [formData, setFormData] = useState<VendedorCreateData>({
    nome: '',
    email: '',
    senha: '',
    loja_id: '',
    status: 'ativo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [prevVendedor, setPrevVendedor] = useState(vendedor);
  if (vendedor !== prevVendedor) {
    setPrevVendedor(vendedor);
    if (vendedor) {
      setFormData({
        nome: vendedor.nome,
        email: vendedor.email,
        senha: '', // Senha em branco para edição
        loja_id: vendedor.loja_id.toString(),
        status: vendedor.status
      });
    }
  }

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

    // 🆕 CORREÇÃO: Validar senha apenas para novo cadastro
    if (!vendedor) {
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }
    }

    // 🆕 CORREÇÃO: Validar loja - deve ser obrigatória
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

    // 🆕 CORREÇÃO: Preparar dados no formato EXATO que o backend espera
    const dataToSubmit: VendedorCreateData = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      id_loja: Number(formData.loja_id)
    };

    console.log('📤 Enviando dados do vendedor:', dataToSubmit);

    await onSubmit(dataToSubmit);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🆕 CORREÇÃO: Filtrar apenas lojas ativas
  const lojasAtivas = lojas.filter(loja => loja.status === 'ativo' || (loja as Loja & { ativo?: boolean }).ativo === true);

  return (
    <Card>
      <h3 className="flex items-center gap-2 text-xl font-bold text-ink mb-4">
        {vendedor ? (
          <>
            <Pencil className="h-5 w-5" aria-hidden="true" />
            Editar Vendedor
          </>
        ) : (
          <>
            <User className="h-5 w-5" aria-hidden="true" />
            Novo Vendedor
          </>
        )}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Nome Completo *"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Digite o nome completo"
          error={errors.nome}
          required
        />

        <Input
          type="email"
          label="E-mail *"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="vendedor@loja.com"
          error={errors.email}
          required
        />

        {/* Campo de Senha */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label={vendedor ? 'Nova Senha (opcional)' : 'Senha *'}
              value={formData.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              placeholder={vendedor ? 'Deixe em branco para manter atual' : 'Digite a senha'}
              required={!vendedor}
              error={errors.senha}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {vendedor && (
            <p className="text-ink-muted text-xs mt-1">
              Preencha apenas se desejar alterar a senha
            </p>
          )}
        </div>

        {/* 🆕 CORREÇÃO: Campo Loja - obrigatório e apenas lojas ativas */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-ink">
            Loja *
          </label>
          <select
            value={formData.loja_id}
            onChange={(e) => handleChange('loja_id', e.target.value)}
            className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              errors.loja_id ? 'border-error-500' : 'border-line'
            }`}
            required
          >
            <option value="">Selecione uma loja</option>
            {lojasAtivas.map(loja => (
              <option key={loja.id} value={loja.id}>
                {loja.nome} {loja.status && `(${loja.status})`}
              </option>
            ))}
          </select>
          {errors.loja_id && (
            <p className="text-xs font-semibold text-error-600">{errors.loja_id}</p>
          )}
          {lojasAtivas.length === 0 && (
            <p className="flex items-center gap-2 text-warning-600 text-sm mt-1">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Nenhuma loja ativa disponível. É necessário cadastrar uma loja ativa primeiro.
            </p>
          )}
        </div>

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
                {vendedor 
                  ? 'Para alterar a senha, preencha o campo "Nova Senha". Deixe em branco para manter a senha atual.'
                  : 'O vendedor receberá um e-mail com instruções para acessar o sistema. Certifique-se de que o e-mail está correto.'
                }
              </p>
              <p className="text-secondary-700 text-sm mt-1">
                • Loja é obrigatória para vendedores
                <br/>
                • Apenas lojas ativas são exibidas
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={lojasAtivas.length === 0}
            className="flex-1"
          >
            {loading ? 'Salvando...' : (vendedor ? 'Atualizar Vendedor' : 'Cadastrar Vendedor')}
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
