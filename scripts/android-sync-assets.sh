#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ASSET_DIR="$ROOT_DIR/android/app/src/main/assets/www"

mkdir -p "$ASSET_DIR"
rm -rf "$ASSET_DIR"/*

cp "$ROOT_DIR/index.html" "$ASSET_DIR/"
cp "$ROOT_DIR/app.js" "$ASSET_DIR/"
cp "$ROOT_DIR/styles.css" "$ASSET_DIR/"
cp "$ROOT_DIR/ads_config.json" "$ASSET_DIR/"
cp "$ROOT_DIR/sdk_keys.json" "$ASSET_DIR/"
cp "$ROOT_DIR/legal-links.html" "$ASSET_DIR/"
cp "$ROOT_DIR/ops-dashboard.html" "$ASSET_DIR/"

echo "[android-sync] copied web assets -> $ASSET_DIR"
