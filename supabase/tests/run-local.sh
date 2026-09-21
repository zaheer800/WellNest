#!/usr/bin/env bash
# Rebuilds a scratch Postgres database (wn_test), applies the shim + all migrations,
# optionally a draft, then runs the given test file.  Usage: run-local.sh [draft.sql] [test.sql]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$HERE/../.."
PSQL="sudo -n -u postgres psql -v ON_ERROR_STOP=1 -q -X"
sudo -n -u postgres psql -q -X -c "drop database if exists wn_test" -c "create database wn_test" >/dev/null
$PSQL -d wn_test < "$HERE/shim.sql" >/dev/null
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "applying $(basename "$f")"; $PSQL -d wn_test < "$f" >/dev/null
done
[ -n "${1:-}" ] && { echo "applying $1"; $PSQL -d wn_test < "$1"; }
[ -n "${2:-}" ] && { echo "running $2"; $PSQL -d wn_test < "$2"; }
echo OK
