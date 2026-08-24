# OpenClime Plugin Template

Template for building an OpenClime plugin and distributing it via GitHub
Releases. Use the **Use this template** button to start a new plugin repo.

## What you get

- A minimal SDK plugin: toolbar button + palette command + persistent data
  (`loadData`/`saveData`) + a plain-DOM `Modal` dialog — no React needed
- A rolldown build that bundles `src/index.ts` → `main.js` (ESM — the shape
  the desktop serves via `openclime-plugin://` and dynamic-imports)
- A release workflow: `git tag v*` → build → pack zip → GitHub Release →
  sha256 in the release notes → provenance attestation
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
npm run pack         # write release/<id>-<version>.zip, print sha256

# 3. Tag and push — CI builds, packs, and creates the Release
git add -A && git commit -m "chore: first release"
git tag v0.1.0
git push origin main --tags
```

## After the release: publish to the registry

1. Open a PR to the [`bingryan/plugins`](https://github.com/bingryan/plugins)
   registry repo adding a `plugins.json` entry for your release.
2. The `sha256` printed by the release workflow (and in the Release notes)
   goes into the entry.
3. Registry CI re-verifies the schema, the hash over the downloaded bytes,
   the manifest, and that the PR only touches entries you own — then a human
   reviews the code (REVIEW.md).

See the registry repo's README for the exact entry format.

## Plugin id rules

- One safe path segment: `[A-Za-z0-9._:-]+`, no `..`, no separators
- Keep it unique across the registry — CI rejects duplicates
- Reverse-DNS (`com.example.my-plugin`) is the convention

## License

MIT
