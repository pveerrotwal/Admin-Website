import type App from '../app/index.js';
export interface Options {
    captureResourceTimings: boolean;
    capturePageLoadTimings: boolean;
    capturePageRenderTimings: boolean;
    excludedResourceUrls?: Array<string>;
}
export default function (app: App, opts: Partial<Options>): void;
