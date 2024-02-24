"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringWiper = exports.SanitizeLevel = void 0;
const utils_js_1 = require("../utils.js");
const guards_js_1 = require("./guards.js");
var SanitizeLevel;
(function (SanitizeLevel) {
    SanitizeLevel[SanitizeLevel["Plain"] = 0] = "Plain";
    SanitizeLevel[SanitizeLevel["Obscured"] = 1] = "Obscured";
    SanitizeLevel[SanitizeLevel["Hidden"] = 2] = "Hidden";
})(SanitizeLevel = exports.SanitizeLevel || (exports.SanitizeLevel = {}));
const stringWiper = (input) => input
    .trim()
    .replace(/[^\f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/g, '█');
exports.stringWiper = stringWiper;
class Sanitizer {
    constructor(app, options) {
        this.app = app;
        this.obscured = new Set();
        this.hidden = new Set();
        this.options = Object.assign({
            obscureTextEmails: true,
            obscureTextNumbers: false,
        }, options);
    }
    handleNode(id, parentID, node) {
        if (this.obscured.has(parentID) ||
            ((0, guards_js_1.isElementNode)(node) &&
                ((0, utils_js_1.hasOpenreplayAttribute)(node, 'masked') || (0, utils_js_1.hasOpenreplayAttribute)(node, 'obscured')))) {
            this.obscured.add(id);
        }
        if (this.hidden.has(parentID) ||
            ((0, guards_js_1.isElementNode)(node) &&
                ((0, utils_js_1.hasOpenreplayAttribute)(node, 'htmlmasked') || (0, utils_js_1.hasOpenreplayAttribute)(node, 'hidden')))) {
            this.hidden.add(id);
        }
        if (this.options.domSanitizer !== undefined && (0, guards_js_1.isElementNode)(node)) {
            const sanitizeLevel = this.options.domSanitizer(node);
            if (sanitizeLevel === SanitizeLevel.Obscured) {
                this.obscured.add(id);
            }
            if (sanitizeLevel === SanitizeLevel.Hidden) {
                this.hidden.add(id);
            }
        }
    }
    sanitize(id, data) {
        if (this.obscured.has(id)) {
            // TODO: is it the best place to put trim() ? Might trimmed spaces be considered in layout in certain cases?
            return (0, exports.stringWiper)(data);
        }
        if (this.options.obscureTextNumbers) {
            data = data.replace(/\d/g, '0');
        }
        if (this.options.obscureTextEmails) {
            data = data.replace(/^\w+([.-]\w+)*@\w+([.-]\w+)*\.\w{2,3}$/g, (email) => {
                const [name, domain] = email.split('@');
                const [domainName, host] = domain.split('.');
                return `${(0, utils_js_1.stars)(name)}@${(0, utils_js_1.stars)(domainName)}.${(0, utils_js_1.stars)(host)}`;
            });
        }
        return data;
    }
    isObscured(id) {
        return this.obscured.has(id);
    }
    isHidden(id) {
        return this.hidden.has(id);
    }
    getInnerTextSecure(el) {
        const id = this.app.nodes.getID(el);
        if (!id) {
            return '';
        }
        return this.sanitize(id, el.innerText);
    }
    clear() {
        this.obscured.clear();
        this.hidden.clear();
    }
}
exports.default = Sanitizer;
