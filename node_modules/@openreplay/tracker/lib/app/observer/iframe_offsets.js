// Le truc - for defining an absolute offset for (nested) iframe documents. (To track mouse movments)
export default class IFrameOffsets {
    constructor() {
        this.states = new Map();
    }
    calcOffset(state) {
        let parLeft = 0, parTop = 0;
        if (state.parent) {
            ;
            [parLeft, parTop] = this.calcOffset(state.parent);
        }
        if (!state.offset) {
            const { left, top } = state.iFrame.getBoundingClientRect();
            state.offset = [left, top];
        }
        const [left, top] = state.offset;
        return [parLeft + left, parTop + top]; // TODO: store absolute sum, invalidate whole subtree. Otherwise it is summated on each mousemove
    }
    getDocumentOffset(doc) {
        const state = this.states.get(doc);
        if (!state) {
            return [0, 0];
        } // topmost doc
        return this.calcOffset(state);
    }
    observe(iFrame) {
        var _a;
        const doc = iFrame.contentDocument;
        if (!doc) {
            return;
        }
        const parentDoc = iFrame.ownerDocument;
        const parentState = this.states.get(parentDoc);
        const state = {
            offset: null,
            iFrame,
            parent: parentState || null,
            clear: () => {
                var _a;
                parentDoc.removeEventListener('scroll', invalidateOffset);
                (_a = parentDoc.defaultView) === null || _a === void 0 ? void 0 : _a.removeEventListener('resize', invalidateOffset);
            },
        };
        const invalidateOffset = () => {
            state.offset = null;
        };
        // anything more reliable? This does not cover all cases (layout changes are ignored, for ex.)
        parentDoc.addEventListener('scroll', invalidateOffset);
        (_a = parentDoc.defaultView) === null || _a === void 0 ? void 0 : _a.addEventListener('resize', invalidateOffset);
        this.states.set(doc, state);
    }
    clear() {
        this.states.forEach((s) => s.clear());
        this.states.clear();
    }
}
