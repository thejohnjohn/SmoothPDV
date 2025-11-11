-- 1. Inserir usuários (já existente)
INSERT INTO "usuario" ("nome", "email", "senha", "tipo") VALUES 
('João Silva', 'joao.silva@email.com', '$2a$10$6U7nUvt9MPUhXem7VKH7ReODxMVEExk/PzhBjJ0sMALOQP6JujZme', 'ADMIN'),
('Maria Santos', 'maria.santos@email.com', '$2a$10$PifpF0sHLXPMcBRXgyd3ROAViry1KB11t1bJlVeHRQdd3RqmPvnuu', 'GERENTE'),
('Pedro Oliveira', 'pedro.oliveira@email.com', '$2a$10$/VzZhtC0Et2N7wtXiWHDCOJGt/5uTaSb0y2/2fjf6i7OVzpizRMtW', 'VENDEDOR'),
('Ana Costa', 'ana.costa@email.com', '$2a$10$VTUTWK452OvEP0T7qYdyEew9A.7rhxSkCgkTPPZAFn/4lGGiMG9b.', 'CLIENTE'),
('Carlos Lima', 'carlos.lima@email.com', '$2a$10$VHrqvLADIipImn4/eSJb6Oio2ygEHuuUeZBbNC/w1rR8arurbc372', 'CLIENTE'),
('Fernanda Rocha', 'fernanda.rocha@email.com', '$2a$10$VG7GwnrINAOyydr3GhKJsOJDh101fIe9CwpGTQI0BaDxk17f3rm9i', 'CLIENTE');

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