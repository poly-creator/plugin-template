// Bundle config — the built artifact shape the desktop expects.
//
// The desktop serves plugin main.js over the `polycreator-plugin://` protocol and
// dynamic-import()s it at runtime, so the output MUST be a single ESM file named
// main.js (no code splitting, no IIFE). The SDK is inlined into the bundle — the
// zip ships standalone, no node_modules resolution on the user's machine.
export default {
	input: "src/index.ts",
	output: {
		dir: ".",
		entryFileNames: "main.js",
		format: "esm",
	},
};
