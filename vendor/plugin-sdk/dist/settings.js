/** Narrowing helper — groups are the entries carrying `type: "group"`. */
export function isSettingGroup(item) {
    return item.type === "group";
}
/** Narrowing helper — lists are the entries carrying `type: "list"`. */
export function isSettingList(item) {
    return item.type === "list";
}
/** Resolve a `boolean | (() => boolean)` predicate, defaulting when absent. */
export function resolvePredicate(p, fallback) {
    if (p === undefined)
        return fallback;
    return typeof p === "function" ? p() : p;
}
// ── Tabs ────────────────────────────────────────────────────────────────────
/**
 * Base class for a settings tab. Plugins extend {@link PluginSettingTab}
 * (which binds storage to `plugin.settings`); this class exists for tabs that
 * own their storage entirely.
 */
export class SettingTab {
    /**
     * Sidebar entry id. Normally left unset — `OpenClimePlugin.addSettingTab`
     * fills it with `<pluginId>:settings` (or `<pluginId>:<id>` when the tab
     * declares one), which is also what `unregisterPlugin` matches on teardown.
     */
    id;
    /** Sidebar entry label. Defaults to the plugin's manifest name. */
    label;
    /** Lucide icon name shown in the settings sidebar. */
    icon;
    app;
    /** Cached result of the last `update()`. The renderer reads this. */
    settingItems = [];
    /**
     * Notifies the host that this tab's definitions changed. Injected by the
     * host when the tab is registered; a tab constructed but never registered
     * has no listener, so `update()` is a pure cache refresh.
     */
    onChanged;
    /**
     * Subscribers notified when the data behind this tab changed externally —
     * typically because another window called `setControlValue` and the
     * main process broadcast `openclime:plugin:data-changed`. The renderer-side
     * bridge calls this on every tab whose plugin's settings changed.
     */
    dataChangeListeners = new Set();
    constructor(app) {
        this.app = app;
    }
    /** Override to declare this tab's settings. */
    getSettingDefinitions() {
        return [];
    }
    /**
     * Recompute `settingItems` and ask the host to re-render. Call after
     * mutating state that `visible`/`disabled` predicates read, or when the set
     * of definitions itself changes.
     */
    update() {
        this.settingItems = this.getSettingDefinitions();
        this.onChanged?.();
    }
    /**
     * Re-evaluate `visible`/`disabled` predicates without rebuilding the
     * definitions array. Cheaper than `update()` for the common case where
     * data changed (cross-window sync, secret save) but the set of rows is
     * the same. The renderer caches `settingItems` by reference, so leaving
     * it alone lets React skip the per-item reconcile path; the parent's
     * notify-listener still re-runs the predicates on each `DefinitionView`.
     */
    refreshDomState() {
        this._notifyDataChanged();
    }
    /** Read the current value for a control key. */
    getControlValue(key) {
        void key;
        return undefined;
    }
    /** Persist a new value for a control key. */
    setControlValue(key, value) {
        void key;
        void value;
    }
    /**
     * Called when another window changed this tab's backing storage (A2.1).
     * Default: bump the renderer (re-read `getControlValue` + re-run
     * `visible`/`disabled` predicates). Override for tabs whose source of
     * truth is not the in-memory `plugin.settings` — typically to re-fetch from
     * a network store.
     */
    refresh() {
        this._notifyDataChanged();
    }
    /** Called when the tab is hidden. Override to release resources. */
    hide() { }
    /**
     * Host-internal: wire the re-render notifier. Not part of the plugin-facing
     * contract.
     * @internal
     */
    _setChangeListener(fn) {
        this.onChanged = fn;
    }
    /**
     * Subscribe to external data changes (other windows writing this tab's
     * settings). Returns an unsubscribe. The host invokes these after
     * `openclime:plugin:data-changed` broadcasts.
     */
    onDataChange(listener) {
        this.dataChangeListeners.add(listener);
        return () => {
            this.dataChangeListeners.delete(listener);
        };
    }
    /** @internal — host calls this on every `data-changed` for this tab. */
    _notifyDataChanged() {
        this.dataChangeListeners.forEach((fn) => fn());
    }
}
/**
 * A settings tab backed by `plugin.settings`. Reads and writes that object and
 * persists via `plugin.saveSettings()`. Override `getControlValue`/
 * `setControlValue` to bind a different data source.
 */
export class PluginSettingTab extends SettingTab {
    plugin;
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
    }
    getControlValue(key) {
        const settings = this.plugin.settings;
        return settings?.[key];
    }
    setControlValue(key, value) {
        // Create the bag if the plugin never called loadSettings(). Writing to a
        // missing `settings` would otherwise throw and lose the user's edit.
        if (!this.plugin.settings || typeof this.plugin.settings !== "object") {
            this.plugin.settings = {};
        }
        this.plugin.settings[key] = value;
        return this.plugin.saveSettings();
    }
    /**
     * A2.1 cross-window sync: when another window wrote this tab's data, the
     * host calls `refresh()`. The default asks the owner's `loadSettings` (if
     * available) to re-pull from disk and refresh the in-memory bag, so this
     * window sees the new value on the next render. Plugins that customise
     * `getControlValue` should override this too.
     */
    refresh() {
        if (typeof this.plugin.loadSettings !== "function") {
            super.refresh();
            return;
        }
        const defaults = (this.plugin.settings ?? {});
        void Promise.resolve(this.plugin.loadSettings(defaults)).then((next) => {
            // `OpenClimePlugin.loadSettings` reassigns `this.settings` itself; a
            // custom owner that omits that step leaves the bag untouched. Cover
            // both: assign whenever the return value is a plain object.
            if (next && typeof next === "object") {
                this.plugin.settings = next;
            }
            super.refresh();
        });
    }
}
//# sourceMappingURL=settings.js.map