import App from '../app/index.js';
export declare class StringDictionary {
    private idx;
    private backDict;
    getKey(str: string): [number, boolean];
}
export default class AttributeSender {
    private readonly app;
    private readonly isDictDisabled;
    private dict;
    constructor(app: App, isDictDisabled: boolean);
    sendSetAttribute(id: number, name: string, value: string): void;
    private applyDict;
    clear(): void;
}
