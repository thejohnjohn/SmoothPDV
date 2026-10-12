import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login({ email, senha });
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 font-nunito">
      <div className="bg-surface rounded-2xl shadow-lg border border-line p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">Smooth PDV</h1>
          <h2 className="text-2xl font-bold text-ink">Login</h2>
          <p className="text-ink-muted mt-2">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <Input
            type="email"
            id="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
          />

          {/* Password Input */}
          <Input
            type="password"
            id="senha"
            label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder="Sua senha"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-secondary-50 rounded-lg border border-secondary-100">
          <p className="text-sm text-ink-muted text-center">
            <Lightbulb className="inline-block h-4 w-4 mr-1 text-secondary-700 align-text-bottom" aria-hidden="true" />
            <strong className="text-secondary-700">Dica:</strong> Use suas credenciais para acessar o sistema
          </p>
        </div>
      </div>
    </div>
  );
};
