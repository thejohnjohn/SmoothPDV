import React, { useState } from 'react';
import { Briefcase, Eye, EyeOff, Lightbulb, Pencil } from 'lucide-react';
import type { Gerente, GerenteCreateData, Loja } from '../../../../types/admin';
import { Button } from '../../../ui/Button/Button';
import { Card } from '../../../ui/Card/Card';
import { Input } from '../../../ui/Input/Input';

interface GerenteFormProps {
  gerente?: Gerente | null;
  lojas: Loja[];
  onSubmit: (data: GerenteCreateData) => Promise<void>;
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
  const [formData, setFormData] = useState<GerenteCreateData>({
    nome: '',
    email: '',
    senha: '', // 🆕 NOVO campo
    loja_id: 0,
    status: 'ativo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [prevGerente, setPrevGerente] = useState(gerente);
  if (gerente !== prevGerente) {
    setPrevGerente(gerente);
    if (gerente) {
      setFormData({
        nome: gerente.nome,
        email: gerente.email,
        senha: '', // 🆕 Senha em branco para edição (não preencher por segurança)
        loja_id: gerente.loja_id || undefined,
        status: gerente.status
      });
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    // 🆕 VALIDAÇÃO DE SENHA
    if (!gerente && !formData.senha) {
      newErrors.senha = 'Senha é obrigatória para novo cadastro';
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 🆕 PREPARAR DADOS PARA ENVIO
    const dataToSubmit: GerenteCreateData = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      loja_id: formData.loja_id ? formData.loja_id : undefined,
      status: formData.status
    };

    await onSubmit(dataToSubmit);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <h3 className="flex items-center gap-2 text-xl font-bold text-ink mb-4">
        {gerente ? (
          <>
            <Pencil className="h-5 w-5" aria-hidden="true" />
            Editar Gerente
          </>
        ) : (
          <>
            <Briefcase className="h-5 w-5" aria-hidden="true" />
            Novo Gerente
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
          placeholder="email@empresa.com"
          error={errors.email}
          required
        />

        {/* 🆕 CAMPO DE SENHA */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label={gerente ? 'Nova Senha (opcional)' : 'Senha *'}
              value={formData.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              placeholder={gerente ? 'Deixe em branco para manter atual' : 'Digite a senha'}
              required={!gerente}
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
          {gerente && (
            <p className="text-ink-muted text-xs mt-1">
              Preencha apenas se desejar alterar a senha
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-ink">
            Loja (Opcional)
          </label>
          <select
            value={formData.loja_id}
            onChange={(e) => handleChange('loja_id', e.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="">Selecione uma loja</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>
                {loja.nome}
              </option>
            ))}
          </select>
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
                {gerente 
                  ? 'Para alterar a senha, preencha o campo "Nova Senha". Deixe em branco para manter a senha atual.'
                  : 'O gerente receberá um e-mail com instruções para acessar o sistema. Certifique-se de que o e-mail está correto.'
                }
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
            {loading ? 'Salvando...' : (gerente ? 'Atualizar' : 'Cadastrar')}
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
