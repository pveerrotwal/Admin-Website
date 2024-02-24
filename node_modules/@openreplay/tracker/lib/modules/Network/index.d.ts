import { RequestResponseData } from './types.js';
import { NetworkRequest } from '../../common/messages.gen.js';
export default function setProxy(context: typeof globalThis, ignoredHeaders: boolean | string[], setSessionTokenHeader: (cb: (name: string, value: string) => void) => void, sanitize: (data: RequestResponseData) => RequestResponseData, sendMessage: (message: NetworkRequest) => void, isServiceUrl: (url: string) => boolean, tokenUrlMatcher?: (url: string) => boolean): void;
