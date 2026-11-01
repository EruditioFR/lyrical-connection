#!/usr/bin/env bash
# Rejoue les migrations des outils professionnels et de la messagerie sur une base PostgreSQL jetable
# et vérifie les règles d'accès (RLS). Usage : PGHOST=... PGPORT=... PGUSER=postgres ./run_rls_tests.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=lyrisphere_rls_test
psql -q -v ON_ERROR_STOP=1 -d postgres -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f tests/rls_stub_schema.sql
for m in migrations/20261026220000_professional_artist_lists_notes.sql migrations/20261027100000_availability_sharing_jury.sql; do
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$m"
done
out=$(psql -q -d "$DB" -f tests/rls_professional_tools.sql)
echo "$out"
psql -q -d postgres -c "DROP DATABASE $DB"

# Messagerie
psql -q -v ON_ERROR_STOP=1 -d postgres -c "CREATE DATABASE $DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f tests/mail_stub_schema.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f migrations/20261029100000_secure_messaging.sql
mail_out=$(psql -q -d "$DB" -f tests/rls_messaging.sql)
echo "$mail_out"
psql -q -d postgres -c "DROP DATABASE $DB"
! grep -q "FAIL" <<<"$out$mail_out"
