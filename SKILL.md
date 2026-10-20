---
name: polycreator-plugin
description: Scaffold, build, and release a PolyCreator desktop plugin from the plugin-template repo. Use when the user wants to create a plugin, add a canvas node, add a toolbar button or palette command, persist plugin data, or publish a plugin to the PolyCreator marketplace.
---

# Build a PolyCreator plugin

You are working inside a repo created from `poly-creator/plugin-template`
(**one plugin = one repo**). The desktop app runs `main.js` over
`polycreator-plugin://`; the SDK is bundled at build time, so the zip is
self-contained. No React needed — plain DOM plus the declarative SDK.

## 0. Orient (read before writing code)

- `manifest.json` — replace every `TEMPLATE-REPLACE`. `id` is reverse-DNS
  (e.g. `com.example.my-plugin`), immutable after listing, and must equal
  the install folder name. `version` is numeric `X.Y.Z`, start at `0.1.0`.
- `src/index.ts` — the minimal entry: toolbar button (`addToolbarButton`),
  palette command (`addCommand`), persistent data (`loadData`/`saveData`),
  one plain-DOM `Modal` subclass. Same `id`/`name` as the manifest.
- API guides (in `@polycreator/plugin-sdk` docs): plugin settings
  (declarative tabs/controls) and plugin node UI (floating toolbar,
  composer above/below a node). Read the one matching the task.

## 1. Build and verify locally

```bash
npm install
npm run build
npm run pack:check   # validate manifest + entries, write nothing
npm run pack         # release/<id>-<version>.zip + <id>.zip + manifest.json
```

Never hand-roll the zip: `pack` computes `integrity` (SHA-256 over
`[main, nodeEntry?]` in declaration order) with the same function the app's
install gate uses. A different order or an extra hashed file fails only on
the user's machine. `manifest.json` must sit at the archive root.

Local test without a release: copy `manifest.json` + `main.js` into the
app's plugin folder and restart (folder name = manifest `id`):

```bash
# macOS
cp manifest.json main.js "$HOME/Library/Application Support/PolyCreator/plugins/<your-id>/"
```

## 2. Release (GitHub)

```bash
git add -A && git commit -m "chore: first release"
git tag v0.1.0
git push origin main --tags
```

The `v*` tag triggers CI: build → pack → full GitHub Release with all
three assets, sha256 in the notes, provenance attestation. The release must
stay **full** — draft/prerelease is invisible to `releases/latest`, so the
alias URLs 404. New versions: just tag again, no registry PR.

## 3. Register in the marketplace (once)

PR against `poly-creator/plugins`, adding to `plugins.json`:

```json
{
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "author": "your-github-login",
  "repo": "you/your-plugin-repo",
  "description": "One line on what it does",
  "categories": ["utility"]
}
```

No `tag`/`sha256` = latest mode (recommended): users always get the newest
full release; trust = PR review + the in-zip integrity hash. Pinned mode =
both `tag` and `sha256` together, never one alone. Registry CI re-verifies
(repo exists, alias assets present, alias manifest byte-identical to the
zip's, entries you own only), then a human reviews.

## Rules that reject

- `id`: one safe path segment `[A-Za-z0-9._:-]+`, unique across the registry.
- `trust: trusted` (nodeEntry, main-process access) gets stricter review;
  prefer `safe` (canvas only) unless you need the host.
- zip ≤ 30 MiB; no path traversal (`../`, absolute paths).
- `minAppVersion`: bump when you use newer SDK APIs.
