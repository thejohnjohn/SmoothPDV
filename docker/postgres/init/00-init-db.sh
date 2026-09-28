#!/bin/sh
set -e

psql_db() {
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" "$@"
}

# O dump de schema tem comandos de MySQL no topo (CREATE DATABASE/USE) e atribui
# ownership a um papel que não existe no container. O enum tipo_usuario também
# precisa do valor CLIENTE, usado pela aplicação no cadastro de clientes.
sed -E \
  -e '/^CREATE DATABASE /d' \
  -e '/^USE /d' \
  -e '/OWNER TO /d' \
  /opt/db/schema.sql | psql_db

psql_db -c "ALTER TYPE public.tipo_usuario ADD VALUE IF NOT EXISTS 'CLIENTE';"

# O dump de schema é anterior ao soft delete da aplicação; garante as colunas
# usadas pelas entidades nas tabelas com exclusão lógica.
for table in loja usuario mercadoria compra; do
  psql_db -c "ALTER TABLE public.$table \
    ADD COLUMN IF NOT EXISTS deleted boolean NOT NULL DEFAULT false, \
    ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone, \
    ADD COLUMN IF NOT EXISTS deleted_by integer, \
    ADD COLUMN IF NOT EXISTS restored_at timestamp without time zone, \
    ADD COLUMN IF NOT EXISTS restored_by integer;"
done

if [ "${LOAD_MOCKS:-false}" = "true" ]; then
  psql_db -f /opt/db/mocks.sql
elif [ "${LOAD_SEED:-false}" = "true" ]; then
  psql_db -f /opt/db/seed.sql
fi
