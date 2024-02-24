"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_gen_js_1 = require("../app/messages.gen.js");
const guards_js_1 = require("../app/guards.js");
function getDocumentScroll(doc) {
    const win = doc.defaultView;
    return [
        (win && win.pageXOffset) ||
            (doc.documentElement && doc.documentElement.scrollLeft) ||
            (doc.body && doc.body.scrollLeft) ||
            0,
        (win && win.pageYOffset) ||
            (doc.documentElement && doc.documentElement.scrollTop) ||
            (doc.body && doc.body.scrollTop) ||
            0,
    ];
}
function default_1(app) {
    let documentScroll = false;
    const nodeScroll = new Map();
    function setNodeScroll(target) {
        if (!(0, guards_js_1.isNode)(target)) {
            return;
        }
        if ((0, guards_js_1.isElementNode)(target)) {
            nodeScroll.set(target, [target.scrollLeft, target.scrollTop]);
        }
        if ((0, guards_js_1.isDocument)(target)) {
            nodeScroll.set(target, getDocumentScroll(target));
        }
    }
    const sendSetViewportScroll = app.safe(() => app.send((0, messages_gen_js_1.SetViewportScroll)(...getDocumentScroll(document))));
    const sendSetNodeScroll = app.safe((s, node) => {
        const id = app.nodes.getID(node);
        if (id !== undefined) {
            app.send((0, messages_gen_js_1.SetNodeScroll)(id, s[0], s[1]));
        }
    });
    app.attachStartCallback(sendSetViewportScroll);
    app.attachStopCallback(() => {
        documentScroll = false;
        nodeScroll.clear();
    });
    app.nodes.attachNodeCallback((node, isStart) => {
        // MBTODO: iterate over all the nodes on start instead of using isStart hack
        if (isStart) {
            if ((0, guards_js_1.isElementNode)(node) && node.scrollLeft + node.scrollTop > 0) {
                nodeScroll.set(node, [node.scrollLeft, node.scrollTop]);
            }
            else if ((0, guards_js_1.isDocument)(node)) {
                // DRY somehow?
                nodeScroll.set(node, getDocumentScroll(node));
            }
        }
        if ((0, guards_js_1.isRootNode)(node)) {
            // scroll is not-composed event (https://javascript.info/shadow-dom-events)
            app.nodes.attachNodeListener(node, 'scroll', (e) => {
                setNodeScroll(e.target);
            });
        }
    });
    app.attachEventListener(document, 'scroll', (e) => {
        const target = e.target;
        if (target === document) {
            documentScroll = true;
            return;
        }
        setNodeScroll(target);
    });
    app.ticker.attach(() => {
        if (documentScroll) {
            sendSetViewportScroll();
            documentScroll = false;
        }
        nodeScroll.forEach(sendSetNodeScroll);
        nodeScroll.clear();
    }, 5, false);
}
exports.default = default_1;
