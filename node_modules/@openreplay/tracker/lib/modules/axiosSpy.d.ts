import type App from '../app/index.js';
import type { RequestResponseData, Options } from './network.js';
interface RawAxiosHeaders {
    [key: string]: string;
}
interface AxiosRequestConfig {
    url: string;
    method?: string;
    baseURL?: string;
    status?: number;
    headers: {
        toJSON(): RawAxiosHeaders;
    };
    params?: any;
    data?: any;
}
interface InternalAxiosRequestConfig extends AxiosRequestConfig {
    __openreplay_timing: number;
    headers: {
        toJSON(): RawAxiosHeaders;
        set(name: string, value: string): void;
    };
}
interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: {
        toJSON(): RawAxiosHeaders;
    };
    config: InternalAxiosRequestConfig;
    request?: any;
    response?: AxiosRequestConfig;
}
export interface AxiosInstance extends Record<string, any> {
    getUri: (config?: AxiosRequestConfig) => string;
    interceptors: {
        request: AxiosInterceptorManager<InternalAxiosRequestConfig>;
        response: AxiosInterceptorManager<AxiosResponse>;
    };
}
export interface AxiosInterceptorOptions {
    synchronous?: boolean;
}
export interface AxiosInterceptorManager<V> {
    use(onFulfilled?: ((value: V) => V | Promise<V>) | null, onRejected?: ((error: any) => any) | null, options?: AxiosInterceptorOptions): number;
    eject?: (id: number) => void;
    clear?: () => void;
}
export default function (app: App, instance: AxiosInstance, opts: Options, sanitize: (data: RequestResponseData) => RequestResponseData | null, stringify: (data: {
    headers: Record<string, string>;
    body: any;
}) => string): void;
export {};
