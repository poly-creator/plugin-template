/**
 * Base runtime class (plan §16/§36). Constructed with a bound context by the
 * host when registered via the factory form:
 *
 *   runtime: { create: (ctx) => new MyRuntime(ctx) }
 */
export class BaseNodeRuntime {
    context;
    constructor(context) {
        this.context = context;
    }
    async cancel() { }
    validate() {
        return { valid: true };
    }
}
//# sourceMappingURL=node-v2.js.map