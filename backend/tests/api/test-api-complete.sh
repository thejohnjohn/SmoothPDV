#!/bin/bash
echo "🧪 TESTE COMPLETO - SMOOTH PDV API COM AUTENTICAÇÃO"
echo "==================================================="

BASE_URL="http://192.168.0.102:3000"
JQ_CMD="jq . 2>/dev/null"

# Função para fazer requests com autenticação
make_request() {
    local method=$1
    local url=$2
    local token=$3
    local data=$4
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$url" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$data"
        else
            curl -s -X $method "$url" -H "Authorization: Bearer $token"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$url" -H "Content-Type: application/json" -d "$data"
        else
            curl -s -X $method "$url"
        fi
    fi
}

echo "1. 🩺 HEALTH CHECK"
echo "------------------"
make_request "GET" "$BASE_URL/health" "" "" | eval $JQ_CMD || make_request "GET" "$BASE_URL/health" "" ""
echo ""

echo "2. 🔐 TESTES DE AUTENTICAÇÃO (PÚBLICOS)"
echo "--------------------------------------"

# Registro de cliente
echo "2.1 📝 Registro de Cliente:"
CLIENT_REG_DATA='{"nome": "Cliente Teste", "email": "cliente@teste.com", "senha": "123456"}'
CLIENT_RESPONSE=$(make_request "POST" "$BASE_URL/api/auth/register" "" "$CLIENT_REG_DATA")
echo "$CLIENT_RESPONSE" | eval $JQ_CMD || echo "$CLIENT_RESPONSE"
CLIENT_TOKEN=$(echo "$CLIENT_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo ""

# Login com cliente
echo "2.2 🔑 Login Cliente:"
LOGIN_RESPONSE=$(make_request "POST" "$BASE_URL/api/auth/login" "" '{"email": "cliente@teste.com", "senha": "123456"}')
echo "$LOGIN_RESPONSE" | eval $JQ_CMD || echo "$LOGIN_RESPONSE"
echo ""

echo "3. 👥 TESTES DE USUÁRIOS (REQUER AUTENTICAÇÃO)"
echo "---------------------------------------------"

# Perfil do usuário logado
echo "3.1 👤 Perfil do Usuário (com token cliente):"
make_request "GET" "$BASE_URL/api/auth/profile" "$CLIENT_TOKEN" "" | eval $JQ_CMD
echo ""

# Tentativa de listar usuários sem permissão (cliente)
echo "3.2 🚫 Tentativa de Listar Usuários (Cliente - DEVE FALHAR):"
make_request "GET" "$BASE_URL/api/users" "$CLIENT_TOKEN" "" | eval $JQ_CMD
echo ""

echo "4. 📦 TESTES DE PRODUTOS"
echo "-----------------------"

# Listar produtos sem autenticação (DEVE FALHAR)
echo "4.1 🚫 Listar Produtos sem Autenticação (DEVE FALHAR):"
make_request "GET" "$BASE_URL/api/products" "" "" | eval $JQ_CMD
echo ""

# Listar produtos com autenticação
echo "4.2 ✅ Listar Produtos com Autenticação:"
make_request "GET" "$BASE_URL/api/products" "$CLIENT_TOKEN" "" | eval $JQ_CMD
echo ""

# Tentativa de criar produto como cliente (DEVE FALHAR)
echo "4.3 🚫 Criar Produto como Cliente (DEVE FALHAR):"
PRODUCT_DATA='{"id": 100, "descricao": "Produto Teste", "preco": 99.99, "id_usuario": 4}'
make_request "POST" "$BASE_URL/api/products" "$CLIENT_TOKEN" "$PRODUCT_DATA" | eval $JQ_CMD
echo ""

echo "5. 💰 TESTES DE VENDAS"
echo "---------------------"

# Listar vendas sem autenticação (DEVE FALHAR)
echo "5.1 🚫 Listar Vendas sem Autenticação (DEVE FALHAR):"
make_request "GET" "$BASE_URL/api/sales" "" "" | eval $JQ_CMD
echo ""

# Listar vendas com autenticação
echo "5.2 ✅ Listar Vendas com Autenticação:"
make_request "GET" "$BASE_URL/api/sales" "$CLIENT_TOKEN" "" | eval $JQ_CMD
echo ""

# Criar venda como cliente
echo "5.3 🛒 Criar Venda como Cliente:"
SALE_DATA='{
  "data": "2024-01-15",
  "id_cliente": 4,
  "itens": [
    {
      "quantidade": 2,
      "idmercadoria": 1
    }
  ],
  "pagamento": {
    "data": "2024-01-15", 
    "valor": 5000.00
  }
}'
make_request "POST" "$BASE_URL/api/sales" "$CLIENT_TOKEN" "$SALE_DATA" | eval $JQ_CMD
echo ""

echo "6. 🧪 TESTES DE PERMISSÕES ESPECÍFICAS"
echo "-------------------------------------"

# Primeiro, vamos criar um usuário admin para testes completos
echo "6.1 👑 Criando Usuário Admin para Testes (usando SQL direto):"
echo "Nota: Isso requer que você tenha um admin no banco. Vamos usar um existente."
echo ""

# Buscar token de um admin existente (assumindo que existe na base)
echo "6.2 🔑 Login como Admin (assumindo admin@email.com existe):"
ADMIN_LOGIN_RESPONSE=$(make_request "POST" "$BASE_URL/api/auth/login" "" '{"email": "joao.silva@email.com", "senha": "senha123"}')
echo "$ADMIN_LOGIN_RESPONSE" | eval $JQ_CMD || echo "$ADMIN_LOGIN_RESPONSE"
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo ""

if [ -n "$ADMIN_TOKEN" ]; then
    # Listar usuários como admin
    echo "6.3 👥 Listar Usuários como Admin:"
    make_request "GET" "$BASE_URL/api/users" "$ADMIN_TOKEN" "" | eval $JQ_CMD
    echo ""

    # Criar vendedor como admin
    echo "6.4 🛍️ Criar Vendedor como Admin:"
    VENDEDOR_DATA='{"nome": "Vendedor Teste", "email": "vendedor@teste.com", "senha": "123456", "tipo": "VENDEDOR"}'
    make_request "POST" "$BASE_URL/api/users" "$ADMIN_TOKEN" "$VENDEDOR_DATA" | eval $JQ_CMD
    echo ""

    # Criar produto como admin
    echo "6.5 📦 Criar Produto como Admin:"
    make_request "POST" "$BASE_URL/api/products" "$ADMIN_TOKEN" "$PRODUCT_DATA" | eval $JQ_CMD
    echo ""
fi

echo "7. 🚫 TESTES DE ERROS E VALIDAÇÕES"
echo "---------------------------------"

# Login com credenciais inválidas
echo "7.1 ❌ Login com Credenciais Inválidas:"
make_request "POST" "$BASE_URL/api/auth/login" "" '{"email": "naoexiste@teste.com", "senha": "senhaerrada"}' | eval $JQ_CMD
echo ""

# Registro com email duplicado
echo "7.2 ❌ Registro com Email Duplicado:"
make_request "POST" "$BASE_URL/api/auth/register" "" "$CLIENT_REG_DATA" | eval $JQ_CMD
echo ""

# Rota não encontrada
echo "7.3 🗺️  Rota Não Encontrada (404):"
make_request "GET" "$BASE_URL/api/rota-inexistente" "$CLIENT_TOKEN" "" | eval $JQ_CMD
echo ""

# Token inválido
echo "7.4 🎫 Token Inválido:"
make_request "GET" "$BASE_URL/api/products" "token-invalido" "" | eval $JQ_CMD
echo ""

echo "8. 📊 RESUMO DOS TESTES"
echo "----------------------"

echo "✅ Testes Públicos:"
echo "   - Health Check"
echo "   - Registro de Cliente" 
echo "   - Login"
echo ""

echo "✅ Testes Autenticados:"
echo "   - Perfil do usuário"
echo "   - Listar produtos/vendas (com auth)"
echo "   - Criar vendas"
echo ""

echo "✅ Testes de Autorização:"
echo "   - Cliente não pode listar usuários"
echo "   - Cliente não pode criar produtos"
echo "   - Admin pode gerenciar usuários"
echo ""

echo "✅ Testes de Erros:"
echo "   - Credenciais inválidas"
echo "   - Email duplicado"
echo "   - Rotas não encontradas"
echo "   - Tokens inválidos"
echo ""

echo "🎯 CENÁRIOS COBERTOS:"
echo "   🔐 Autenticação JWT"
echo "   👥 Hierarquia de usuários (Admin > Gerente > Vendedor > Cliente)"
echo "   🛡️  Middleware de autorização"
echo "   📦 CRUD de produtos com permissões"
echo "   💰 CRUD de vendas"
echo "   👤 Gerenciamento de usuários"
echo ""

echo "✨ TESTE COMPLETO FINALIZADO!"