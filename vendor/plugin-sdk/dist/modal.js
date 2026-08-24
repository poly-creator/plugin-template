export class Modal {
    title;
    width;
    /**
     * The element a plugin populates. The host mounts this node inside its
     * dialog chrome, so anything appended here (before or during `onOpen`)
     * shows up in the modal.
     */
    contentEl = document.createElement("div");
    constructor(opts) {
        this.title = opts.title;
        this.width = opts.width;
        if (opts.contentCls)
            this.contentEl.className = opts.contentCls;
    }
    /** Populate `this.contentEl`. Called by the host when the modal mounts. */
    onOpen() { }
    /** Release anything `onOpen` acquired. Called when the host unmounts it. */
    onClose() { }
    /** Show the modal. Idempotent — the host holds at most one modal. */
    open() {
        this.app.ui.openModal(this);
    }
    /** Hide the modal. Safe to call when it is not showing. */
    close() {
        this.app.ui.closeModal();
    }
}
/**
 * A two-button confirmation dialog. `await modal.result` for the answer:
 * `true` for confirm, `false` for cancel — including when the user dismisses
 * via Escape, the backdrop, or the close button, so a caller awaiting the
 * promise never hangs.
 */
export class ConfirmationModal extends Modal {
    result;
    resolveRef;
    settled = false;
    constructor(app, title, message, opts = {}) {
        super({ title, width: 420, contentCls: "flex flex-col gap-3 text-sm text-foreground" });
        // `app` is `declare`d on the base (so the base constructor can't touch an
        // abstract member); assign it here, after super().
        this.app = app;
        this.result = new Promise((resolve) => {
            this.resolveRef = resolve;
        });
        const body = document.createElement("p");
        body.textContent = message;
        this.contentEl.appendChild(body);
        const row = document.createElement("div");
        row.className = "flex justify-end gap-2 pt-2";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className =
            "shrink-0 cursor-pointer rounded-lg border border-border bg-muted px-3 py-1 text-[11px] text-foreground transition-[color,background-color] duration-150 hover:bg-accent active:scale-[0.96]";
        cancel.textContent = opts.cancelCta ?? "取消";
        cancel.addEventListener("click", () => this.settle(false));
        const confirm = document.createElement("button");
        confirm.type = "button";
        confirm.className = opts.danger
            ? "shrink-0 cursor-pointer rounded-lg bg-destructive px-3 py-1 text-[11px] text-destructive-foreground transition-[color,background-color,transform] duration-150 hover:bg-destructive/90 active:scale-[0.96]"
            : "shrink-0 cursor-pointer rounded-lg bg-primary px-3 py-1 text-[11px] text-primary-foreground transition-[color,background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.96]";
        confirm.textContent = opts.cta ?? "确认";
        confirm.addEventListener("click", () => this.settle(true));
        row.appendChild(cancel);
        row.appendChild(confirm);
        this.contentEl.appendChild(row);
    }
    /**
     * Dismissal that did NOT go through a button (Escape / backdrop / the host's
     * close button) counts as a cancel — otherwise `await modal.result` would
     * hang forever on the most common way users close a dialog.
     */
    onClose() {
        this.settle(false);
    }
    settle(value) {
        if (this.settled)
            return;
        this.settled = true;
        this.resolveRef(value);
        this.close();
    }
}
//# sourceMappingURL=modal.js.map