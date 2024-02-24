export type Offset = [/*left:*/ number, /*top: */ number];
export default class IFrameOffsets {
    private readonly states;
    private calcOffset;
    getDocumentOffset(doc: Document): Offset;
    observe(iFrame: HTMLIFrameElement): void;
    clear(): void;
}
