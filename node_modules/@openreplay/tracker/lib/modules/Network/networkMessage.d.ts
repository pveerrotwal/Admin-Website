import { RequestResponseData } from './types.js';
export type httpMethod = '' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
export declare enum RequestState {
    UNSENT = 0,
    OPENED = 1,
    HEADERS_RECEIVED = 2,
    LOADING = 3,
    DONE = 4
}
/**
 * I know we're not using most of the information from this class
 * but it can be useful in the future if we will decide to display more stuff in our ui
 * */
export default class NetworkMessage {
    private readonly ignoredHeaders;
    private readonly setSessionTokenHeader;
    private readonly sanitize;
    id: string;
    name?: string;
    method: httpMethod;
    url: string;
    status: number;
    statusText?: string;
    cancelState?: 0 | 1 | 2 | 3;
    readyState?: RequestState;
    header: {
        [key: string]: string;
    };
    responseType: XMLHttpRequest['responseType'];
    requestType: 'xhr' | 'fetch' | 'ping' | 'custom' | 'beacon';
    requestHeader: HeadersInit;
    response: any;
    responseSize: number;
    responseSizeText: string;
    startTime: number;
    endTime: number;
    duration: number;
    getData: {
        [key: string]: string;
    };
    requestData: string | null;
    constructor(ignoredHeaders: boolean | string[], setSessionTokenHeader: (cb: (name: string, value: string) => void) => void, sanitize: (data: RequestResponseData) => RequestResponseData);
    getMessage(): import("../../common/messages.gen.js").NetworkRequest;
    writeHeaders(): {
        reqHs: Record<string, string>;
        resHs: Record<string, string>;
    };
    isHeaderIgnored(key: string): boolean;
}
