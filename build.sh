#!/bin/sh
# Build the plugin and its update manifest from src/.
#   ./build.sh  ->  dist/zotero-toggle-bars.xpi, dist/updates.json
# Release: attach both files to a GitHub release tagged v<version>.
set -e
cd "$(dirname "$0")"
mkdir -p dist
rm -f dist/zotero-toggle-bars.xpi dist/updates.json
(cd src && zip -q -r -X ../dist/zotero-toggle-bars.xpi . -x '.*')
python3 - <<'PY'
import json
m = json.load(open("src/manifest.json"))
z = m["applications"]["zotero"]
repo = m["homepage_url"].rstrip("/")
v = m["version"]
updates = {"addons": {z["id"]: {"updates": [{
    "version": v,
    "update_link": f"{repo}/releases/download/v{v}/zotero-toggle-bars.xpi",
    "applications": {"zotero": {"strict_min_version": z["strict_min_version"],
                                "strict_max_version": z["strict_max_version"]}},
}]}}}
json.dump(updates, open("dist/updates.json", "w"), indent=2)
print(f"built dist/zotero-toggle-bars.xpi and dist/updates.json (v{v})")
PY
