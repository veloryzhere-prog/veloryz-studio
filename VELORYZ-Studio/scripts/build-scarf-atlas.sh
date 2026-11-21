#!/usr/bin/env bash
# Build the exact VELORYZ scarf footage as 24fps WebP frame atlases.
# 3x3 cells per atlas; each cell 576x324. 20 atlas images = up to 180 frames.
# Source remains the owner's original 1440x810 knitted scarf video.
set -euo pipefail
cd "$(dirname "$0")/.."
input="public/assets/frame-cut/scarf.mp4"
out="public/assets/frame-cut/scarf-frames"
command -v ffmpeg >/dev/null || { echo "ffmpeg required" >&2; exit 1; }
test -s "$input" || { echo "Original scarf.mp4 missing" >&2; exit 1; }
mkdir -p "$out"
rm -f "$out"/sheet-*.webp
ffmpeg -hide_banner -loglevel error -nostdin -y -i "$input" \
  -vf "fps=24,scale=576:324:flags=lanczos,tile=3x3:nb_frames=9:padding=0:margin=0" \
  -frames:v 20 -c:v libwebp -quality 78 -compression_level 5 \
  -start_number 0 "$out/sheet-%02d.webp"
count=$(find "$out" -maxdepth 1 -name 'sheet-*.webp' -type f | wc -l)
if [ "$count" -ne 20 ]; then
  echo "Expected 20 scarf atlases, got $count" >&2
  exit 1
fi
echo "Generated $count original scarf sprite atlases (576x324 cell, 24fps)."
