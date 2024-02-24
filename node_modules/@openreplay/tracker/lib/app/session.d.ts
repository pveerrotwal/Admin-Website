import type App from './index.js';
interface UserInfo {
    userBrowser: string;
    userCity: string;
    userCountry: string;
    userDevice: string;
    userOS: string;
    userState: string;
}
interface SessionInfo {
    sessionID: string | undefined;
    metadata: Record<string, string>;
    userID: string | null;
    timestamp: number;
    projectID?: string;
}
type OnUpdateCallback = (i: Partial<SessionInfo>) => void;
export type Options = {
    session_token_key: string;
    session_pageno_key: string;
    session_tabid_key: string;
};
export default class Session {
    private readonly app;
    private readonly options;
    private metadata;
    private userID;
    private sessionID;
    private readonly callbacks;
    private timestamp;
    private projectID;
    private tabId;
    userInfo: UserInfo;
    constructor(app: App, options: Options);
    attachUpdateCallback(cb: OnUpdateCallback): void;
    private handleUpdate;
    assign(newInfo: Partial<SessionInfo>): void;
    setMetadata(key: string, value: string): void;
    setUserID(userID: string): void;
    setUserInfo(userInfo: UserInfo): void;
    private getPageNumber;
    incPageNo(): number;
    getSessionToken(): string | undefined;
    setSessionToken(token: string): void;
    applySessionHash(hash: string): void;
    getSessionHash(): string | undefined;
    getTabId(): string;
    regenerateTabId(): void;
    private createTabId;
    getInfo(): SessionInfo;
    reset(): void;
}
export {};
