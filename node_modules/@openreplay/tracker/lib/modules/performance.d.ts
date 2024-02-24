import type App from '../app/index.js';
export declare const deviceMemory: number;
export declare const jsHeapSizeLimit: number;
export interface Options {
    capturePerformance: boolean;
}
export default function (app: App, opts: Partial<Options>): void;
