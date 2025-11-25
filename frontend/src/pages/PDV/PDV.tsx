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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  const filteredProducts = products.filter(product => 
    product.descricao.toLowerCase().includes(search.toLowerCase())
  );

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
      
      setCart([]);
      setShowPaymentModal(false);
      
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-black-light">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-error text-4xl mb-4">⚠️</div>
          <p className="text-black-medium mb-2">{error}</p>
          <p className="text-black-light text-sm mb-4">Backend: http://localhost:3000</p>
          <button 
            onClick={loadProducts}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-nunito font-bold transition-colors"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white-light flex flex-col font-nunito">
      {/* Header */}
      <div className="bg-white border-b border-black-light px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">🛒 PDV - Ponto de Venda</h1>
            <p className="text-base text-black-medium mt-1">
              {products.length} produtos disponíveis
            </p>
          </div>
          <div className="text-right">
            <div className="text-base text-black-medium">
              Vendedor: <span className="font-bold">{user?.nome}</span>
            </div>
            {user?.tipo && (
              <span className="bg-primary-light text-primary px-3 py-1 rounded-full text-sm font-bold">
                {user.tipo}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Coluna Produtos */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-black-light p-6">
          {/* Busca e Controles */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Buscar produto por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-black-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-nunito"
              />
            </div>
            <button
              onClick={loadProducts}
              className="bg-white-medium hover:bg-primary-light text-black-medium px-4 py-2 rounded-lg border border-black-light transition-colors font-nunito font-bold"
            >
              🔄 Atualizar
            </button>
          </div>

          {/* Info de Resultados */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-base text-black-medium">
              {search ? (
                <span>
                  Buscando por: "<span className="font-bold">"{search}"</span>" • 
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
                className="text-base text-error hover:text-red-700 transition-colors font-nunito"
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
                className="bg-white border border-black-light rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                onClick={() => addToCart(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-black group-hover:text-primary line-clamp-2 flex-1 text-lg">
                    {product.descricao}
                  </h3>
                  <span className="bg-secondary-light text-secondary text-sm px-2 py-1 rounded-full ml-2 font-bold">
                    #{product.id}
                  </span>
                </div>
                
                <p className="text-xl font-bold text-success">
                  R$ {product.preco}
                </p>
                
                {product.vendedor_nome && (
                  <p className="text-sm text-black-light mt-1">
                    Cadastrado por: {product.vendedor_nome}
                  </p>
                )}
                
                <button className="w-full mt-3 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-lg transition-colors font-nunito font-bold text-base">
                  + Adicionar ao Carrinho
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              {search ? (
                <>
                  <div className="text-black-light text-6xl mb-4">🔍</div>
                  <p className="text-black-medium text-xl">Nenhum produto encontrado</p>
                  <p className="text-black-light mt-1 text-lg">
                    Não encontramos produtos para "<span className="font-bold">{search}</span>"
                  </p>
                  <button 
                    onClick={() => setSearch('')}
                    className="mt-4 text-primary hover:text-primary-medium transition-colors font-nunito font-bold text-lg"
                  >
                    Limpar busca e ver todos os produtos
                  </button>
                </>
              ) : (
                <>
                  <div className="text-black-light text-6xl mb-4">📦</div>
                  <p className="text-black-medium text-xl">Nenhum produto cadastrado</p>
                  <p className="text-black-light mt-1 text-lg">
                    Cadastre produtos no sistema para começar as vendas
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Coluna Carrinho */}
        <div className="bg-white rounded-xl shadow-sm border border-black-light flex flex-col">
          {/* Header do Carrinho */}
          <div className="p-6 border-b border-black-light">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">🛍️ Carrinho</h2>
              <div className="flex items-center gap-2">
                <span className="bg-primary-light text-primary text-base font-bold px-3 py-1 rounded-full">
                  {cart.length} itens
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-black-light hover:text-error transition-colors text-base"
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
                <div className="text-black-light text-6xl mb-4">🛒</div>
                <p className="text-black-medium text-lg">Carrinho vazio</p>
                <p className="text-black-light text-base mt-1">
                  Clique nos produtos para adicionar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-white-medium rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-black text-lg">
                          {item.product.descricao}
                        </h4>
                        <p className="text-base text-black-medium mt-1">
                          R$ {item.product.preco} cada
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-black-light hover:text-error transition-colors ml-2"
                        title="Remover item"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-black-light rounded-lg hover:bg-primary-light transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold w-8 text-center text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-black-light rounded-lg hover:bg-primary-light transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-success text-xl">
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
            <div className="p-6 border-t border-black-light space-y-6">
              {/* Total */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-3xl text-black">
                    R$ {getTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base text-black-medium">
                  <span>Itens no carrinho:</span>
                  <span>{cart.length} produto(s)</span>
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                onClick={openPaymentModal}
                className="w-full bg-success hover:bg-green-700 text-white py-4 px-6 rounded-lg font-nunito font-bold text-xl transition-colors shadow-lg"
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