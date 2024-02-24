"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_gen_js_1 = require("../app/messages.gen.js");
function selection(app) {
    app.attachEventListener(document, 'selectionchange', () => {
        const selection = document.getSelection();
        if (selection !== null && !selection.isCollapsed) {
            const selectionStart = app.nodes.getID(selection.anchorNode);
            const selectionEnd = app.nodes.getID(selection.focusNode);
            const selectedText = selection.toString().replace(/\s+/g, ' ');
            if (selectionStart && selectionEnd) {
                app.send((0, messages_gen_js_1.SelectionChange)(selectionStart, selectionEnd, selectedText));
            }
        }
        else {
            app.send((0, messages_gen_js_1.SelectionChange)(-1, -1, ''));
        }
    });
}
exports.default = selection;
/** TODO: research how to get all in-between nodes inside selection range
 *        including nodes between anchor and focus nodes and their children
 *        without recursively searching the dom tree
 */
// if (selection.rangeCount) {
//   const nodes = [];
//   for (let i = 0; i < selection.rangeCount; i++) {
//     const range = selection.getRangeAt(i);
//     let node: Node | null = range.startContainer;
//     while (node) {
//       nodes.push(node);
//       if (node === range.endContainer) break;
//       node = node.nextSibling;
//     }
//   }
//   // send selected nodes
// }
