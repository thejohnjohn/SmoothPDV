#!/bin/bash
echo "🧪 TESTANDO SMOOTH PDV API"
echo "==========================="

BASE_URL="http://localhost:3000"

# Health Check
echo "1. Health Check:"
curl -s "$BASE_URL/health" | jq . || curl -s "$BASE_URL/health"
echo ""

# Produtos
echo "2. Listar Produtos:"
curl -s "$BASE_URL/api/products" | jq . || curl -s "$BASE_URL/api/products"
echo ""

# Clientes
echo "3. Listar Clientes:"
curl -s "$BASE_URL/api/customers" | jq . || curl -s "$BASE_URL/api/customers"
echo ""

# Vendas
echo "4. Listar Vendas:"
curl -s "$BASE_URL/api/sales" | jq . || curl -s "$BASE_URL/api/sales"
echo ""

# Erro 404
echo "404 não encontrado"
curl -s "$BASE_URL/api/SmoothPDV" | jq . 
echo ""

echo "✅ Teste completo!"