export const VOICE_CATALOG = [
    { label: "云希男声", id: "male-qn-qingse" },
    { label: "晓晓女声", id: "female-shaonv" },
    { label: "旁白大叔", id: "presenter_male" },
];
/** Fallback when the stored voice is absent, unknown, or not a TTS voice. */
export const DEFAULT_VOICE_ID = "male-qn-qingse";
const labelToId = new Map(VOICE_CATALOG.map((v) => [v.label, v.id]));
const knownIds = new Set(VOICE_CATALOG.map((v) => v.id));
/**
 * Resolve whatever the UI stored into a valid MiniMax voice id.
 *
 *  · a known label ("云希男声")              → its id
 *  · an already-valid id ("male-qn-qingse") → returned as-is (forward-compat:
 *    a future caller or imported board may already store ids)
 *  · empty / unknown / "AI 音乐"           → DEFAULT_VOICE_ID (never send a bad id)
 *
 * Pure + deterministic so it is unit-testable without touching the adapter.
 */
export function resolveVoiceId(stored) {
    if (!stored)
        return DEFAULT_VOICE_ID;
    const byLabel = labelToId.get(stored);
    if (byLabel)
        return byLabel;
    if (knownIds.has(stored))
        return stored;
    return DEFAULT_VOICE_ID;
}
//# sourceMappingURL=voice.js.map