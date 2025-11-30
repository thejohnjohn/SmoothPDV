-- 1. Contagem de registros por tabela
SELECT 'usuarios' as tabela, count(*) as total FROM usuario
UNION ALL SELECT 'mercadorias', count(*) FROM mercadoria
UNION ALL SELECT 'compras', count(*) FROM compra
UNION ALL SELECT 'itens', count(*) FROM item_mercadoria
UNION ALL SELECT 'pagamentos', count(*) FROM pagamento;

-- 2. Listar todas as mercadorias com vendedor
SELECT m.id, m.descricao, m.preco, u.nome as vendedor
FROM mercadoria m LEFT JOIN usuario u ON m.id_usuario = u.id;

-- 3. Compras com clientes e valores
SELECT c.id, c.data, u.nome as cliente, SUM(im.quantidade * m.preco) as total
FROM compra c 
JOIN usuario u ON c.id_cliente = u.id
JOIN item_mercadoria im ON c.id = im.idcompra
JOIN mercadoria m ON im.idmercadoria = m.id
GROUP BY c.id, u.nome;

-- 4. Pagamentos por compra
SELECT p.id, p.data, p.valor, c.id as compra_id, u.nome as cliente
FROM pagamento p 
JOIN compra c ON p.idcompra = c.id
JOIN usuario u ON c.id_cliente = u.id;

-- 5. Itens mais vendidos
SELECT m.descricao, SUM(im.quantidade) as total_vendido
FROM item_mercadoria im
JOIN mercadoria m ON im.idmercadoria = m.id
GROUP BY m.id, m.descricao
ORDER BY total_vendido DESC;