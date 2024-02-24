//@ts-ignore
export function isNode(sth) {
    return !!sth && sth.nodeType != null;
}
export function isSVGElement(node) {
    return node.namespaceURI === 'http://www.w3.org/2000/svg';
}
export function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}
export function isCommentNode(node) {
    return node.nodeType === Node.COMMENT_NODE;
}
export function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE;
}
export function isDocument(node) {
    return node.nodeType === Node.DOCUMENT_NODE;
}
export function isRootNode(node) {
    return node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
export function hasTag(el, tagName) {
    // @ts-ignore
    return el.localName === tagName;
}
