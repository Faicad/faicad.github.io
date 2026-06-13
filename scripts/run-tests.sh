#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"

echo "=== Building CN version ==="
node build.js

echo ""
echo "=== Running all tests ==="
node --test test-*.spec.mjs
