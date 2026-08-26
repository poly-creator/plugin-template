# OpenClime Plugin Template

Template for building an OpenClime plugin and distributing it via GitHub
Releases. Use the **Use this template** button to start a new plugin repo.

## What you get

- A minimal SDK plugin: toolbar button + palette command + persistent data
  (`loadData`/`saveData`) + a plain-DOM `Modal` dialog — no React needed
- A rolldown build that bundles `src/index.ts` → `main.js` (ESM — the shape
  the desktop serves via `openclime-plugin://` and dynamic-imports)
- A release workflow: `git tag v*` → build → pack → GitHub Release with
  **three assets** — the versioned zip, the byte-identical `<id>.zip` alias,
  and the `manifest.json` alias (the desktop's version probe) — plus sha256
  in the notes and provenance attestation
- `vendor/` carries the SDK + pack CLI as `file:` deps (the `@openclime`
  npm scope is not published yet; once it is, swap each `file:./vendor/*`
  line in package.json to a normal version spec)

## Three steps to your first release

```bash
# 1. Edit manifest.json — REPLACE every "TEMPLATE-REPLACE":
#      id:     reverse-DNS, e.g. "com.example.my-plugin" (letters/digits/._:-)
#      name:   display name
#      version: numeric X.Y.Z (start at 0.1.0)
#    Also update src/index.ts (same id/name) and this README.
#    And package.json "name" if you care.

npm install

# 2. Build + verify the zip locally
npm run build
npm run pack:check   # validate only, no zip written
npm run pack         # release/<id>-<version>.zip + <id>.zip + manifest.json

# 3. Tag and push — CI builds, packs, and creates the full Release
git add -A && git commit -m "chore: first release"
git tag v0.1.0
git push origin main --tags
```

The release must stay **full** (not draft, not prerelease) —
`releases/latest` ignores those, so the alias URLs would 404.

## After the release: publish to the registry

1. Open a PR to the [`bingryan/plugins`](https://github.com/bingryan/plugins)
   registry repo adding a `plugins.json` entry:

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

   No tag, no sha256 — **latest mode**. Users always install your newest
   full release; trust = PR review + the integrity hash baked into the zip.
2. Registry CI re-verifies: repo exists, the latest release carries both
   alias assets, the alias manifest matches the zip's manifest byte for
   byte, and the PR only touches entries you own — then a human reviews the
   code (REVIEW.md).
3. New versions need NO registry PR — just tag `v*` again.

Optionally pin a specific release byte-for-byte by adding BOTH `tag`
(`"v0.1.0"`) and `sha256` (from the release notes) to the entry. Both or
neither — CI rejects half a pin.

See the registry repo's README for the full entry format.

## Plugin id rules

- One safe path segment: `[A-Za-z0-9._:-]+`, no `..`, no separators
- Keep it unique across the registry — CI rejects duplicates
- Reverse-DNS (`com.example.my-plugin`) is the convention
- One plugin per repo — the `<id>.zip` alias convention assumes it

## License

MIT
