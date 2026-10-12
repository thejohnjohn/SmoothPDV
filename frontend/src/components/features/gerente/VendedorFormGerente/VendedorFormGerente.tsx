import React, { useState } from 'react';
import { Eye, EyeOff, Info, Pencil, Store, User } from 'lucide-react';
import type { Vendedor, VendedorCreateData } from '../../../../types/admin';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '../../../ui/Button/Button';
import { Card } from '../../../ui/Card/Card';
import { Input } from '../../../ui/Input/Input';

interface VendedorFormGerenteProps {
  vendedor?: Vendedor | null;
  onSubmit: (data: VendedorCreateData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const VendedorFormGerente: React.FC<VendedorFormGerenteProps> = ({
  vendedor,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<VendedorCreateData>({
    nome: '',
    email: '',
    senha: '',
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

    // Validar senha apenas para novo cadastro
    if (!vendedor) {
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 🆕 CORREÇÃO: Sempre incluir a loja do gerente logado
    const dadosCompletos: Partial<VendedorCreateData> = {
      ...formData,
      id_loja: user?.id_loja // 🆕 FORÇAR loja do gerente
    };

    // Para edição, remover senha se estiver vazia
    if (vendedor && !formData.senha) {
      delete dadosCompletos.senha;
    }

    const dataToSubmit = dadosCompletos as VendedorCreateData;

    console.log('💾 [GERENTE] Enviando vendedor para loja:', dataToSubmit.id_loja);

    await onSubmit(dataToSubmit);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card padding="none" className="p-6">
      <h3 className="flex items-center gap-2 text-xl font-bold text-ink mb-4">
        {vendedor ? (
          <>
            <Pencil className="h-5 w-5" aria-hidden="true" />
            Editar Vendedor
          </>
        ) : (
          <>
            <User className="h-5 w-5" aria-hidden="true" />
            Novo Vendedor da Loja
          </>
        )}
      </h3>
      
      {/* 🆕 INFO DA LOJA */}
      <div className="bg-secondary-50 border border-secondary-100 text-secondary-700 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <Store className="h-5 w-5" aria-hidden="true" />
          <div>
            <p className="font-medium text-sm">
              Loja: <span className="font-bold">{user?.loja_nome || 'Minha Loja'}</span>
            </p>
            <p className="text-xs mt-1">
              ID da Loja: {user?.id_loja}
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo *"
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          error={errors.nome}
          placeholder="Digite o nome completo do vendedor"
          required
        />

        <Input
          label="E-mail *"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="vendedor@loja.com"
          required
        />

        {/* Campo de Senha */}
        <div className="relative">
          <Input
            label={vendedor ? 'Nova Senha (opcional)' : 'Senha *'}
            type={showPassword ? 'text' : 'password'}
            value={formData.senha}
            onChange={(e) => handleChange('senha', e.target.value)}
            error={errors.senha}
            hint={vendedor ? 'Preencha apenas se desejar alterar a senha. A senha atual será mantida se deixar em branco.' : undefined}
            placeholder={vendedor ? 'Deixe em branco para manter atual' : 'Digite a senha'}
            required={!vendedor}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[2.875rem] transform -translate-y-1/2 text-ink-muted hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">
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

        <div className="bg-success-50 border border-success-100 text-success-700 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="font-medium text-sm">
                Vendedor será cadastrado na SUA loja
              </p>
              <p className="text-sm mt-1">
                Loja: <strong>{user?.loja_nome || 'Minha Loja'}</strong> (ID: {user?.id_loja})
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
