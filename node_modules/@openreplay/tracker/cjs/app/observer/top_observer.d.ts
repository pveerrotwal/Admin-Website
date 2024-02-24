import Observer from './observer.js';
import { Offset } from './iframe_offsets.js';
import App from '../index.js';
export interface Options {
    captureIFrames: boolean;
}
type Context = Window & typeof globalThis;
type ContextCallback = (context: Context) => void;
export default class TopObserver extends Observer {
    private readonly options;
    private readonly iframeOffsets;
    constructor(app: App, options: Partial<Options>);
    private readonly contextCallbacks;
    private readonly contextsSet;
    attachContextCallback(cb: ContextCallback): void;
    getDocumentOffset(doc: Document): Offset;
    private iframeObservers;
    private handleIframe;
    private shadowRootObservers;
    private handleShadowRoot;
    observe(): void;
    disconnect(): void;
}
export {};
