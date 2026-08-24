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
import { Component } from "./component";
export class OpenClimePlugin extends Component {
    manifest;
    /** The host API (`app.*`). Injected by the loader before `onload()`. */
    app;
    /**
     * This plugin's settings object. Assign it in `onload()` — normally
     * `this.settings = await this.loadSettings(DEFAULTS)`. `PluginSettingTab`
     * reads and writes it.
     */
    settings;
    /**
     * Plugin-level version migrations (§41). Declared against the MANIFEST
     * version: the host compares the previously-recorded manifest version with
     * the current one before `onload()`, runs every matching `PluginMigration`
     * in declaration order, then records the new version as the baseline. A
     * plugin whose settings / `app.storage` shape changed between releases
     * declares a migration here so existing users' data is rewritten before
     * the new code reads it.
     */
    migrations;
    constructor(manifest, app) {
        super();
        this.manifest = manifest;
        this.app = app;
        // A plugin instance is live from construction: the loader instantiates it
        // and calls `onload()` directly, with no separate `Component.load()` step.
        // Marking it loaded here is what makes `addChild` load its children
        // immediately instead of silently deferring forever.
        this._loaded = true;
        // The runtime calls `instance.onunload()` itself and then drains the host
        // cleanup stack (registry.ts `disable`), so hand it `teardown()` — child
        // components, DOM listeners and intervals — rather than `unload()`, which
        // would run `onunload()` a second time.
        this.app.registerCleanup(() => {
            this._loaded = false;
            this.teardown();
        });
    }
    /** Optional cleanup beyond registered callbacks. Called on disable/hot-reload. */
    onunload() { }
    // ── Storage ───────────────────────────────────────────────────────────────
    /** Per-plugin persistent data (Obsidian parity). */
    loadData() {
        return this.app.storage.load();
    }
    saveData(data) {
        return this.app.storage.save(data);
    }
    /**
     * Load this plugin's settings, filling in whatever the stored object is
     * missing from `defaults`, and assign the result to `this.settings`.
     *
     * Shallow merge, matching Obsidian's conventional
     * `Object.assign({}, DEFAULTS, await this.loadData())`. Nested objects are
     * replaced wholesale rather than deep-merged — a deep merge would make it
     * impossible for a user to drop a key that exists in a nested default.
     */
    async loadSettings(defaults) {
        const stored = await this.loadData();
        // No `?? {}` — spreading null/undefined is already a no-op.
        const merged = { ...defaults, ...stored };
        this.settings = merged;
        return merged;
    }
    /** Persist `this.settings`. Paired with {@link loadSettings}. */
    saveSettings() {
        return this.saveData(this.settings ?? {});
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    /**
     * Register a cleanup callback — auto-run on unload.
     *
     * Overridden to forward to the host instead of `Component`'s own stack: the
     * runtime owns the plugin's cleanup list (it drains that list in `disable`
     * even when the instance is dropped), so it stays the single source of
     * truth. Child components still tear down through `Component`.
     */
    register(cb) {
        this.app.registerCleanup(cb);
    }
    // ── Contribution helpers ──────────────────────────────────────────────────
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
    prefixId(id) {
        const prefix = `${this.manifest.id}:`;
        return id.startsWith(prefix) ? id : `${prefix}${id}`;
    }
    /**
     * Register a settings tab. Fills `id` (prefixed) and `label` (the manifest
     * name) when the tab does not set them itself, and primes `settingItems` so
     * the sidebar entry renders on first open without waiting for an update.
     */
    addSettingTab(tab) {
        tab.id = this.prefixId(tab.id ?? "settings");
        tab.label ??= this.manifest.name;
        tab.update();
        this.app.ui.registerSettingsTab(tab);
        return tab;
    }
    /** Register a command in the palette (Cmd+K). Returns the prefixed command. */
    addCommand(command) {
        const prefixed = { ...command, id: this.prefixId(command.id) };
        this.app.ui.registerCommand(prefixed);
        return prefixed;
    }
    /** Add a button to the canvas toolbar. */
    addToolbarButton(button) {
        const prefixed = { ...button, id: this.prefixId(button.id) };
        this.app.ui.registerToolbarButton(prefixed);
        return prefixed;
    }
    /** Add a side panel. */
    addPanel(panel) {
        const prefixed = { ...panel, id: this.prefixId(panel.id) };
        this.app.ui.registerPanel(prefixed);
        return prefixed;
    }
    /** Add an item to the canvas right-click menu. */
    addContextMenuItem(item) {
        const prefixed = { ...item, id: this.prefixId(item.id) };
        this.app.ui.registerContextMenu(prefixed);
        return prefixed;
    }
    /** Register a global keyboard shortcut. */
    addShortcut(shortcut) {
        const prefixed = { ...shortcut, id: this.prefixId(shortcut.id) };
        this.app.ui.registerShortcut(prefixed);
        return prefixed;
    }
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
    addNodeUI(types, contribution) {
        this.app.registerNodeUI(types, contribution);
    }
}
//# sourceMappingURL=base.js.map