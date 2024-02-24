import type App from './index.js';
export declare enum SanitizeLevel {
    Plain = 0,
    Obscured = 1,
    Hidden = 2
}
export interface Options {
    obscureTextEmails: boolean;
    obscureTextNumbers: boolean;
    domSanitizer?: (node: Element) => SanitizeLevel;
}
export declare const stringWiper: (input: string) => string;
export default class Sanitizer {
    private readonly app;
    private readonly obscured;
    private readonly hidden;
    private readonly options;
    constructor(app: App, options: Partial<Options>);
    handleNode(id: number, parentID: number, node: Node): void;
    sanitize(id: number, data: string): string;
    isObscured(id: number): boolean;
    isHidden(id: number): boolean;
    getInnerTextSecure(el: HTMLElement): string;
    clear(): void;
}
