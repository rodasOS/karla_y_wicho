#!/usr/bin/env bash
# core/ debe ser TypeScript puro: falla si importa Angular.
if grep -rn "@angular" src/app/core --include=*.ts; then
  echo "ERROR: core/ importa @angular/*" >&2; exit 1
fi
echo "OK: core/ no importa @angular/*"
