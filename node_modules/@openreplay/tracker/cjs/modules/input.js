"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputMode = exports.getInputLabel = void 0;
const utils_js_1 = require("../utils.js");
const guards_js_1 = require("../app/guards.js");
const messages_gen_js_1 = require("../app/messages.gen.js");
const INPUT_TYPES = [
    'text',
    'password',
    'email',
    'search',
    'number',
    'range',
    'date',
    'tel',
    'time',
];
function isTextFieldElement(node) {
    if ((0, guards_js_1.hasTag)(node, 'textarea')) {
        return true;
    }
    if (!(0, guards_js_1.hasTag)(node, 'input')) {
        return false;
    }
    return INPUT_TYPES.includes(node.type);
}
function isCheckbox(node) {
    if (!(0, guards_js_1.hasTag)(node, 'input')) {
        return false;
    }
    const type = node.type;
    return type === 'checkbox' || type === 'radio';
}
const labelElementFor = utils_js_1.IN_BROWSER && 'labels' in HTMLInputElement.prototype
    ? (node) => {
        let p = node;
        while ((p = p.parentNode) !== null) {
            if ((0, guards_js_1.hasTag)(p, 'label')) {
                return p;
            }
        }
        const labels = node.labels;
        if (labels !== null && labels.length === 1) {
            return labels[0];
        }
    }
    : (node) => {
        let p = node;
        while ((p = p.parentNode) !== null) {
            if ((0, guards_js_1.hasTag)(p, 'label')) {
                return p;
            }
        }
        const id = node.id;
        if (id) {
            const labels = node.ownerDocument.querySelectorAll('label[for="' + id + '"]');
            if (labels !== null && labels.length === 1) {
                return labels[0];
            }
        }
    };
function getInputLabel(node) {
    let label = (0, utils_js_1.getLabelAttribute)(node);
    if (label === null) {
        const labelElement = labelElementFor(node);
        label =
            (labelElement && labelElement.innerText) ||
                node.placeholder ||
                node.name ||
                node.id ||
                node.className ||
                node.type;
    }
    return (0, utils_js_1.normSpaces)(label).slice(0, 100);
}
exports.getInputLabel = getInputLabel;
exports.InputMode = {
    Plain: 0,
    Obscured: 1,
    Hidden: 2,
};
function default_1(app, opts) {
    const options = Object.assign({
        obscureInputNumbers: true,
        obscureInputEmails: true,
        defaultInputMode: exports.InputMode.Obscured,
        obscureInputDates: false,
    }, opts);
    function getInputValue(id, node) {
        let value = node.value;
        let inputMode = options.defaultInputMode;
        if (node.type === 'password' || app.sanitizer.isHidden(id)) {
            inputMode = exports.InputMode.Hidden;
        }
        else if (app.sanitizer.isObscured(id) ||
            (inputMode === exports.InputMode.Plain &&
                ((options.obscureInputNumbers && node.type !== 'date' && /\d\d\d\d/.test(value)) ||
                    (options.obscureInputDates && node.type === 'date') ||
                    (options.obscureInputEmails && (node.type === 'email' || !!~value.indexOf('@')))))) {
            inputMode = exports.InputMode.Obscured;
        }
        let mask = 0;
        switch (inputMode) {
            case exports.InputMode.Hidden:
                mask = -1;
                value = '';
                break;
            case exports.InputMode.Obscured:
                mask = value.length;
                value = '';
                break;
        }
        return { value, mask };
    }
    function sendInputValue(id, node) {
        const { value, mask } = getInputValue(id, node);
        app.send((0, messages_gen_js_1.SetInputValue)(id, value, mask));
    }
    const inputValues = new Map();
    const checkboxValues = new Map();
    app.attachStopCallback(() => {
        inputValues.clear();
        checkboxValues.clear();
    });
    function trackInputValue(id, node) {
        if (inputValues.get(id) === node.value) {
            return;
        }
        inputValues.set(id, node.value);
        sendInputValue(id, node);
    }
    function trackCheckboxValue(id, value) {
        if (checkboxValues.get(id) === value) {
            return;
        }
        checkboxValues.set(id, value);
        app.send((0, messages_gen_js_1.SetInputChecked)(id, value));
    }
    // The only way (to our knowledge) to track all kinds of input changes, including those made by JS
    app.ticker.attach(() => {
        inputValues.forEach((value, id) => {
            const node = app.nodes.getNode(id);
            if (!node)
                return inputValues.delete(id);
            trackInputValue(id, node);
        });
        checkboxValues.forEach((checked, id) => {
            const node = app.nodes.getNode(id);
            if (!node)
                return checkboxValues.delete(id);
            trackCheckboxValue(id, node.checked);
        });
    }, 3);
    function sendInputChange(id, node, hesitationTime, inputTime) {
        const { value, mask } = getInputValue(id, node);
        const label = getInputLabel(node);
        app.send((0, messages_gen_js_1.InputChange)(id, value, mask !== 0, label, hesitationTime, inputTime));
    }
    app.nodes.attachNodeCallback(app.safe((node) => {
        const id = app.nodes.getID(node);
        if (id === undefined) {
            return;
        }
        // TODO: support multiple select (?): use selectedOptions;
        if ((0, guards_js_1.hasTag)(node, 'select')) {
            sendInputValue(id, node);
            app.nodes.attachNodeListener(node, 'change', () => sendInputValue(id, node));
        }
        if (isTextFieldElement(node)) {
            trackInputValue(id, node);
            let nodeFocusTime = 0;
            let nodeHesitationTime = 0;
            let inputTime = 0;
            const onFocus = () => {
                nodeFocusTime = (0, utils_js_1.now)();
            };
            const onInput = () => {
                if (nodeHesitationTime === 0 && nodeFocusTime !== 0) {
                    nodeHesitationTime = (0, utils_js_1.now)() - nodeFocusTime;
                }
            };
            const onChange = () => {
                if (nodeFocusTime !== 0) {
                    inputTime = (0, utils_js_1.now)() - nodeFocusTime;
                }
                sendInputChange(id, node, nodeHesitationTime, inputTime);
                nodeHesitationTime = 0;
                inputTime = 0;
                nodeFocusTime = 0;
            };
            app.nodes.attachNodeListener(node, 'focus', onFocus);
            app.nodes.attachNodeListener(node, 'input', onInput);
            app.nodes.attachNodeListener(node, 'change', onChange);
            return;
        }
        if (isCheckbox(node)) {
            trackCheckboxValue(id, node.checked);
            app.nodes.attachNodeListener(node, 'change', () => trackCheckboxValue(id, node.checked));
            return;
        }
    }));
}
exports.default = default_1;
