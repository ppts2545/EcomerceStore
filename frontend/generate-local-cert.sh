#!/bin/bash
# Generate local HTTPS certs for Vite dev server
if ! command -v mkcert &> /dev/null; then
  echo "mkcert not found. Please install mkcert first (brew install mkcert && mkcert -install)"
  exit 1
fi
mkcert localhost
