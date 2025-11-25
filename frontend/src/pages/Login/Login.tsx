import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

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
    <div className="min-h-screen bg-white-light flex items-center justify-center p-4 font-nunito">
      <div className="bg-white rounded-2xl shadow-lg border border-black-light p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Smooth PDV</h1>
          <h2 className="text-2xl font-bold text-black">Login</h2>
          <p className="text-black-medium mt-2">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-base font-bold text-black-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-black-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-black placeholder-black-light"
              placeholder="seu@email.com"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="senha" className="block text-base font-bold text-black-medium">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-4 py-3 border border-black-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-black placeholder-black-light"
              placeholder="Sua senha"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>

          {/* Register Link
          <div className="text-center pt-4 border-t border-black-light">
            <p className="text-black-medium">
              Não tem conta?{' '}
              <a 
                href="/register" 
                className="text-primary hover:text-primary-medium font-bold transition-colors"
              >
                Cadastre-se
              </a>
            </p>
          </div>*/}
        </form>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-secondary-light rounded-lg border border-secondary-medium">
          <p className="text-sm text-black-medium text-center">
            <strong className="text-secondary">💡 Dica:</strong> Use suas credenciais para acessar o sistema
          </p>
        </div>
      </div>
    </div>
  );
};