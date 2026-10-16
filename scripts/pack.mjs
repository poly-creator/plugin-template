#!/usr/bin/env node
/**
 * Pack this plugin into the archive the desktop installs.
 *
 * Runs the same computation the app's install gate runs, using the published
 * package for it rather than a copy of the logic (`digestEntryFiles` is the
 * single source of truth for the entry-file hash — a divergent order or an extra
 * file silently produces a digest the app will reject):
 *
 *   1. validate manifest.json against the marketplace schema
 *   2. refuse a manifest that still carries the template placeholders
 *   3. hash the executable entries: [main, nodeEntry?] in declaration order
 *   4. write the manifest with `integrity` injected, zip it with the entries at
 *      the archive ROOT (the app requires manifest.json at the root)
 *   5. emit the three assets a release needs — the versioned zip, the
 *      byte-identical `<id>.zip` alias, and the manifest alias the app's version
 *      probe fetches — and print their paths + the zip's sha256 as JSON
 *
 * `npm run pack:check` does 1–3 and stops: cheap enough to run before tagging.
 */
import { createHash } from "node:crypto";
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	MARKETPLACE_MANIFEST_SCHEMA,
	digestEntryFiles,
	entryFileOrder,
	isSafePluginId,
} from "@polycreator/plugin-manifest";
import yazl from "yazl";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const checkOnly = process.argv.includes("--check");
const fail = (message) => {
	console.error(`pack: ${message}`);
	process.exit(1);
};

const manifestPath = join(ROOT, "manifest.json");
if (!existsSync(manifestPath)) fail("manifest.json is missing");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

// 1. The same schema the marketplace upload pipeline and the registry validator
//    use, so a manifest that packs is a manifest that can be published.
const parsed = MARKETPLACE_MANIFEST_SCHEMA.safeParse(manifest);
if (!parsed.success) {
	fail(`manifest.json does not match the marketplace schema:\n${JSON.stringify(parsed.error.issues, null, 2)}`);
}

// 2. A placeholder id/name would ship under "TEMPLATE-REPLACE".
const placeholders = ["id", "name"].filter((key) => String(manifest[key]).includes("TEMPLATE-REPLACE"));
if (placeholders.length > 0) {
	fail(`replace the TEMPLATE-REPLACE placeholder(s) first: ${placeholders.join(", ")} (manifest.json)`);
}

// 3. safe-id: one path segment, no separators, charset only — the app refuses
//    anything else before it looks at the contents.
if (!isSafePluginId(manifest.id)) {
	fail(`"${manifest.id}" is not a safe plugin id (single path segment, [A-Za-z0-9._:-], no "..")`);
}

const entries = entryFileOrder(manifest);
const entryBytes = new Map();
for (const entry of entries) {
	const path = join(ROOT, entry);
	if (!existsSync(path)) fail(`${entry} is missing — run \`npm run build\` first`);
	entryBytes.set(entry, new Uint8Array(readFileSync(path)));
}

const integrity = await digestEntryFiles(manifest, entryBytes);
const packaged = { ...manifest, integrity };

if (checkOnly) {
	console.log(`pack: OK — ${manifest.id}@${manifest.version}, integrity ${integrity}`);
	console.log(`pack: entries ${entries.join(", ")}`);
	process.exit(0);
}

// 4. Stage exactly what ships (manifest + entries), then zip from there: the
//    archive is the install directory, so anything extra here would be installed.
const staging = join(ROOT, ".pack-staging");
rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });
writeFileSync(join(staging, "manifest.json"), `${JSON.stringify(packaged, null, "\t")}\n`);
for (const entry of entries) {
	const target = join(staging, entry);
	mkdirSync(dirname(target), { recursive: true });
	copyFileSync(join(ROOT, entry), target);
}

const releaseDir = join(ROOT, "release");
rmSync(releaseDir, { recursive: true, force: true });
mkdirSync(releaseDir, { recursive: true });

const versionedZip = join(releaseDir, `${manifest.id}-${manifest.version}.zip`);
const aliasZip = join(releaseDir, `${manifest.id}.zip`);
const aliasManifest = join(releaseDir, "manifest.json");

const zip = new yazl.ZipFile();
zip.addFile(join(staging, "manifest.json"), "manifest.json");
for (const entry of entries) zip.addFile(join(staging, entry), entry);
await new Promise((resolve, reject) => {
	zip.outputStream.pipe(createWriteStream(versionedZip)).on("close", resolve).on("error", reject);
	zip.end();
});

copyFileSync(versionedZip, aliasZip);
writeFileSync(aliasManifest, readFileSync(join(staging, "manifest.json")));
rmSync(staging, { recursive: true, force: true });

const sha256 = createHash("sha256").update(readFileSync(versionedZip)).digest("hex");

// The release workflow reads this summary; keep the keys stable.
console.log(
	JSON.stringify(
		{
			id: manifest.id,
			version: manifest.version,
			integrity,
			zip: `${manifest.id}-${manifest.version}.zip`,
			aliasZip: `${manifest.id}.zip`,
			aliasManifest: "manifest.json",
			sha256,
		},
		null,
		"\t",
	),
);
