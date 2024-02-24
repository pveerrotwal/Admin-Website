"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_gen_js_1 = require("../app/messages.gen.js");
function default_1(app) {
    const connection = navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
    if (connection === undefined) {
        return;
    }
    const sendConnectionInformation = () => app.send((0, messages_gen_js_1.ConnectionInformation)(Math.round(connection.downlink * 1000), connection.type || 'unknown'));
    sendConnectionInformation();
    connection.addEventListener('change', sendConnectionInformation);
}
exports.default = default_1;
