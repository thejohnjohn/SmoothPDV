INSERT INTO public.loja (id, nome, cnpj, endereco, telefone, email, ativo, deleted)
VALUES (1, 'Loja Principal', NULL, NULL, NULL, NULL, true, false)
ON CONFLICT (id) DO NOTHING;

SELECT pg_catalog.setval('public.loja_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.loja), 1), true);
