import type App from '../app/index.js';
import type { AxiosInstance } from './axiosSpy.js';
interface RequestData {
    body: string | null;
    headers: Record<string, string>;
}
interface ResponseData {
    body: any;
    headers: Record<string, string>;
}
export interface RequestResponseData {
    readonly status: number;
    readonly method: string;
    url: string;
    request: RequestData;
    response: ResponseData;
}
type Sanitizer = (data: RequestResponseData) => RequestResponseData;
export interface Options {
    sessionTokenHeader: string | boolean;
    failuresOnly: boolean;
    ignoreHeaders: Array<string> | boolean;
    capturePayload: boolean;
    captureInIframes: boolean;
    sanitizer?: Sanitizer;
    axiosInstances?: Array<AxiosInstance>;
    useProxy?: boolean;
    tokenUrlMatcher?: (url: string) => boolean;
}
export default function (app: App, opts?: Partial<Options>): void;
export {};
