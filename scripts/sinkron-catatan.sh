#!/usr/bin/env bash
# Sinkron catatan proyek antara vault Obsidian dan repo.
#   bash scripts/sinkron-catatan.sh ke-repo    vault -> docs/ (sebelum commit, di komputer lokal)
#   bash scripts/sinkron-catatan.sh ke-vault   docs/ -> vault (setelah git pull hasil kerja di cloud)
# ponytail: salin penuh tanpa deteksi konflik. Selalu git pull dulu dan cek git diff sebelum commit.
set -euo pipefail
VAULT="${VAULT:-/d/History}"
NOTES="$VAULT/Project/Website Eastern LLC"
LAMPIRAN="$VAULT/Lampiran/Website Eastern LLC"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

# Peringatan, tidak menghentikan sinkron: tanggal "diperbarui" yang lebih tua dari waktu file
# terakhir diubah, dan tabel Markdown yang terpotong baris kosong (bagian bawahnya kehilangan header).
cek_catatan() {
  for f in "$1"/*.md; do
    tgl=$(sed -n 's/^diperbarui: *//p' "$f" | head -1)
    ubah=$(date -r "$f" +%F)
    [ -n "$tgl" ] && [[ "$tgl" < "$ubah" ]] && echo "PERINGATAN: $(basename "$f"): diperbarui $tgl, file diubah $ubah"
    awk -v n="$(basename "$f")" '/^\|/ && kosong && tabel { print "PERINGATAN: " n ": tabel terpotong baris kosong sebelum baris " NR }
      { if ($0 ~ /^\|/) { tabel=1; kosong=0 } else if ($0 ~ /^[[:space:]]*$/) { kosong=1 } else { tabel=0; kosong=0 } }' "$f"
  done
  return 0
}

case "${1:-}" in
  ke-repo)
    [ -d "$NOTES" ] || { echo "Vault tidak ditemukan: $NOTES" >&2; exit 1; }
    cek_catatan "$NOTES"
    rm -rf "$REPO/docs/catatan" && mkdir -p "$REPO/docs/catatan" "$REPO/docs/lampiran"
    cp "$NOTES"/*.md "$REPO/docs/catatan/"
    cp "$VAULT/CLAUDE.md" "$REPO/docs/ATURAN-VAULT.md"
    cp "$LAMPIRAN/Website Eastern LLC - Logo Wordmark.png" "$LAMPIRAN/Website Eastern LLC - Arsip Website Lama.txt" "$LAMPIRAN/Website Eastern LLC - Stempel Dongfang.png" "$LAMPIRAN/Website Eastern LLC - Logo Terang Ringkas.png" "$LAMPIRAN/Website Eastern LLC - Logo Terang Lengkap.png" "$REPO/docs/lampiran/"
    echo "Vault -> repo: $(ls "$REPO/docs/catatan" | wc -l) catatan disalin."
    ;;
  ke-vault)
    [ -d "$NOTES" ] || { echo "Vault tidak ditemukan: $NOTES" >&2; exit 1; }
    cek_catatan "$REPO/docs/catatan"
    cp "$REPO/docs/catatan/"*.md "$NOTES/"
    echo "Repo -> vault: $(ls "$REPO/docs/catatan" | wc -l) catatan disalin."
    ;;
  *) echo "Pakai: bash scripts/sinkron-catatan.sh ke-repo | ke-vault" >&2; exit 1 ;;
esac
