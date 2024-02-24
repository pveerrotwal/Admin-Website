"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guards_js_1 = require("../app/guards.js");
const messages_gen_js_1 = require("../app/messages.gen.js");
function default_1(app) {
    if (!window.FontFace) {
        return;
    }
    const docFonts = new Map();
    const patchWindow = (wnd) => {
        class FontFaceInterceptor extends wnd.FontFace {
            constructor(...args) {
                //maybe do this on load(). In this case check if the document.fonts.load(...) function calls the font's load()
                if (typeof args[1] === 'string') {
                    let desc = '';
                    if (args[2]) {
                        app.safe(() => {
                            desc = JSON.stringify(args[2]);
                        });
                    }
                    const ffData = [args[0], args[1], desc];
                    const ffDataArr = docFonts.get(wnd.document) || [];
                    ffDataArr.push(ffData);
                    docFonts.set(wnd.document, ffDataArr);
                    const parentID = wnd === window ? 0 : app.nodes.getID(wnd.document);
                    if (parentID === undefined) {
                        return;
                    }
                    if (app.active()) {
                        app.send((0, messages_gen_js_1.LoadFontFace)(parentID, ...ffData));
                    }
                }
                super(...args);
            }
        }
        wnd.FontFace = FontFaceInterceptor;
    };
    app.observer.attachContextCallback(patchWindow);
    patchWindow(window);
    app.nodes.attachNodeCallback(app.safe((node) => {
        if (!(0, guards_js_1.isDocument)(node)) {
            return;
        }
        const ffDataArr = docFonts.get(node);
        if (!ffDataArr) {
            return;
        }
        const parentID = node.defaultView === window ? 0 : app.nodes.getID(node);
        if (parentID === undefined) {
            return;
        }
        ffDataArr.forEach((ffData) => {
            app.send((0, messages_gen_js_1.LoadFontFace)(parentID, ...ffData));
        });
    }));
}
exports.default = default_1;
