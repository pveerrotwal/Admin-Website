"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_gen_js_1 = require("../app/messages.gen.js");
const guards_js_1 = require("../app/guards.js");
const constructedStyleSheets_js_1 = require("./constructedStyleSheets.js");
function default_1(app) {
    if (app === null) {
        return;
    }
    if (!window.CSSStyleSheet) {
        app.send((0, messages_gen_js_1.TechnicalInfo)('no_stylesheet_prototype_in_window', ''));
        return;
    }
    const sendInsertDeleteRule = app.safe((sheet, index, rule) => {
        const sheetID = constructedStyleSheets_js_1.styleSheetIDMap.get(sheet);
        if (!sheetID) {
            // OK-case. Sheet haven't been registered yet. Rules will be sent on registration.
            return;
        }
        if (typeof rule === 'string') {
            app.send((0, messages_gen_js_1.AdoptedSSInsertRuleURLBased)(sheetID, rule, index, app.getBaseHref()));
        }
        else {
            app.send((0, messages_gen_js_1.AdoptedSSDeleteRule)(sheetID, index));
        }
    });
    // TODO: proper rule insertion/removal (how?)
    const sendReplaceGroupingRule = app.safe((rule) => {
        let topmostRule = rule;
        while (topmostRule.parentRule) {
            topmostRule = topmostRule.parentRule;
        }
        const sheet = topmostRule.parentStyleSheet;
        if (!sheet) {
            app.debug.warn('No parent StyleSheet found for', topmostRule, rule);
            return;
        }
        const sheetID = constructedStyleSheets_js_1.styleSheetIDMap.get(sheet);
        if (!sheetID) {
            app.debug.warn('No sheedID found for', sheet, constructedStyleSheets_js_1.styleSheetIDMap);
            return;
        }
        const cssText = topmostRule.cssText;
        const ruleList = sheet.cssRules;
        const idx = Array.from(ruleList).indexOf(topmostRule);
        if (idx >= 0) {
            app.send((0, messages_gen_js_1.AdoptedSSInsertRuleURLBased)(sheetID, cssText, idx, app.getBaseHref()));
            app.send((0, messages_gen_js_1.AdoptedSSDeleteRule)(sheetID, idx + 1)); // Remove previous clone
        }
        else {
            app.debug.warn('Rule index not found in', sheet, topmostRule);
        }
    });
    const patchContext = app.safe((context) => {
        const { insertRule, deleteRule } = context.CSSStyleSheet.prototype;
        const { insertRule: groupInsertRule, deleteRule: groupDeleteRule } = context.CSSGroupingRule.prototype;
        context.CSSStyleSheet.prototype.insertRule = function (rule, index = 0) {
            sendInsertDeleteRule(this, index, rule);
            return insertRule.call(this, rule, index);
        };
        context.CSSStyleSheet.prototype.deleteRule = function (index) {
            sendInsertDeleteRule(this, index);
            return deleteRule.call(this, index);
        };
        context.CSSGroupingRule.prototype.insertRule = function (rule, index = 0) {
            const result = groupInsertRule.call(this, rule, index);
            sendReplaceGroupingRule(this);
            return result;
        };
        context.CSSGroupingRule.prototype.deleteRule = function (index = 0) {
            const result = groupDeleteRule.call(this, index);
            sendReplaceGroupingRule(this);
            return result;
        };
    });
    patchContext(window);
    app.observer.attachContextCallback(patchContext);
    app.nodes.attachNodeCallback((node) => {
        if (!(0, guards_js_1.hasTag)(node, 'style') || !node.sheet) {
            return;
        }
        if (node.textContent !== null && node.textContent.trim().length > 0) {
            return; // Non-virtual styles captured by the observer as a text
        }
        const nodeID = app.nodes.getID(node);
        if (!nodeID) {
            return;
        }
        const sheet = node.sheet;
        const sheetID = (0, constructedStyleSheets_js_1.nextID)();
        constructedStyleSheets_js_1.styleSheetIDMap.set(sheet, sheetID);
        app.send((0, messages_gen_js_1.AdoptedSSAddOwner)(sheetID, nodeID));
        const rules = sheet.cssRules;
        for (let i = 0; i < rules.length; i++) {
            sendInsertDeleteRule(sheet, i, rules[i].cssText);
        }
    });
}
exports.default = default_1;
