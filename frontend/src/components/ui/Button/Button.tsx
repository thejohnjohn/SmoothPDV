import React, { useState, useEffect } from 'react';
import { Product } from '../../types/products';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import { useAuth } from '../../hooks/useAuth';

interface CartItem {
  product: Product;
  quantity: number;
}

export const PDV: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: '📦 Todos', icon: '📦' },
    { id: 'eletronicos', name: '💻 Eletrônicos', icon: '💻' },
    { id: 'escritorio', name: '📎 Escritório', icon: '📎' },
    { id: 'casa', name: '🏠 Casa', icon: '🏠' },
  ];

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

  const finalizeSale = async () => {
    if (cart.length === 0) return;

    try {
      const saleData = {
        data: new Date().toISOString().split('T')[0],
        id_cliente: user?.id || 1,
        itens: cart.map(item => ({
          quantidade: item.quantity,
          idmercadoria: item.product.id
        })),
        pagamento: {
          data: new Date().toISOString().split('T')[0],
          valor: getTotal()
        }
      };

      await saleService.create(saleData);
      setCart([]);
      alert('Venda finalizada com sucesso! 🎉');
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao finalizar venda!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🛒 PDV - Ponto de Venda</h1>
          <div className="text-sm text-gray-600">
            Vendedor: <span className="font-medium">{user?.nome}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Coluna Produtos - 3/4 da tela */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Busca */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Categorias */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Grid de Produtos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => addToCart(product)}
              >
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2">
                  {product.descricao}
                </h3>
                <p className="text-lg font-bold text-success mt-2">
                  R$ {product.preco.toFixed(2)}
                </p>
                <button className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  + Adicionar
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          )}
        </div>

        {/* Coluna Carrinho - 1/4 da tela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          {/* Header do Carrinho */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">🛍️ Carrinho</h2>
              <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2 py-1 rounded-full">
                {cart.length} itens
              </span>
            </div>
          </div>

          {/* Itens do Carrinho */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🛒</div>
                <p className="text-gray-500">Carrinho vazio</p>
                <p className="text-gray-400 text-sm mt-1">Adicione produtos para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 flex-1 pr-2">
                        {item.product.descricao}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-error transition-colors"
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
                        <span className="font-medium w-8 text-center">
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
                        <p className="text-sm text-gray-600">
                          R$ {item.product.preco.toFixed(2)} uni
                        </p>
                        <p className="font-bold text-success">
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
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-2xl text-gray-900">
                    R$ {getTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Formas de Pagamento */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">💳 Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['💰 Dinheiro', '💳 Cartão', '📱 Pix', '🏦 Boleto'].map((method) => (
                    <button
                      key={method}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                onClick={finalizeSale}
                className="w-full bg-success hover:bg-green-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors shadow-lg"
              >
                ✅ Finalizar Venda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};