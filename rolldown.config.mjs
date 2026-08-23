// Bundle config — aligns with the official examples' built-artifact shape.
//
// The desktop serves plugin main.js via the `openclime-plugin://` protocol
// and dynamic-import()s it at runtime, so the output MUST be a single ESM
// file named main.js (no code splitting, no IIFE). The SDK is inlined into
// the bundle — the zip ships standalone, no node_modules resolution.
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	input: "src/index.ts",
	output: {
		dir: ".",
		entryFileNames: "main.js",
		format: "esm",
	},
	resolve: {
		alias: {
			// The published SDK resolves normally from node_modules; this alias
			// only matters for local dev against a monorepo checkout.
			"@openclime/plugin-sdk": path.resolve(
				__dirname,
				"node_modules/@openclime/plugin-sdk/dist/index.js",
			),
		},
	},
};