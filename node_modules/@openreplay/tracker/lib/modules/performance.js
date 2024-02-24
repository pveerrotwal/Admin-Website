import { IN_BROWSER } from '../utils.js';
import { PerformanceTrack } from '../app/messages.gen.js';
const perf = IN_BROWSER && 'performance' in window && 'memory' in performance // works in Chrome only
    ? performance
    : { memory: {} };
export const deviceMemory = IN_BROWSER ? (navigator.deviceMemory || 0) * 1024 : 0;
export const jsHeapSizeLimit = perf.memory.jsHeapSizeLimit || 0;
export default function (app, opts) {
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
        app.send(PerformanceTrack(frames, ticks, perf.memory.totalJSHeapSize || 0, perf.memory.usedJSHeapSize || 0));
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
