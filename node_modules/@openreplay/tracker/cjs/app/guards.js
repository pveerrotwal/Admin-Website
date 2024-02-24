"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasTag = exports.isRootNode = exports.isDocument = exports.isTextNode = exports.isCommentNode = exports.isElementNode = exports.isSVGElement = exports.isNode = void 0;
//@ts-ignore
function isNode(sth) {
    return !!sth && sth.nodeType != null;
}
exports.isNode = isNode;
function isSVGElement(node) {
    return node.namespaceURI === 'http://www.w3.org/2000/svg';
}
exports.isSVGElement = isSVGElement;
function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}
exports.isElementNode = isElementNode;
function isCommentNode(node) {
    return node.nodeType === Node.COMMENT_NODE;
}
exports.isCommentNode = isCommentNode;
function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE;
}
exports.isTextNode = isTextNode;
function isDocument(node) {
    return node.nodeType === Node.DOCUMENT_NODE;
}
exports.isDocument = isDocument;
function isRootNode(node) {
    return node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
exports.isRootNode = isRootNode;
function hasTag(el, tagName) {
    // @ts-ignore
    return el.localName === tagName;
}
exports.hasTag = hasTag;
