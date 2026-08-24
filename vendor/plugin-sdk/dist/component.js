export class Component {
    /**
     * Whether `load()` has run and `unload()` has not. Protected rather than
     * private because `OpenClimePlugin` is constructed already-live by the loader
     * (there is no separate `load()` call in the plugin lifecycle) and has to
     * set it directly — otherwise `addChild` would refuse to load children.
     */
    _loaded = false;
    children = [];
    cleanups = [];
    /** Load this component and its children. Idempotent. */
    load() {
        if (this._loaded)
            return;
        this._loaded = true;
        this.onload();
        for (const child of this.children)
            child.load();
    }
    /** Override to initialise. Called once by `load()`. */
    onload() { }
    /**
     * Unload this component: `onunload()`, then every registered cleanup and
     * child. Idempotent — teardown clears its own bookkeeping as it goes.
     */
    unload() {
        if (!this._loaded)
            return;
        this._loaded = false;
        this.onunload();
        this.teardown();
    }
    /** Override to clean up beyond what `register*` already covers. */
    onunload() { }
    /**
     * Run every registered cleanup + unload every child, WITHOUT calling
     * `onunload()`.
     *
     * Exists because the plugin runtime already calls `instance.onunload()`
     * itself before draining the host cleanup stack (registry.ts `disable`), so
     * a plugin routes its teardown here to avoid running `onunload()` twice.
     * Safe to call repeatedly: both lists are drained, not just iterated.
     */
    teardown() {
        // Reverse order: later registrations often depend on earlier ones.
        const cleanups = this.cleanups;
        this.cleanups = [];
        for (let i = cleanups.length - 1; i >= 0; i--) {
            try {
                cleanups[i]?.();
            }
            catch (err) {
                console.error("[plugin-sdk] cleanup threw during unload:", err);
            }
        }
        const children = this.children;
        this.children = [];
        for (let i = children.length - 1; i >= 0; i--) {
            try {
                children[i]?.unload();
            }
            catch (err) {
                console.error("[plugin-sdk] child unload threw:", err);
            }
        }
    }
    /** Add a child component, loading it if this component is already loaded. */
    addChild(component) {
        if (this.children.includes(component))
            return component;
        this.children.push(component);
        if (this._loaded)
            component.load();
        return component;
    }
    /** Remove a child component, unloading it. */
    removeChild(component) {
        const i = this.children.indexOf(component);
        if (i !== -1)
            this.children.splice(i, 1);
        component.unload();
        return component;
    }
    /** Register a callback to run on unload. */
    register(cb) {
        this.cleanups.push(cb);
    }
    /** Register a host subscription handle to be released on unload. */
    registerEvent(unsubscribe) {
        this.register(unsubscribe);
    }
    registerDomEvent(el, type, callback, options) {
        const listener = callback;
        el.addEventListener(type, listener, options);
        this.register(() => el.removeEventListener(type, listener, options));
    }
    /**
     * Register a timer id (from `setInterval`) to be cleared on unload. Returns
     * the id so it can be inlined:
     * `this.registerInterval(setInterval(fn, 1000))`.
     *
     * Clears via the global `clearInterval` rather than `window.clearInterval`
     * — the SDK is bundled into plugins and also type-checked/tested outside a
     * DOM, where `window` is undefined.
     */
    registerInterval(id) {
        this.register(() => clearInterval(id));
        return id;
    }
}
//# sourceMappingURL=component.js.map