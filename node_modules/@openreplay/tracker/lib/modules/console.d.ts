import type App from '../app/index.js';
export interface Options {
    consoleMethods: Array<string> | null;
    consoleThrottling: number;
}
export default function (app: App, opts: Partial<Options>): void;
