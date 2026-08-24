export class MenuItem {
    label;
    icon;
    disabled = false;
    checked = false;
    onClick;
    submenu;
    constructor(opts) {
        this.label = opts.label;
        this.icon = opts.icon;
        this.disabled = !!opts.disabled;
        this.checked = !!opts.checked;
        this.onClick = opts.onClick;
        this.submenu = opts.submenu;
    }
    /** Build the DOM row. Hosts use this when rendering. */
    render(container) {
        const row = document.createElement("button");
        row.type = "button";
        row.className =
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] text-foreground transition-[color,background-color] duration-150 hover:bg-accent/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";
        row.disabled = this.disabled;
        row.dataset.role = "menu-item";
        if (this.checked) {
            const tick = document.createElement("span");
            tick.textContent = "✓";
            tick.className = "w-3 shrink-0 text-center";
            row.appendChild(tick);
        }
        else if (this.icon) {
            const icon = document.createElement("span");
            icon.textContent = this.icon;
            icon.className = "w-3 shrink-0 text-center text-muted-foreground";
            row.appendChild(icon);
        }
        else {
            const spacer = document.createElement("span");
            spacer.className = "w-3 shrink-0";
            row.appendChild(spacer);
        }
        const label = document.createElement("span");
        label.textContent = this.label;
        label.className = "flex-1 text-left";
        row.appendChild(label);
        if (this.submenu) {
            const arrow = document.createElement("span");
            arrow.textContent = "▶";
            arrow.className = "text-muted-foreground";
            row.appendChild(arrow);
        }
        row.addEventListener("click", () => {
            if (this.disabled || !this.onClick)
                return;
            void Promise.resolve(this.onClick()).finally(() => {
                this.submenu?.close();
                container.dispatchEvent(new CustomEvent("menu-choose", { bubbles: true }));
            });
        });
        row.addEventListener("mouseenter", () => {
            if (!this.submenu)
                return;
            this.submenu.positionRightOf(row);
        });
        container.appendChild(row);
        return row;
    }
}
/**
 * Menu — a stack of {@link MenuItem} shown on demand at a position.
 *
 * Built with `new Menu(host)`, populated with `addItem`/`addSeparator`/
 * `addSubmenu`, then shown via `showAtMouseEvent` or `showAtPosition`.
 * Auto-closes on outside click and on Escape.
 */
export class Menu {
    host;
    items = [];
    root = null;
    onDocClick = null;
    onKey = null;
    openSubmenus = [];
    constructor(host) {
        this.host = host;
    }
    addItem(item) {
        this.items.push(item);
        return this;
    }
    addSeparator() {
        this.items.push(new MenuItem({ label: "" }));
        return this;
    }
    /** Convenience: build, attach, and return the new item. */
    buildItem(opts) {
        const item = new MenuItem(opts);
        this.items.push(item);
        return item;
    }
    /** Build a submenu (visible only while the parent menu is open). */
    addSubmenu(label, build) {
        const sub = new Menu(this.host);
        build(sub);
        this.items.push(new MenuItem({ label, submenu: sub }));
        return this;
    }
    showAtMouseEvent(e) {
        e.preventDefault?.();
        this.showAtPosition(e.clientX, e.clientY);
    }
    showAtPosition(x, y) {
        this.close();
        const root = document.createElement("div");
        root.dataset.role = "plugin-menu";
        root.className =
            "fixed z-50 min-w-[180px] rounded-lg border border-border bg-popover p-1 shadow-lg";
        root.style.left = `${x}px`;
        root.style.top = `${y}px`;
        for (const item of this.items)
            item.render(root);
        document.body.appendChild(root);
        this.root = root;
        // Items dispatch `menu-choose` after running their handler — close then.
        root.addEventListener("menu-choose", () => this.close());
        this.onDocClick = (e) => {
            if (!root.contains(e.target))
                this.close();
        };
        this.onKey = (e) => {
            if (e.key === "Escape")
                this.close();
        };
        // Defer to next tick — otherwise the click that opened us counts as the
        // "outside click" and we close immediately.
        setTimeout(() => document.addEventListener("click", this.onDocClick), 0);
        document.addEventListener("keydown", this.onKey);
    }
    /** Position an already-open menu to the right of `anchor`. Used by submenus. */
    positionRightOf(anchor) {
        if (!this.root)
            return;
        const rect = anchor.getBoundingClientRect();
        this.root.style.left = `${rect.right}px`;
        this.root.style.top = `${rect.top}px`;
    }
    close() {
        for (const sub of this.openSubmenus)
            sub.close();
        this.openSubmenus = [];
        if (this.onDocClick)
            document.removeEventListener("click", this.onDocClick);
        if (this.onKey)
            document.removeEventListener("keydown", this.onKey);
        this.onDocClick = null;
        this.onKey = null;
        if (this.root) {
            this.root.remove();
            this.root = null;
        }
    }
    get isOpen() {
        return this.root !== null;
    }
}
//# sourceMappingURL=menu.js.map