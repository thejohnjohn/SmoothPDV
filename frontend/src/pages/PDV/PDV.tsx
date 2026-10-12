import React, { useState, useEffect } from 'react';
import { CreditCard, Package, RefreshCw, Search, ShoppingCart, Trash2 } from 'lucide-react';
import type { Product } from '../../types/products';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import { useAuth } from '../../hooks/useAuth';
import { PaymentModal } from '../../components/PaymentModal/PaymentModal';
import type { PaymentData } from '../../components/PaymentModal/PaymentModal';
import { InvoiceModal } from '../../components/InvoiceModal/InvoiceModal'; // Importando o modal de nota fiscal
import type { SaleData } from '../../components/InvoiceModal/InvoiceModal';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { useToast } from '../../components/ui/Toast/useToast';

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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false); // Estado para modal de NF
  const [lastSaleId, setLastSaleId] = useState<number | null>(null); // Último ID de venda
  const [lastSaleData, setLastSaleData] = useState<SaleData | null>(null); // Dados da última venda
  const { user } = useAuth();
  const { showToast } = useToast();

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

  const finalizeSale = async (paymentData: PaymentData) => {
    if (cart.length === 0) {
      showToast('Adicione produtos ao carrinho primeiro!', 'error');
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

      // Criar venda no backend
      const novaVenda = await saleService.create(saleData);
      
      // Salvar dados da venda para nota fiscal
      setLastSaleId(novaVenda.id);
      setLastSaleData(novaVenda);
      
      // Limpar carrinho
      setCart([]);
      setShowPaymentModal(false);
      
      // Mostrar mensagem de sucesso
      const methodName = getPaymentMethodName(paymentData.metodo_pagamento);
      const changeAmount = paymentData.troco ?? 0;
      const changeMessage = changeAmount > 0 
        ? ` Troco: R$ ${changeAmount.toFixed(2)}` 
        : '';
      
      showToast(`Venda finalizada com sucesso!\n${methodName}${changeMessage}`, 'success');
      
      // Abrir modal de nota fiscal
      setShowInvoiceModal(true);
      
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      showToast('Erro ao finalizar venda! Verifique o console.', 'error');
    }
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'DINHEIRO': 'Dinheiro',
      'CARTAO_DEBITO': 'Cartão Débito', 
      'CARTAO_CREDITO': 'Cartão Crédito',
      'PIX': 'Pix',
      'BOLETO': 'Boleto'
    };
    return methods[method] || method;
  };

  const openPaymentModal = () => {
    if (cart.length === 0) {
      showToast('Adicione produtos ao carrinho primeiro!', 'error');
      return;
    }
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState label="Carregando produtos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <ErrorState
          title={error}
          message="Backend: http://localhost:3000"
          onRetry={loadProducts}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-canvas flex flex-col font-nunito">
      {/* Header */}
      <div className="bg-surface border-b border-line px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-ink">
              <ShoppingCart className="h-8 w-8" aria-hidden="true" />
              PDV - Ponto de Venda
            </h1>
            <p className="text-base text-ink-muted mt-1">
              {products.length} produtos disponíveis
            </p>
          </div>
          <div className="text-right">
            <div className="text-base text-ink-muted">
              Vendedor: <span className="font-bold">{user?.nome}</span>
            </div>
            {user?.tipo && (
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold">
                {user.tipo}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Coluna Produtos */}
        <div className="lg:col-span-3 bg-surface rounded-xl shadow-sm border border-line p-6">
          {/* Busca e Controles */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar produto por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={loadProducts}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>
          </div>

          {/* Info de Resultados */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-base text-ink-muted">
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
                className="flex items-center gap-1 text-base text-error-600 hover:text-error-700 transition-colors font-nunito"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Limpar Carrinho
              </button>
            )}
          </div>

          {/* Grid de Produtos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-surface border border-line rounded-lg p-4 hover:border-primary-600 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => addToCart(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-ink group-hover:text-primary-600 line-clamp-2 flex-1 text-lg">
                    {product.descricao}
                  </h3>
                  <span className="bg-secondary-50 text-secondary-700 text-sm px-2 py-1 rounded-full ml-2 font-bold">
                    #{product.id}
                  </span>
                </div>
                
                <p className="text-xl font-bold text-success-600">
                  R$ {product.preco}
                </p>
                
                {product.vendedor_nome && (
                  <p className="text-sm text-ink-muted mt-1">
                    Cadastrado por: {product.vendedor_nome}
                  </p>
                )}
                
                <button className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors font-nunito font-bold text-base">
                  + Adicionar ao Carrinho
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-6">
              {search ? (
                <EmptyState
                  icon={<Search className="h-8 w-8" aria-hidden="true" />}
                  title="Nenhum produto encontrado"
                  description={`Não encontramos produtos para "${search}"`}
                  action={
                    <button
                      onClick={() => setSearch('')}
                      className="text-primary-700 hover:text-primary-400 transition-colors font-nunito font-bold text-lg"
                    >
                      Limpar busca e ver todos os produtos
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Package className="h-8 w-8" aria-hidden="true" />}
                  title="Nenhum produto cadastrado"
                  description="Cadastre produtos no sistema para começar as vendas"
                />
              )}
            </div>
          )}
        </div>

        {/* Coluna Carrinho */}
        <div className="bg-surface rounded-xl shadow-sm border border-line flex flex-col">
          {/* Header do Carrinho */}
          <div className="p-6 border-b border-line">
            <div className="flex justify-between items-center">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
                <ShoppingCart className="h-6 w-6" aria-hidden="true" />
                Carrinho
              </h2>
              <div className="flex items-center gap-2">
                <span className="bg-primary-100 text-primary-700 text-base font-bold px-3 py-1 rounded-full">
                  {cart.length} itens
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-ink-muted hover:text-error-600 transition-colors text-base"
                    title="Limpar carrinho"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Itens do Carrinho */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart className="h-8 w-8" aria-hidden="true" />}
                title="Carrinho vazio"
                description="Clique nos produtos para adicionar"
              />
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-surface-muted rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-ink text-lg">
                          {item.product.descricao}
                        </h4>
                        <p className="text-base text-ink-muted mt-1">
                          R$ {item.product.preco} cada
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-ink-muted hover:text-error-600 transition-colors ml-2"
                        title="Remover item"
                      >
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-line rounded-lg hover:bg-primary-100 transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold w-8 text-center text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-line rounded-lg hover:bg-primary-100 transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-success-600 text-xl">
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
            <div className="p-6 border-t border-line space-y-6">
              {/* Total */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-3xl text-ink">
                    R$ {getTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base text-ink-muted">
                  <span>Itens no carrinho:</span>
                  <span>{cart.length} produto(s)</span>
                </div>
              </div>

              {/* Botão Finalizar */}
              <Button variant="success" size="lg" fullWidth onClick={openPaymentModal}>
                <CreditCard className="h-5 w-5" aria-hidden="true" />
                Finalizar Venda
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pagamento */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={finalizeSale}
        total={getTotal()}
      />

      {/* Modal de Nota Fiscal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        saleId={lastSaleId}
        saleData={lastSaleData}
      />
    </div>
  );
};
