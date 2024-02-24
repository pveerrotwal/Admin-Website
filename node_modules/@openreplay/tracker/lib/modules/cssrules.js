import { AdoptedSSInsertRuleURLBased, // TODO: rename to common StyleSheet names
AdoptedSSDeleteRule, AdoptedSSAddOwner, TechnicalInfo, } from '../app/messages.gen.js';
import { hasTag } from '../app/guards.js';
import { nextID, styleSheetIDMap } from './constructedStyleSheets.js';
export default function (app) {
    if (app === null) {
        return;
    }
    if (!window.CSSStyleSheet) {
        app.send(TechnicalInfo('no_stylesheet_prototype_in_window', ''));
        return;
    }
    const sendInsertDeleteRule = app.safe((sheet, index, rule) => {
        const sheetID = styleSheetIDMap.get(sheet);
        if (!sheetID) {
            // OK-case. Sheet haven't been registered yet. Rules will be sent on registration.
            return;
        }
        if (typeof rule === 'string') {
            app.send(AdoptedSSInsertRuleURLBased(sheetID, rule, index, app.getBaseHref()));
        }
        else {
            app.send(AdoptedSSDeleteRule(sheetID, index));
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
        const sheetID = styleSheetIDMap.get(sheet);
        if (!sheetID) {
            app.debug.warn('No sheedID found for', sheet, styleSheetIDMap);
            return;
        }
        const cssText = topmostRule.cssText;
        const ruleList = sheet.cssRules;
        const idx = Array.from(ruleList).indexOf(topmostRule);
        if (idx >= 0) {
            app.send(AdoptedSSInsertRuleURLBased(sheetID, cssText, idx, app.getBaseHref()));
            app.send(AdoptedSSDeleteRule(sheetID, idx + 1)); // Remove previous clone
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
        if (!hasTag(node, 'style') || !node.sheet) {
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
        const sheetID = nextID();
        styleSheetIDMap.set(sheet, sheetID);
        app.send(AdoptedSSAddOwner(sheetID, nodeID));
        const rules = sheet.cssRules;
        for (let i = 0; i < rules.length; i++) {
            sendInsertDeleteRule(sheet, i, rules[i].cssText);
        }
    });
}
