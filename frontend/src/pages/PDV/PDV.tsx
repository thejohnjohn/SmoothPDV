import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/products';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import { useAuth } from '../../hooks/useAuth';
import { PaymentModal } from '../../components/PaymentModal/PaymentModal';

interface CartItem {
  product: Product;
  quantity: number;
}

export const PDV: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // ← NOVO STATE
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productsData = await productService.getAll();
      setProducts(productsData);

    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  // Filtra produtos apenas pela busca
  const filteredProducts = products.filter(product => 
    product.descricao.toLowerCase().includes(search.toLowerCase())
  );

  // Funções do carrinho
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.product.preco * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  const finalizeSale = async (paymentData: any) => {
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho primeiro!');
      return;
    }

    try {
      const total = getTotal();
      
      const saleData = {
        data: new Date().toISOString().split('T')[0],
        id_cliente: user?.id || 1,
        itens: cart.map(item => ({
          quantidade: item.quantity,
          idmercadoria: item.product.id
        })),
        pagamento: {
          data: new Date().toISOString().split('T')[0],
          valor: total,
          metodo_pagamento: paymentData.metodo_pagamento,
          troco: paymentData.troco || 0,
          valor_pago: paymentData.valor_pago || total,
          observacao: paymentData.observacao || '',
          status: 'APROVADO'
        }
      };

      await saleService.create(saleData);
      
      // Limpar carrinho após venda
      setCart([]);
      setShowPaymentModal(false);
      
      // Mensagem de sucesso personalizada
      const methodName = getPaymentMethodName(paymentData.metodo_pagamento);
      const changeMessage = paymentData.troco > 0 
        ? ` Troco: R$ ${paymentData.troco.toFixed(2)}` 
        : '';
      
      alert(`🎉 Venda finalizada com sucesso!\n💳 ${methodName}${changeMessage}`);
      
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('❌ Erro ao finalizar venda! Verifique o console.');
    }
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'DINHEIRO': '💰 Dinheiro',
      'CARTAO_DEBITO': '💳 Cartão Débito', 
      'CARTAO_CREDITO': '💳 Cartão Crédito',
      'PIX': '📱 Pix',
      'BOLETO': '🏦 Boleto'
    };
    return methods[method] || method;
  };

  const openPaymentModal = () => {
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho primeiro!');
      return;
    }
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-error text-4xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-2">{error}</p>
          <p className="text-gray-500 text-sm mb-4">Backend: http://localhost:3000</p>
          <button 
            onClick={loadProducts}
            className="btn-primary"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🛒 PDV - Ponto de Venda</h1>
            <p className="text-sm text-gray-600 mt-1">
              {products.length} produtos disponíveis
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Vendedor: <span className="font-medium">{user?.nome}</span>
            </div>
            {user?.tipo && (
              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {user.tipo}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Coluna Produtos */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Busca e Controles */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Buscar produto por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadProducts}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors"
            >
              🔄 Atualizar
            </button>
          </div>

          {/* Info de Resultados */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {search ? (
                <span>
                  Buscando por: "<span className="font-medium">"{search}"</span>" • 
                  {filteredProducts.length} produto(s) encontrado(s)
                </span>
              ) : (
                <span>
                  Mostrando todos os {filteredProducts.length} produtos
                </span>
              )}
            </div>
            
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-error hover:text-red-700 transition-colors"
              >
                🗑️ Limpar Carrinho
              </button>
            )}
          </div>

          {/* Grid de Produtos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => addToCart(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2 flex-1">
                    {product.descricao}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                    #{product.id}
                  </span>
                </div>
                
                <p className="text-lg font-bold text-success">
                  R$ {product.preco}
                </p>
                
                {product.vendedor_nome && (
                  <p className="text-xs text-gray-500 mt-1">
                    Cadastrado por: {product.vendedor_nome}
                  </p>
                )}
                
                <button className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  + Adicionar ao Carrinho
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              {search ? (
                <>
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
                  <p className="text-gray-400 mt-1">
                    Não encontramos produtos para "<span className="font-medium">{search}</span>"
                  </p>
                  <button 
                    onClick={() => setSearch('')}
                    className="mt-4 text-primary-600 hover:text-primary-700"
                  >
                    Limpar busca e ver todos os produtos
                  </button>
                </>
              ) : (
                <>
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <p className="text-gray-500 text-lg">Nenhum produto cadastrado</p>
                  <p className="text-gray-400 mt-1">
                    Cadastre produtos no sistema para começar as vendas
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Coluna Carrinho */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          {/* Header do Carrinho */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">🛍️ Carrinho</h2>
              <div className="flex items-center gap-2">
                <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2 py-1 rounded-full">
                  {cart.length} itens
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-gray-400 hover:text-error transition-colors text-sm"
                    title="Limpar carrinho"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Itens do Carrinho */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🛒</div>
                <p className="text-gray-500">Carrinho vazio</p>
                <p className="text-gray-400 text-sm mt-1">
                  Clique nos produtos para adicionar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product.descricao}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          R$ {item.product.preco} cada
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-error transition-colors ml-2"
                        title="Remover item"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="font-medium w-8 text-center text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-success text-lg">
                          R$ {(item.product.preco * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer do Carrinho */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              {/* Total */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-2xl text-gray-900">
                    R$ {getTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Itens no carrinho:</span>
                  <span>{cart.length} produto(s)</span>
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                onClick={openPaymentModal}
                className="w-full bg-success hover:bg-green-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors shadow-lg"
              >
                💳 Finalizar Venda
              </button>
            </div>
          )}
        </div>
      </div>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={finalizeSale}
        total={getTotal()}
      />
    </div>
  );
};