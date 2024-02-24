import App from './index.js';
type Callback = () => void;
export default class Ticker {
    private readonly app;
    private timer;
    private readonly callbacks;
    constructor(app: App);
    /**
     * @param {Callback} callback - repeated cb
     * @param {number} n - number of turn skips; ticker have a 30 ms cycle
     * @param {boolean} useSafe - using safe wrapper to check if app is active
     * @param {object} thisArg - link to <this>
     * */
    attach(callback: Callback, n?: number, useSafe?: boolean, thisArg?: any): void;
    start(): void;
    stop(): void;
}
export {};
