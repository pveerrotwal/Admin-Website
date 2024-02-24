"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guards_js_1 = require("../app/guards.js");
const utils_js_1 = require("../utils.js");
const messages_gen_js_1 = require("../app/messages.gen.js");
const input_js_1 = require("./input.js");
const finder_1 = require("@medv/finder");
function _getSelector(target, document, options) {
    const selector = (0, finder_1.finder)(target, {
        root: document.body,
        seedMinLength: 3,
        optimizedMinLength: (options === null || options === void 0 ? void 0 : options.minSelectorDepth) || 2,
        threshold: (options === null || options === void 0 ? void 0 : options.nthThreshold) || 1000,
        maxNumberOfTries: (options === null || options === void 0 ? void 0 : options.maxOptimiseTries) || 10000,
    });
    return selector;
}
function isClickable(element) {
    const tag = element.tagName.toUpperCase();
    return (tag === 'BUTTON' ||
        tag === 'A' ||
        tag === 'LI' ||
        tag === 'SELECT' ||
        tag === 'TR' ||
        tag === 'TH' ||
        element.onclick != null ||
        element.getAttribute('role') === 'button');
    //|| element.className.includes("btn")
    // MBTODO: intercept addEventListener
}
//TODO: fix (typescript is not sure about target variable after assignation of svg)
function getTarget(target, document) {
    if (target instanceof Element) {
        return _getTarget(target, document);
    }
    return null;
}
function _getTarget(target, document) {
    let element = target;
    while (element !== null && element !== document.documentElement) {
        if ((0, utils_js_1.hasOpenreplayAttribute)(element, 'masked')) {
            return null;
        }
        element = element.parentElement;
    }
    if ((0, guards_js_1.isSVGElement)(target)) {
        let owner = target.ownerSVGElement;
        while (owner !== null) {
            target = owner;
            owner = owner.ownerSVGElement;
        }
    }
    element = target;
    while (element !== null && element !== document.documentElement) {
        const tag = element.tagName.toUpperCase();
        if (tag === 'LABEL') {
            return null;
        }
        if (tag === 'INPUT') {
            return element;
        }
        if (isClickable(element) || (0, utils_js_1.getLabelAttribute)(element) !== null) {
            return element;
        }
        element = element.parentElement;
    }
    return target === document.documentElement ? null : target;
}
function default_1(app, options) {
    const { disableClickmaps = false } = options || {};
    function getTargetLabel(target) {
        const dl = (0, utils_js_1.getLabelAttribute)(target);
        if (dl !== null) {
            return dl;
        }
        if ((0, guards_js_1.hasTag)(target, 'input')) {
            return (0, input_js_1.getInputLabel)(target);
        }
        if (isClickable(target)) {
            let label = '';
            if (target instanceof HTMLElement) {
                label = app.sanitizer.getInnerTextSecure(target);
            }
            label = label || target.id || target.className;
            return (0, utils_js_1.normSpaces)(label).slice(0, 100);
        }
        return '';
    }
    let mousePositionX = -1;
    let mousePositionY = -1;
    let mousePositionChanged = false;
    let mouseTarget = null;
    let mouseTargetTime = 0;
    let selectorMap = {};
    let velocity = 0;
    let direction = 0;
    let directionChangeCount = 0;
    let distance = 0;
    let checkIntervalId;
    const shakeThreshold = 0.008;
    const shakeCheckInterval = 225;
    function checkMouseShaking() {
        const nextVelocity = distance / shakeCheckInterval;
        if (!velocity) {
            velocity = nextVelocity;
            return;
        }
        const acceleration = (nextVelocity - velocity) / shakeCheckInterval;
        if (directionChangeCount > 4 && acceleration > shakeThreshold) {
            app.send((0, messages_gen_js_1.MouseThrashing)((0, utils_js_1.now)()));
        }
        distance = 0;
        directionChangeCount = 0;
        velocity = nextVelocity;
    }
    app.attachStartCallback(() => {
        checkIntervalId = setInterval(() => checkMouseShaking(), shakeCheckInterval);
    });
    app.attachStopCallback(() => {
        mousePositionX = -1;
        mousePositionY = -1;
        mousePositionChanged = false;
        mouseTarget = null;
        selectorMap = {};
        if (checkIntervalId) {
            clearInterval(checkIntervalId);
        }
    });
    const sendMouseMove = () => {
        if (mousePositionChanged) {
            app.send((0, messages_gen_js_1.MouseMove)(mousePositionX, mousePositionY));
            mousePositionChanged = false;
        }
    };
    const patchDocument = (document, topframe = false) => {
        function getSelector(id, target, options) {
            return (selectorMap[id] = selectorMap[id] || _getSelector(target, document, options));
        }
        const attachListener = topframe
            ? app.attachEventListener.bind(app) // attached/removed on start/stop
            : app.nodes.attachNodeListener.bind(app.nodes); // attached/removed on node register/unregister
        attachListener(document.documentElement, 'mouseover', (e) => {
            const target = getTarget(e.target, document);
            if (target !== mouseTarget) {
                mouseTarget = target;
                mouseTargetTime = performance.now();
            }
        });
        attachListener(document, 'mousemove', (e) => {
            const [left, top] = app.observer.getDocumentOffset(document); // MBTODO?: document-id related message
            mousePositionX = e.clientX + left;
            mousePositionY = e.clientY + top;
            mousePositionChanged = true;
            const nextDirection = Math.sign(e.movementX);
            distance += Math.abs(e.movementX) + Math.abs(e.movementY);
            if (nextDirection !== direction) {
                direction = nextDirection;
                directionChangeCount++;
            }
        }, false);
        attachListener(document, 'click', (e) => {
            const target = getTarget(e.target, document);
            if ((!e.clientX && !e.clientY) || target === null) {
                return;
            }
            const id = app.nodes.getID(target);
            if (id !== undefined) {
                sendMouseMove();
                app.send((0, messages_gen_js_1.MouseClick)(id, mouseTarget === target ? Math.round(performance.now() - mouseTargetTime) : 0, getTargetLabel(target), isClickable(target) && !disableClickmaps ? getSelector(id, target, options) : ''), true);
            }
            mouseTarget = null;
        });
    };
    app.nodes.attachNodeCallback((node) => {
        if ((0, guards_js_1.isDocument)(node)) {
            patchDocument(node);
        }
    });
    patchDocument(document, true);
    app.ticker.attach(sendMouseMove, (options === null || options === void 0 ? void 0 : options.trackingOffset) || 7);
}
exports.default = default_1;
