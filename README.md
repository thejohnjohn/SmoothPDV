# SmoothPDV

Sistema de PDV (ponto de venda) com interface web (React + Vite), API (Node/Express) e banco PostgreSQL.

## Estrutura

- `backend/` — API (Node.js/Express)
- `frontend/` — interface web (React/Vite)
- `database/` — dumps de schema e dados de exemplo
- `docker/` — scripts de inicialização do banco

## Desenvolvimento com Docker

Requisitos: Docker e Docker Compose.

```bash
cp .env-example .env   # opcional - os padrões de desenvolvimento já funcionam
docker compose up --build
```

- Interface: http://localhost:5173
- API: http://localhost:3000
- Saúde da API: http://localhost:3000/health

Na primeira subida o banco é criado automaticamente com o schema e os dados de exemplo de `database/`.
Alterações em `backend/` e `frontend/` são recarregadas automaticamente.

### Comandos úteis

```bash
docker compose logs -f        # acompanhar logs
docker compose down           # parar o ambiente
docker compose down -v        # parar e apagar os dados do banco
docker compose up --build     # recriar após mudar package.json/yarn.lock
```

### Variáveis de ambiente

Em desenvolvimento todas são opcionais (há padrões). As principais:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `API_PORT` | `3000` | Porta da API (interna e publicada) |
| `VITE_API_URL` | `http://localhost:3000/api` | URL da API usada pelo navegador |
| `FRONTEND_PORT` | `5173` (dev) / `8080` (prod) | Porta publicada da interface |
| `DB_HOST_PORT` | `5432` | Porta publicada do banco (dev) |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `smooth-pdv` / `smooth` / `smooth` | Credenciais do banco |
| `JWT_SECRET` | valor de dev | Segredo de assinatura dos tokens |
| `EMAIL_API_KEY` / `MAIL_FROM` | placeholder | Configuração de envio de e-mail (Resend) |

## Produção

```bash
DB_PASSWORD=... JWT_SECRET=... docker compose -f compose.prod.yaml up -d --build
```

- Interface (nginx): http://localhost:8080
- A interface é servida como build estático e o nginx faz proxy de `/api` para a API.
- O banco sobe com o schema e uma loja padrão (sem dados de exemplo; defina `LOAD_MOCKS=true` para carregá-los).
- `DB_PASSWORD` e `JWT_SECRET` são obrigatórios.
- Para apontar a interface para outra URL de API, defina `PUBLIC_API_URL` no build.
- Persistência: volume `db_data` (remova com `docker compose -f compose.prod.yaml down -v`).
