/**
 * Modal — Obsidian-style base class for plugin dialogs.
 *
 * `app.ui.openModal({ title, render })` covers one-off dialogs. A class makes
 * the lifecycle first-class: a plugin extends `Modal`, fills `contentEl` from
 * `onOpen()`, and calls `open()` / `close()`.
 *
 * The class is a THIN wrapper over the existing host modal slot — it does not
 * own a backdrop, an Escape listener, or a close button, because
 * `PluginModalHost` already provides all three. Duplicating them here is how
 * the first draft ended up attaching a second `keydown` listener on every
 * `open()` and latching `closed = true` so a modal could never be reopened.
 * The host is the single owner of "is a modal showing"; this class just
 * describes one.
 *
 * See docs/superpowers/specs/2026-08-04-plugin-settings-api-design.md §6 A3.1.
 */
import type { PluginHost } from "./host";
export interface ModalOptions {
    title: string;
    width?: number | string;
    /** Optional class applied to the content element. */
    contentCls?: string;
}
export declare abstract class Modal {
    /** Assigned by the subclass constructor (see `ConfirmationModal`). */
    readonly app: PluginHost;
    readonly title: string;
    readonly width?: number | string;
    /**
     * The element a plugin populates. The host mounts this node inside its
     * dialog chrome, so anything appended here (before or during `onOpen`)
     * shows up in the modal.
     */
    readonly contentEl: HTMLElement;
    constructor(opts: ModalOptions);
    /** Populate `this.contentEl`. Called by the host when the modal mounts. */
    onOpen(): void;
    /** Release anything `onOpen` acquired. Called when the host unmounts it. */
    onClose(): void;
    /** Show the modal. Idempotent — the host holds at most one modal. */
    open(): void;
    /** Hide the modal. Safe to call when it is not showing. */
    close(): void;
}
/**
 * A two-button confirmation dialog. `await modal.result` for the answer:
 * `true` for confirm, `false` for cancel — including when the user dismisses
 * via Escape, the backdrop, or the close button, so a caller awaiting the
 * promise never hangs.
 */
export declare class ConfirmationModal extends Modal {
    readonly result: Promise<boolean>;
    private resolveRef;
    private settled;
    constructor(app: PluginHost, title: string, message: string, opts?: {
        cta?: string;
        cancelCta?: string;
        danger?: boolean;
    });
    /**
     * Dismissal that did NOT go through a button (Escape / backdrop / the host's
     * close button) counts as a cancel — otherwise `await modal.result` would
     * hang forever on the most common way users close a dialog.
     */
    onClose(): void;
    private settle;
}
//# sourceMappingURL=modal.d.ts.map