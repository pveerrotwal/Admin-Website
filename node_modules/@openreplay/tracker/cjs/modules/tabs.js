"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_gen_js_1 = require("../app/messages.gen.js");
function default_1(app) {
    function changeTab() {
        if (!document.hidden) {
            app.debug.log('Openreplay: tab change to' + app.session.getTabId());
            app.send((0, messages_gen_js_1.TabChange)(app.session.getTabId()));
        }
    }
    app.attachEventListener(window, 'focus', changeTab, false, false);
}
exports.default = default_1;
