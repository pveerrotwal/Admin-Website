import type App from '../app/index.js';
export interface MouseHandlerOptions {
    disableClickmaps?: boolean;
    /** minimum length of an optimised selector.
     *
     * body > div > div > p => body > p for example
     *
     * default 2
     * */
    minSelectorDepth?: number;
    /** how many selectors to try before falling back to nth-child selectors
     * performance expensive operation
     *
     * default 1000
     * */
    nthThreshold?: number;
    /**
     * how many tries to optimise and shorten the selector
     *
     * default 10_000
     * */
    maxOptimiseTries?: number;
    /**
     * how many ticks to wait before capturing mouse position
     * (can affect performance)
     * 1 tick = 30ms
     * default 7
     * */
    trackingOffset?: number;
}
export default function (app: App, options?: MouseHandlerOptions): void;
