# OpenClime Plugin Template

Template for building an OpenClime plugin and distributing it via GitHub
Releases. Use the **Use this template** button to start a new plugin repo.

## What you get

- A minimal SDK plugin (toolbar button + palette command + persistent data)
- A rolldown build that bundles `src/index.ts` → `main.js` (ESM — the shape
  the desktop serves via `openclime-plugin://` and dynamic-imports)
- A release workflow: `git tag v*` → build → pack zip → GitHub Release →
  provenance attestation

## Three steps to your first release

```bash
# 1. Edit manifest.json — REPLACE every "TEMPLATE-REPLACE":
#      id:     reverse-DNS, e.g. "com.example.my-plugin" (letters/digits/._:-)
#      name:   display name
#      version: numeric X.Y.Z (start at 0.1.0)
#    Also update src/index.ts (same id/name) and this README.

pnpm install
pnpm dev          # build once + watch

# 2. Build + verify the zip locally
pnpm build
npx openclime-plugin-pack . --check   # validate only
npx openclime-plugin-pack . --out dist

# 3. Tag and push — CI builds, packs, and creates the Release
git tag v0.1.0
git push origin v0.1.0
```

## After the release: publish to the registry

1. Open a PR to the [`openclime/plugins`](https://github.com/openclime/plugins)
   registry repo adding a `plugins.json` entry for your release.
2. The `sha256` value printed in the release workflow log goes into the entry.
3. Registry CI re-verifies the schema, the hash, the manifest, and that the
   PR only adds entries — then a human reviews the code (REVIEW.md).

See the registry repo's README for the exact entry format.

## Plugin id rules

- One safe path segment: `[A-Za-z0-9._:-]+`, no `..`, no separators
- Keep it unique across the registry — CI rejects duplicates
- Reverse-DNS (`com.example.my-plugin`) is the convention

## License

MIT