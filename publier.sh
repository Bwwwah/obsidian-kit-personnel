#!/bin/bash
# Publie une nouvelle version du Kit Personnel (nécessite git et gh connectés à GitHub).
# Usage : ./publier.sh 1.1.0 "Ce qui change"
# Les coffres équipés de BRAT la récupèrent à leur prochain démarrage.
set -euo pipefail
cd "$(dirname "$0")"

VERSION="${1:-}"; MESSAGE="${2:-Version $VERSION}"
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage : ./publier.sh X.Y.Z \"description\"   (version actuelle : $(python3 -c 'import json;print(json.load(open("manifest.json"))["version"])'))"
  exit 1
fi
if git rev-parse "$VERSION" >/dev/null 2>&1; then echo "La version $VERSION existe déjà."; exit 1; fi

python3 - "$VERSION" <<'PY'
import json, sys
v = sys.argv[1]
m = json.load(open("manifest.json")); m["version"] = v
json.dump(m, open("manifest.json", "w"), ensure_ascii=False, indent=2); open("manifest.json", "a").write("\n")
vs = json.load(open("versions.json")); vs[v] = m["minAppVersion"]
json.dump(vs, open("versions.json", "w"), indent=2); open("versions.json", "a").write("\n")
PY

git add -A
git commit -m "$MESSAGE"
git tag "$VERSION"
git push origin HEAD
git push origin "$VERSION"
gh release create "$VERSION" main.js manifest.json styles.css --title "$VERSION" --notes "$MESSAGE"
echo "Version $VERSION publiée : BRAT la distribuera aux coffres au prochain démarrage."
