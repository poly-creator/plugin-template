/**
 * Canvas lifecycle event names — the string keys passed to
 * `app.canvas.on(event, cb)`. The runtime emits these **post-commit** by
 * diffing the previous vs current canvas state, so a change from ANY source
 * fires: plugin/agent ops, user drag/connect/drop, paste, duplicate,
 * undo/redo, and collab sync.
 *
 * Listener callbacks receive the affected entity:
 * - `node:created` → `(node)`
 * - `node:updated` → `({ id, before, after })` (any tracked field changed:
 *   pos/size/label/description/color/type/icon/layer/data; `before`/`after`
 *   are the previous and current node so listeners can compute the delta)
 * - `node:deleted` → `(nodeId)`
 * - `edge:created` → `(edge)`
 * - `edge:updated` → `({ id, before, after })` (any tracked field changed:
 *   source/target ports, label, color, style, animated, width; `before`/
 *   `after` are the previous and current edge so listeners can compute
 *   the delta)
 * - `edge:deleted` → `(edgeId)`
 * - `layer:created` → `(layer)`
 * - `layer:updated` → `({ id, before, after })` (name/visible/locked/color
 *   change; `before`/`after` are the previous and current layer)
 * - `layer:deleted` → `(layerId)`
 * - `viewport:changed` → `({ before, after })` (any pan/zoom change; `after`
 *   is the new `{x, y, zoom}`, `before` the previous viewport)
 * - `selection:changed` → `(nodeIds: string[])` (fires when the selected
 *   node id set changes, including to an empty selection)
 * - `graph:changed` → `({ nodes, edges })` (coarse catch-all, fires on any
 *   node/edge reference change)
 *
 * Caveats:
 * - Events fire only in the window that owns the canvas (CanvasStudio). Other
 *   windows (asset library, agent chat) never wire the canvas host slot.
 * - A listener that re-mutates the canvas (e.g. `app.canvas.addNode`) can
 *   cause a self-feedback loop — guard with your own state.
 * - A board/project switch emits mass `node:deleted` (old board) +
 *   `node:created` (new board); semantically correct but potentially noisy.
 */
export const CANVAS_EVENTS = {
    nodeCreated: "node:created",
    nodeUpdated: "node:updated",
    nodeDeleted: "node:deleted",
    edgeCreated: "edge:created",
    edgeUpdated: "edge:updated",
    edgeDeleted: "edge:deleted",
    layerCreated: "layer:created",
    layerUpdated: "layer:updated",
    layerDeleted: "layer:deleted",
    viewportChanged: "viewport:changed",
    selectionChanged: "selection:changed",
    graphChanged: "graph:changed",
};
//# sourceMappingURL=host.js.map