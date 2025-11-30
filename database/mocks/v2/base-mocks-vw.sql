--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: loja; Type: TABLE DATA; Schema: public; Owner: thejohnjohn
--

COPY public.loja (id, nome, cnpj, endereco, telefone, email, ativo, criado_em) FROM stdin;
1	Loja Principal	00000000000191	Endereço da Loja Principal	\N	\N	t	2025-11-25 21:40:08.10523
2	Loja Centro	11222333000144	Rua Central, 100 - Centro	(11) 3333-4444	centro@smoothpdv.com	t	2025-11-25 22:03:49.888811
3	Loja Shopping	44555666000177	Av. Shopping, 500 - 2º piso	(11) 5555-6666	shopping@smoothpdv.com	t	2025-11-25 22:03:49.888811
4	Loja Vila	77888999000100	Rua da Vila, 200 - Vila Nova	(11) 7777-8888	vila@smoothpdv.com	t	2025-11-25 22:03:49.888811
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: thejohnjohn
--

COPY public.usuario (id, nome, email, senha, tipo, criado_em, id_loja) FROM stdin;
7	Cliente Teste	cliente_teste@email.com	$2a$10$SSorm8o9xgFMi/yBjDGxDuOttpOdflJ15GahKV2o06OaXW30ti5wu	CLIENTE	2025-11-07 22:58:38.56484	1
9	Cliente Teste	cliente@teste.com	$2a$10$QkBSSqVMRifm3.vo9QyIDu4jeOwLYH2Kuw3M8AvEeg/o8TLjPCOQa	CLIENTE	2025-11-07 23:07:21.689767	1
1	João Silva	joao.silva@email.com	$2a$10$6U7nUvt9MPUhXem7VKH7ReODxMVEExk/PzhBjJ0sMALOQP6JujZme	ADMIN	2025-11-06 22:08:31.294517	1
2	Maria Santos	maria.santos@email.com	$2a$10$PifpF0sHLXPMcBRXgyd3ROAViry1KB11t1bJlVeHRQdd3RqmPvnuu	GERENTE	2025-11-06 22:08:31.294517	1
3	Pedro Oliveira	pedro.oliveira@email.com	$2a$10$/VzZhtC0Et2N7wtXiWHDCOJGt/5uTaSb0y2/2fjf6i7OVzpizRMtW	VENDEDOR	2025-11-06 22:08:31.294517	1
4	Ana Costa	ana.costa@email.com	$2a$10$VTUTWK452OvEP0T7qYdyEew9A.7rhxSkCgkTPPZAFn/4lGGiMG9b.	CLIENTE	2025-11-06 22:08:31.294517	1
5	Carlos Lima	carlos.lima@email.com	$2a$10$VHrqvLADIipImn4/eSJb6Oio2ygEHuuUeZBbNC/w1rR8arurbc372	CLIENTE	2025-11-06 22:27:19.062191	1
6	Fernanda Rocha	fernanda.rocha@email.com	$2a$10$VG7GwnrINAOyydr3GhKJsOJDh101fIe9CwpGTQI0BaDxk17f3rm9i	CLIENTE	2025-11-06 22:27:19.062191	1
10	Vendedor Teste	vendedor@teste.com	$2a$10$rrJr/5IYLUGfK3a70Is/IOPnAvZ.Xzoq7v4K.BQWF7w10r3TyHMby	VENDEDOR	2025-11-08 00:09:53.445422	1
11	Cliente Postman	cliente.postman@email.com	$2a$10$h5gkfJ6PRE7k5MFyyCYsjeF87ME83TrqTvAhrFiDIk7BOXzLbe66C	CLIENTE	2025-11-08 00:20:40.228436	1
\.


--
-- Data for Name: compra; Type: TABLE DATA; Schema: public; Owner: thejohnjohn
--

COPY public.compra (id, data, id_loja, id_vendedor) FROM stdin;
1	2024-01-15	1	\N
2	2024-01-16	1	\N
3	2024-01-17	1	\N
4	2024-01-18	1	\N
44	2024-01-14	1	\N
45	2024-01-14	1	\N
46	2025-11-21	1	\N
47	2025-11-21	1	\N
48	2025-11-21	1	\N
49	2025-11-22	1	\N
50	2025-11-24	1	\N
\.


--
-- Data for Name: mercadoria; Type: TABLE DATA; Schema: public; Owner: thejohnjohn
--

COPY public.mercadoria (id, descricao, preco, id_usuario, id_loja) FROM stdin;
1	Notebook Dell i7	2500.00	3	1
2	Mouse Wireless	89.90	3	1
3	Teclado Mecânico	299.99	3	1
4	Monitor 24" LED	899.00	2	1
5	Headphone Bluetooth	199.50	2	1
100	Produto Teste	99.99	4	1
\.


--
-- Data for Name: item_mercadoria; Type: TABLE DATA; Schema: public; Owner: thejohnjohn
--

COPY public.item_mercadoria (id, quantidade, idmercadoria, idcompra) FROM stdin;
1	1	1	1
2	2	2	1
3	1	3	2
4	1	4	3
5	3	5	3
6	1	2	4
7	1	1	44
8	2	2	44
9	1	1	45
10	2	2	45
11	2	1	46
12	1	4	47
13	2	100	48
14	2	3	49
15	2	4	50
\.


--
-- Data for Name: pagamento; Type: TABLE DATA; Schema: public; Owner: thejohnjohn
--

COPY public.pagamento (id, data, valor, idcompra, metodo_pagamento, status, troco, observacao) FROM stdin;
1	2024-01-15	2678.90	1	DINHEIRO	APROVADO	0.00	\N
2	2024-01-16	299.99	2	DINHEIRO	APROVADO	0.00	\N
3	2024-01-17	1498.50	3	DINHEIRO	APROVADO	0.00	\N
4	2024-01-18	89.90	4	DINHEIRO	APROVADO	0.00	\N
5	2024-01-14	2678.90	44	DINHEIRO	APROVADO	0.00	\N
6	2024-01-14	2678.90	45	DINHEIRO	APROVADO	0.00	\N
7	2025-11-21	5000.00	46	DINHEIRO	APROVADO	0.00	\N
8	2025-11-21	899.00	47	DINHEIRO	APROVADO	0.12	Primeiro teste depois do ajuste
9	2025-11-21	199.98	48	DINHEIRO	APROVADO	0.00	Caso de teste: verificar se o backend/banco é autossuficiente ao injetar o id_compra. 
10	2025-11-22	599.98	49	CARTAO_CREDITO	APROVADO	0.00	Teste
11	2025-11-24	1798.00	50	CARTAO_DEBITO	APROVADO	0.00	
\.


--
-- Name: compra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thejohnjohn
--

SELECT pg_catalog.setval('public.compra_id_seq', 50, true);


--
-- Name: item_mercadoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thejohnjohn
--

SELECT pg_catalog.setval('public.item_mercadoria_id_seq', 15, true);


--
-- Name: loja_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thejohnjohn
--

SELECT pg_catalog.setval('public.loja_id_seq', 4, true);


--
-- Name: pagamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thejohnjohn
--

SELECT pg_catalog.setval('public.pagamento_id_seq', 11, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thejohnjohn
--

SELECT pg_catalog.setval('public.usuario_id_seq', 11, true);


--
-- PostgreSQL database dump complete
--

