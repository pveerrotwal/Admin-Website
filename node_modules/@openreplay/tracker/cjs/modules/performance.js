"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsHeapSizeLimit = exports.deviceMemory = void 0;
const utils_js_1 = require("../utils.js");
const messages_gen_js_1 = require("../app/messages.gen.js");
const perf = utils_js_1.IN_BROWSER && 'performance' in window && 'memory' in performance // works in Chrome only
    ? performance
    : { memory: {} };
exports.deviceMemory = utils_js_1.IN_BROWSER ? (navigator.deviceMemory || 0) * 1024 : 0;
exports.jsHeapSizeLimit = perf.memory.jsHeapSizeLimit || 0;
function default_1(app, opts) {
    const options = Object.assign({
        capturePerformance: true,
    }, opts);
    if (!options.capturePerformance) {
        return;
    }
    let frames;
    let ticks;
    const nextFrame = () => {
        if (frames === undefined || frames === -1) {
            return;
        }
        frames++;
        requestAnimationFrame(nextFrame);
    };
    app.ticker.attach(() => {
        if (ticks === undefined || ticks === -1) {
            return;
        }
        ticks++;
    }, 0, false);
    const sendPerformanceTrack = () => {
        if (frames === undefined || ticks === undefined) {
            return;
        }
        app.send((0, messages_gen_js_1.PerformanceTrack)(frames, ticks, perf.memory.totalJSHeapSize || 0, perf.memory.usedJSHeapSize || 0));
        ticks = frames = document.hidden ? -1 : 0;
    };
    app.attachStartCallback(() => {
        ticks = frames = -1;
        sendPerformanceTrack();
        nextFrame();
    });
    app.attachStopCallback(() => {
        ticks = frames = undefined;
    });
    app.ticker.attach(sendPerformanceTrack, 40, false);
    if (document.hidden !== undefined) {
        app.attachEventListener(document, 'visibilitychange', sendPerformanceTrack, false, false);
    }
}
exports.default = default_1;
