/**
 * Menu + MenuItem — Obsidian-style context menus that can be shown on demand.
 *
 * The V1.1 host exposes `app.ui.registerContextMenu(item)` for adding items
 * to the canvas right-click menu. That covers "extend the existing menu",
 * but not "open a brand new menu at the user's click" — Obsidian solves it
 * with `new Menu(app).addItem(...).showAtMouseEvent(e)` etc. We mirror that.
 *
 * A Menu is built once (typically in `onload`) and shown on demand from
 * a host event (`mouseup` on a toolbar button, etc.). Items can nest
 * submenus via `setSubmenu()`; the menu auto-closes on item click and on
 * outside click.
 *
 * See docs/superpowers/specs/2026-08-04-plugin-settings-api-design.md §6 A3.2.
 */
import type { PluginHost } from "./host";
/** Where the menu was opened — `mouseup` handler passes the event in. */
export interface MouseEventLike {
    readonly clientX: number;
    readonly clientY: number;
    preventDefault?: () => void;
}
export interface MenuItemOptions {
    /** Visible label. Use ` ` for a separator entry that ignores other fields. */
    label: string;
    /** Optional icon (Lucide icon name). */
    icon?: string;
    /** Disabled state — shows greyed and ignores click. */
    disabled?: boolean;
    /** Checkmark marker — left side of the label. */
    checked?: boolean;
    /** Click handler — fired when the user picks the item. */
    onClick?: () => void | Promise<void>;
    /** Sub-menu — opens to the right when the user hovers this entry. */
    submenu?: Menu;
}
export declare class MenuItem {
    readonly label: string;
    icon?: string;
    disabled: boolean;
    checked: boolean;
    onClick?: () => void | Promise<void>;
    submenu?: Menu;
    constructor(opts: MenuItemOptions);
    /** Build the DOM row. Hosts use this when rendering. */
    render(container: HTMLElement): HTMLElement;
}
/**
 * Menu — a stack of {@link MenuItem} shown on demand at a position.
 *
 * Built with `new Menu(host)`, populated with `addItem`/`addSeparator`/
 * `addSubmenu`, then shown via `showAtMouseEvent` or `showAtPosition`.
 * Auto-closes on outside click and on Escape.
 */
export declare class Menu {
    private readonly host;
    private readonly items;
    private root;
    private onDocClick;
    private onKey;
    private openSubmenus;
    constructor(host: PluginHost);
    addItem(item: MenuItem): this;
    addSeparator(): this;
    /** Convenience: build, attach, and return the new item. */
    buildItem(opts: MenuItemOptions): MenuItem;
    /** Build a submenu (visible only while the parent menu is open). */
    addSubmenu(label: string, build: (sub: Menu) => void): this;
    showAtMouseEvent(e: MouseEventLike): void;
    showAtPosition(x: number, y: number): void;
    /** Position an already-open menu to the right of `anchor`. Used by submenus. */
    positionRightOf(anchor: HTMLElement): void;
    close(): void;
    get isOpen(): boolean;
}
//# sourceMappingURL=menu.d.ts.map