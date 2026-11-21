#!/usr/bin/env bash
# Create two 30fps frame atlases from the ORIGINAL 1440x810 VELORYZ scarf.
# High: 720x405 cells. Lite: 480x270 cells for low-memory/touch hardware.
set -euo pipefail
cd "$(dirname "$0")/.."
input="public/assets/frame-cut/scarf.mp4"
command -v ffmpeg >/dev/null || { echo "ffmpeg required" >&2; exit 1; }
test -s "$input" || { echo "Original scarf.mp4 missing" >&2; exit 1; }
for spec in "scarf-frames:720:405:82" "scarf-frames-lite:480:270:77"; do
 IFS=: read -r directory width height quality <<< "$spec"
 out="public/assets/frame-cut/$directory"
 mkdir -p "$out"
 rm -f "$out"/sheet-*.webp
 ffmpeg -hide_banner -loglevel error -nostdin -y -i "$input" \
  -vf "fps=30,scale=${width}:${height}:flags=lanczos,tile=3x3:nb_frames=9:padding=0:margin=0" \
  -frames:v 25 -c:v libwebp -quality "$quality" -compression_level 5 \
  -start_number 0 "$out/sheet-%02d.webp"
 count=$(find "$out" -maxdepth 1 -name 'sheet-*.webp' -type f | wc -l)
 if [ "$count" -ne 25 ]; then
  echo "Expected 25 scarf atlases in $out, got $count" >&2
  exit 1
 fi
 echo "Generated $count original 30fps $directory atlases ($width x $height per frame)"
done
