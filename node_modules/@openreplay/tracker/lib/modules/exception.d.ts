import type App from '../app/index.js';
import type Message from '../app/messages.gen.js';
export interface Options {
    captureExceptions: boolean;
}
interface StackFrame {
    columnNumber?: number;
    lineNumber?: number;
    fileName?: string;
    functionName?: string;
    source?: string;
}
export declare function getExceptionMessage(error: Error, fallbackStack: Array<StackFrame>, metadata?: Record<string, any>): Message;
export declare function getExceptionMessageFromEvent(e: ErrorEvent | PromiseRejectionEvent, context?: typeof globalThis, metadata?: Record<string, any>): Message | null;
export default function (app: App, opts: Partial<Options>): void;
export {};
