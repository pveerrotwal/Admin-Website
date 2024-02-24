import Observer from './observer.js';
import { isElementNode, hasTag } from '../guards.js';
import IFrameObserver from './iframe_observer.js';
import ShadowRootObserver from './shadow_root_observer.js';
import IFrameOffsets from './iframe_offsets.js';
import { CreateDocument } from '../messages.gen.js';
import { IN_BROWSER, hasOpenreplayAttribute, canAccessIframe } from '../../utils.js';
const attachShadowNativeFn = IN_BROWSER ? Element.prototype.attachShadow : () => new ShadowRoot();
export default class TopObserver extends Observer {
    constructor(app, options) {
        super(app, true);
        this.iframeOffsets = new IFrameOffsets();
        this.contextCallbacks = [];
        // Attached once per Tracker instance
        this.contextsSet = new Set();
        this.iframeObservers = [];
        this.shadowRootObservers = [];
        this.options = Object.assign({
            captureIFrames: true,
        }, options);
        // IFrames
        this.app.nodes.attachNodeCallback((node) => {
            if (hasTag(node, 'iframe') &&
                ((this.options.captureIFrames && !hasOpenreplayAttribute(node, 'obscured')) ||
                    hasOpenreplayAttribute(node, 'capture'))) {
                this.handleIframe(node);
            }
        });
        // ShadowDOM
        this.app.nodes.attachNodeCallback((node) => {
            if (isElementNode(node) && node.shadowRoot !== null) {
                this.handleShadowRoot(node.shadowRoot);
            }
        });
    }
    attachContextCallback(cb) {
        this.contextCallbacks.push(cb);
    }
    getDocumentOffset(doc) {
        return this.iframeOffsets.getDocumentOffset(doc);
    }
    handleIframe(iframe) {
        let doc = null;
        // setTimeout is required. Otherwise some event listeners (scroll, mousemove) applied in modules
        //     do not work on the iframe document when it 've been loaded dynamically ((why?))
        const handle = this.app.safe(() => setTimeout(() => {
            const id = this.app.nodes.getID(iframe);
            if (id === undefined) {
                //log
                return;
            }
            if (!canAccessIframe(iframe))
                return;
            const currentWin = iframe.contentWindow;
            const currentDoc = iframe.contentDocument;
            if (currentDoc && currentDoc !== doc) {
                const observer = new IFrameObserver(this.app);
                this.iframeObservers.push(observer);
                observer.observe(iframe); // TODO: call unregisterNode for the previous doc if present (incapsulate: one iframe - one observer)
                doc = currentDoc;
                this.iframeOffsets.observe(iframe);
            }
            if (currentWin &&
                // Sometimes currentWin.window is null (not in specification). Such window object is not functional
                currentWin === currentWin.window &&
                !this.contextsSet.has(currentWin) // for each context callbacks called once per Tracker (TopObserver) instance
            //TODO: more explicit logic
            ) {
                this.contextsSet.add(currentWin);
                //@ts-ignore https://github.com/microsoft/TypeScript/issues/41684
                this.contextCallbacks.forEach((cb) => cb(currentWin));
            }
            // we need this delay because few iframes stacked one in another with rapid updates will break the player (or browser engine rather?)
        }, 100));
        iframe.addEventListener('load', handle); // why app.attachEventListener not working?
        handle();
    }
    handleShadowRoot(shRoot) {
        const observer = new ShadowRootObserver(this.app);
        this.shadowRootObservers.push(observer);
        observer.observe(shRoot.host);
    }
    observe() {
        // Protection from several subsequent calls?
        const observer = this;
        Element.prototype.attachShadow = function () {
            // eslint-disable-next-line
            const shadow = attachShadowNativeFn.apply(this, arguments);
            observer.handleShadowRoot(shadow);
            return shadow;
        };
        // Can observe documentElement (<html>) here, because it is not supposed to be changing.
        // However, it is possible in some exotic cases and may cause an ignorance of the newly created <html>
        // In this case context.document have to be observed, but this will cause
        // the change in the re-player behaviour caused by CreateDocument message:
        //   the 0-node ("fRoot") will become #document rather than documentElement as it is now.
        // Alternatively - observe(#document) then bindNode(documentElement)
        this.observeRoot(window.document, () => {
            this.app.send(CreateDocument());
            // it has no node_id here
            this.app.nodes.callNodeCallbacks(document, true);
        }, window.document.documentElement);
    }
    disconnect() {
        this.iframeOffsets.clear();
        Element.prototype.attachShadow = attachShadowNativeFn;
        this.iframeObservers.forEach((o) => o.disconnect());
        this.iframeObservers = [];
        this.shadowRootObservers.forEach((o) => o.disconnect());
        this.shadowRootObservers = [];
        super.disconnect();
    }
}
