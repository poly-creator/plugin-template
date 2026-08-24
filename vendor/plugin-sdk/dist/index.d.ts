/**
 * @openclime/plugin-sdk — types + base class for third-party OpenClime plugins.
 * See docs/superpowers/specs/2026-07-31-plugin-system-design.md.
 *
 * This barrel is RENDERER-FACING: `component.ts` types `registerDomEvent`
 * against the DOM lib, so importing it from electron main (which compiles
 * with `lib: ["ES2023"]`) fails. Main-process code should import the narrow
 * subpath it actually needs — `@openclime/plugin-sdk/ai` for the AI types.
 */
export * from "./host";
export * from "./ai";
export * from "./settings";
export * from "./modal";
export * from "./menu";
export * from "./node-ui";
export * from "./node-v2";
export * from "./voice";
export * from "./icons";
export { Component, type RegisteredCleanup } from "./component";
export { OpenClimePlugin, type PluginConstructor } from "./base";
//# sourceMappingURL=index.d.ts.map