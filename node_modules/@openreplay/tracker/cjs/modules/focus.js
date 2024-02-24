"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guards_js_1 = require("../app/guards.js");
const messages_gen_js_1 = require("../app/messages.gen.js");
function default_1(app) {
    function sendSetNodeFocus(n) {
        const id = app.nodes.getID(n);
        if (id !== undefined) {
            app.send((0, messages_gen_js_1.SetNodeFocus)(id));
        }
    }
    let blurred = false;
    app.nodes.attachNodeCallback((node) => {
        if (!(0, guards_js_1.hasTag)(node, 'body')) {
            return;
        }
        app.nodes.attachNodeListener(node, 'focus', (e) => {
            if (!(0, guards_js_1.isNode)(e.target)) {
                return;
            }
            sendSetNodeFocus(e.target);
            blurred = false;
        });
        app.nodes.attachNodeListener(node, 'blur', (e) => {
            if (e.relatedTarget === null) {
                blurred = true;
                setTimeout(() => {
                    if (blurred) {
                        app.send((0, messages_gen_js_1.SetNodeFocus)(-1));
                    }
                }, 0);
            }
        });
    });
    app.attachStartCallback(() => {
        let elem = document.activeElement;
        while (elem && (0, guards_js_1.hasTag)(elem, 'iframe') && elem.contentDocument) {
            elem = elem.contentDocument.activeElement;
        }
        if (elem && elem !== elem.ownerDocument.body) {
            sendSetNodeFocus(elem);
        }
    }, true);
}
exports.default = default_1;
