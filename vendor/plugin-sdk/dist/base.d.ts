/**
 * OpenClimePlugin — base class third-party plugins extend.
 *
 * A plugin is a container of typed extension points contributed from `onload()`
 * against the injected `app` (PluginHost). Mirrors Obsidian's `Plugin` class:
 * `onload()` registers contributions; `onunload()` cleans up (registered
 * cleanups also auto-run). Per-plugin storage via `loadData`/`saveData`.
 *
 * Extends {@link Component}, so a plugin can own child components and register
 * DOM listeners / intervals that tear down with it (Obsidian parity —
 * `Plugin extends Component`).
 *
 * Authors build `main.js` (ESM) default-exporting a subclass; the loader
 * (`loader.ts`) instantiates it as `new Impl(manifest, host)` then awaits
 * `onload()`.
 */
import { Component, type RegisteredCleanup } from "./component";
import type { PluginMigration } from "./node-v2";
import type { PluginHost, PluginManifest, UICommand, UIContextMenuItem, UIPanel, UIShortcut, UIToolbarButton } from "./host";
import type { SettingTab } from "./settings";
export declare abstract class OpenClimePlugin extends Component {
    readonly manifest: PluginManifest;
    /** The host API (`app.*`). Injected by the loader before `onload()`. */
    protected readonly app: PluginHost;
    /**
     * This plugin's settings object. Assign it in `onload()` — normally
     * `this.settings = await this.loadSettings(DEFAULTS)`. `PluginSettingTab`
     * reads and writes it.
     */
    settings?: unknown;
    /**
     * Plugin-level version migrations (§41). Declared against the MANIFEST
     * version: the host compares the previously-recorded manifest version with
     * the current one before `onload()`, runs every matching `PluginMigration`
     * in declaration order, then records the new version as the baseline. A
     * plugin whose settings / `app.storage` shape changed between releases
     * declares a migration here so existing users' data is rewritten before
     * the new code reads it.
     */
    migrations?: PluginMigration[];
    constructor(manifest: PluginManifest, app: PluginHost);
    /** Register extension-point contributions. Called once on enable. */
    abstract onload(): void | Promise<void>;
    /** Optional cleanup beyond registered callbacks. Called on disable/hot-reload. */
    onunload(): void;
    /** Per-plugin persistent data (Obsidian parity). */
    loadData<T = unknown>(): Promise<T | null>;
    saveData(data: unknown): Promise<void>;
    /**
     * Load this plugin's settings, filling in whatever the stored object is
     * missing from `defaults`, and assign the result to `this.settings`.
     *
     * Shallow merge, matching Obsidian's conventional
     * `Object.assign({}, DEFAULTS, await this.loadData())`. Nested objects are
     * replaced wholesale rather than deep-merged — a deep merge would make it
     * impossible for a user to drop a key that exists in a nested default.
     */
    loadSettings<T extends object>(defaults: T): Promise<T>;
    /** Persist `this.settings`. Paired with {@link loadSettings}. */
    saveSettings(): Promise<void>;
    /**
     * Register a cleanup callback — auto-run on unload.
     *
     * Overridden to forward to the host instead of `Component`'s own stack: the
     * runtime owns the plugin's cleanup list (it drains that list in `disable`
     * even when the instance is dropped), so it stays the single source of
     * truth. Child components still tear down through `Component`.
     */
    register(cb: RegisteredCleanup): void;
    /**
     * Namespace a contribution id with this plugin's id.
     *
     * `uiRegistry.unregisterPlugin` strips registrations by `<pluginId>:` prefix
     * on disable, so an unprefixed id leaves a zombie entry in the command
     * palette / toolbar / settings sidebar. Doing it here means an author cannot
     * get it wrong (Obsidian prefixes `Plugin.addCommand` ids for the same
     * reason). Already-prefixed ids pass through, so double-prefixing can't
     * happen either.
     */
    protected prefixId(id: string): string;
    /**
     * Register a settings tab. Fills `id` (prefixed) and `label` (the manifest
     * name) when the tab does not set them itself, and primes `settingItems` so
     * the sidebar entry renders on first open without waiting for an update.
     */
    addSettingTab(tab: SettingTab): SettingTab;
    /** Register a command in the palette (Cmd+K). Returns the prefixed command. */
    addCommand(command: UICommand): UICommand;
    /** Add a button to the canvas toolbar. */
    addToolbarButton(button: UIToolbarButton): UIToolbarButton;
    /** Add a side panel. */
    addPanel(panel: UIPanel): UIPanel;
    /** Add an item to the canvas right-click menu. */
    addContextMenuItem(item: UIContextMenuItem): UIContextMenuItem;
    /** Register a global keyboard shortcut. */
    addShortcut(shortcut: UIShortcut): UIShortcut;
    /**
     * Register the floating toolbar / prompt bar for one or more node types
     * (Part B). Node types are NOT auto-prefixed — unlike command or panel
     * ids, a node type is the same string you passed to
     * `canvas.registerNodeDef`, and rewriting it here would silently fail to
     * match. Prefix it yourself when you declare the node.
     *
     * Exists so every contribution has one `this.addXxx()` shape; the raw
     * `this.app.registerNodeUI` remains available.
     */
    addNodeUI(types: Iterable<string>, contribution: {
        toolbar?: import("./node-ui").NodeToolbarItem[];
        promptBar?: import("./node-ui").NodePromptBarDef;
    }): void;
}
/** What a built plugin module default-exports. */
export type PluginConstructor = new (manifest: PluginManifest, app: PluginHost) => OpenClimePlugin;
//# sourceMappingURL=base.d.ts.map