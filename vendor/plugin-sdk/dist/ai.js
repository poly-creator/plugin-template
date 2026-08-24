/**
 * Vendor-neutral AI protocol types — the chat-message / tool-calling shapes that
 * cross the plugin → host → adapter boundary. Adapters project these onto each
 * vendor's wire format (OpenAI messages, Anthropic content blocks, Gemini parts).
 *
 * Pure types (no runtime). Dependency-free so the SDK stays importable from both
 * the renderer (`@openclime/plugin-sdk`) and the main process (`electron/main`)
 * via the tsconfig `paths` mapping.
 */
export {};
//# sourceMappingURL=ai.js.map