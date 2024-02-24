import { NetworkRequest } from '../../common/messages.gen.js';
import { RequestResponseData } from './types.js';
export declare class BeaconProxyHandler<T extends typeof navigator.sendBeacon> implements ProxyHandler<T> {
    private readonly ignoredHeaders;
    private readonly setSessionTokenHeader;
    private readonly sanitize;
    private readonly sendMessage;
    private readonly isServiceUrl;
    constructor(ignoredHeaders: boolean | string[], setSessionTokenHeader: (cb: (name: string, value: string) => void) => void, sanitize: (data: RequestResponseData) => RequestResponseData, sendMessage: (item: NetworkRequest) => void, isServiceUrl: (url: string) => boolean);
    apply(target: T, thisArg: T, argsList: any[]): any;
}
export default class BeaconProxy {
    static origSendBeacon: (url: string | URL, data?: BodyInit | null | undefined) => boolean;
    static hasSendBeacon(): boolean;
    static create(ignoredHeaders: boolean | string[], setSessionTokenHeader: (cb: (name: string, value: string) => void) => void, sanitize: (data: RequestResponseData) => RequestResponseData, sendMessage: (item: NetworkRequest) => void, isServiceUrl: (url: string) => boolean): any;
}
