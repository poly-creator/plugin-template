# PolyCreator Plugin Template

Template for building a PolyCreator plugin and distributing it via GitHub
Releases. Use the **Use this template** button to start a new plugin repo.

## What you get

- A minimal SDK plugin: toolbar button + palette command + persistent data
  (`loadData`/`saveData`) + a plain-DOM `Modal` dialog — no React needed
- A rolldown build that bundles `src/index.ts` → `main.js` (ESM — the shape the
  desktop serves over `polycreator-plugin://` and dynamic-imports)
- `npm run pack`: validates your manifest against the marketplace schema, hashes
  the executable entries the way the app's install gate does, and writes the
  three release assets — the versioned zip, the byte-identical `<id>.zip` alias,
  and the `manifest.json` alias the app's version probe fetches
- A release workflow: `git tag v*` → build → pack → GitHub Release with all three
  assets, the sha256 in the notes, and build provenance attestation
- Dependencies come from npm: `@polycreator/plugin-sdk` and
  `@polycreator/plugin-manifest` (the SDK is inlined into your bundle at build
  time; nothing is vendored here)
- The API guides live with the SDK:
  [plugin settings](https://github.com/poly-creator/plugin-sdk/blob/main/docs/plugin-settings.md)
  (declarative tabs and controls) and
  [plugin node UI](https://github.com/poly-creator/plugin-sdk/blob/main/docs/plugin-node-ui.md)
  (the floating toolbar and composer above/below a node)

## Three steps to your first release

```bash
# 1. Edit manifest.json — REPLACE every "TEMPLATE-REPLACE":
#      id:      reverse-DNS, e.g. "com.example.my-plugin" (letters/digits/._:-)
#      name:    display name
#      version: numeric X.Y.Z (start at 0.1.0)
#    Also update src/index.ts (same id/name) and this README,
#    and package.json "name" if you care.

npm install

# 2. Build + verify the archive locally
npm run build
npm run pack:check   # validate the manifest + entries, write nothing
npm run pack         # release/<id>-<version>.zip + <id>.zip + manifest.json

# 3. Tag and push — CI builds, packs, and creates the full Release
git add -A && git commit -m "chore: first release"
git tag v0.1.0
git push origin main --tags
```

The release must stay **full** (not draft, not prerelease) — `releases/latest`
ignores those, so the alias URLs would 404.

## What `npm run pack` checks, and why

The app installs a plugin only after a fixed sequence of gates, so this script
runs the same computation rather than a lookalike:

| Gate | Where it comes from |
|---|---|
| manifest matches the marketplace schema | `MARKETPLACE_MANIFEST_SCHEMA` from `@polycreator/plugin-manifest` |
| `id` is one safe path segment | `isSafePluginId` |
| `integrity` = SHA-256 over `[main, nodeEntry?]` in declaration order | `digestEntryFiles` — the same function the app's install gate uses |
| `manifest.json` sits at the archive **root** | the app requires it there (nothing is wrapped in a folder) |

If you hand-roll packing, keep the hash order and the root layout: a different
order — or one extra file mixed into the hash — produces a digest the app
rejects, and the failure shows up only on a user's machine.

## After the release: publish to the registry

1. Open a PR to the plugin registry adding a `plugins.json` entry:

   ```json
   {
     "id": "com.example.my-plugin",
     "name": "My Plugin",
     "author": "your-github-login",
     "repo": "you/your-plugin-repo",
     "description": "One line on what it does",
     "categories": ["utility"],
     "added_at": "2026-08-26T00:00:00Z"
   }
   ```

   No tag, no sha256 — **latest mode**. Users always install your newest full
   release; trust = PR review + the integrity hash baked into the zip.
2. Registry CI re-verifies: the repo exists, the latest release carries both
   alias assets, the alias manifest matches the zip's manifest byte for byte,
   and the PR only touches entries you own — then a human reviews the code.
3. New versions need NO registry PR — just tag `v*` again.

Optionally pin a specific release byte-for-byte by adding BOTH `tag`
(`"v0.1.0"`) and `sha256` (from the release notes) to the entry. Both or
neither — CI rejects half a pin.

## Plugin id rules

- One safe path segment: `[A-Za-z0-9._:-]+`, no `..`, no separators
- Keep it unique across the registry — CI rejects duplicates
- Reverse-DNS (`com.example.my-plugin`) is the convention
- One plugin per repo — the `<id>.zip` alias convention assumes it

## Working locally against the app

You do not need a release to test: build, then copy `manifest.json` + `main.js`
into the app's plugin folder and restart it.

```bash
npm run build
# macOS
cp manifest.json main.js "$HOME/Library/Application Support/PolyCreator/plugins/<your-id>/"
```

The app loads a plugin from `plugins/<your-id>/` and serves its `main.js` over
`polycreator-plugin://`, so this is the same code path an installed release uses
(minus the download). Keep the folder name equal to your manifest `id`.

## PolyCreator

The desktop app this template targets: **https://polycreator.si** — download it
there, or read the [author guide](https://polycreator.si/docs/publish) and the
[help center](https://polycreator.si/help).

## License

MIT
