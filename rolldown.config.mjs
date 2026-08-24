// Bundle config — aligns with the official examples' built-artifact shape.
//
// The desktop serves plugin main.js via the `openclime-plugin://` protocol
// and dynamic-import()s it at runtime, so the output MUST be a single ESM
// file named main.js (no code splitting, no IIFE). The SDK is inlined into
// the bundle — the zip ships standalone, no node_modules resolution.
export default {
	input: "src/index.ts",
	output: {
		dir: ".",
		entryFileNames: "main.js",
		format: "esm",
	},
};
