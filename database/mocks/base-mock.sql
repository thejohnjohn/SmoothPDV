-- 1. Inserir usuários (já existente)
INSERT INTO "usuario" ("nome", "email", "senha", "tipo") VALUES 
('João Silva', 'joao.silva@email.com', 'senha123', 'ADMIN'),
('Maria Santos', 'maria.santos@email.com', 'senha456', 'GERENTE'),
('Pedro Oliveira', 'pedro.oliveira@email.com', 'senha789', 'VENDEDOR'),
('Ana Costa', 'ana.costa@email.com', 'senha101', 'CLIENTE'),
('Carlos Lima', 'carlos.lima@email.com', 'senha202', 'CLIENTE'),
('Fernanda Rocha', 'fernanda.rocha@email.com', 'senha303', 'CLIENTE');

-- 2. Inserir mercadorias (cadastradas por usuários)
INSERT INTO "mercadoria" ("id", "descricao", "preco", "id_usuario") VALUES 
(1, 'Notebook Dell i7', 2500.00, 3),
(2, 'Mouse Wireless', 89.90, 3),
(3, 'Teclado Mecânico', 299.99, 3),
(4, 'Monitor 24" LED', 899.00, 2),
(5, 'Headphone Bluetooth', 199.50, 2);

-- 3. Inserir compras (feitas por clientes)
INSERT INTO "compra" ("data", "id_cliente") VALUES 
('2024-01-15', 4),
('2024-01-16', 5),
('2024-01-17', 6),
('2024-01-18', 4);

-- 4. Inserir itens nas compras
INSERT INTO "item_mercadoria" ("quantidade", "idmercadoria", "idcompra") VALUES 
(1, 1, 1),
(2, 2, 1),
(1, 3, 2),
(1, 4, 3),
(3, 5, 3),
(1, 2, 4);

-- 5. Inserir pagamentos
INSERT INTO "pagamento" ("data", "valor", "idcompra") VALUES 
('2024-01-15', 2678.90, 1),
('2024-01-16', 299.99, 2),
('2024-01-17', 1498.50, 3),
('2024-01-18', 89.90, 4);