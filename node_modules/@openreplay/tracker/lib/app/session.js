import { generateRandomId } from '../utils.js';
export default class Session {
    constructor(app, options) {
        this.app = app;
        this.options = options;
        this.metadata = {};
        this.userID = null;
        this.callbacks = [];
        this.timestamp = 0;
        this.createTabId();
    }
    attachUpdateCallback(cb) {
        this.callbacks.push(cb);
    }
    handleUpdate(newInfo) {
        if (newInfo.userID == null) {
            delete newInfo.userID;
        }
        if (newInfo.sessionID == null) {
            delete newInfo.sessionID;
        }
        this.callbacks.forEach((cb) => cb(newInfo));
    }
    assign(newInfo) {
        if (newInfo.userID !== undefined) {
            // TODO clear nullable/undefinable types
            this.userID = newInfo.userID;
        }
        if (newInfo.metadata !== undefined) {
            Object.entries(newInfo.metadata).forEach(([k, v]) => (this.metadata[k] = v));
        }
        if (newInfo.sessionID !== undefined) {
            this.sessionID = newInfo.sessionID;
        }
        if (newInfo.timestamp !== undefined) {
            this.timestamp = newInfo.timestamp;
        }
        if (newInfo.projectID !== undefined) {
            this.projectID = newInfo.projectID;
        }
        this.handleUpdate(newInfo);
    }
    setMetadata(key, value) {
        this.metadata[key] = value;
        this.handleUpdate({ metadata: { [key]: value } });
    }
    setUserID(userID) {
        this.userID = userID;
        this.handleUpdate({ userID });
    }
    setUserInfo(userInfo) {
        this.userInfo = userInfo;
    }
    getPageNumber() {
        const pageNoStr = this.app.sessionStorage.getItem(this.options.session_pageno_key);
        if (pageNoStr == null) {
            return undefined;
        }
        return parseInt(pageNoStr);
    }
    incPageNo() {
        let pageNo = this.getPageNumber();
        if (pageNo === undefined) {
            pageNo = 0;
        }
        else {
            pageNo++;
        }
        this.app.sessionStorage.setItem(this.options.session_pageno_key, pageNo.toString());
        return pageNo;
    }
    getSessionToken() {
        return this.app.sessionStorage.getItem(this.options.session_token_key) || undefined;
    }
    setSessionToken(token) {
        this.app.sessionStorage.setItem(this.options.session_token_key, token);
    }
    applySessionHash(hash) {
        const hashParts = decodeURI(hash).split('&');
        let token = hash;
        let pageNoStr = '100500'; // back-compat for sessionToken
        if (hashParts.length == 2) {
            ;
            [pageNoStr, token] = hashParts;
        }
        if (!pageNoStr || !token) {
            return;
        }
        this.app.sessionStorage.setItem(this.options.session_token_key, token);
        this.app.sessionStorage.setItem(this.options.session_pageno_key, pageNoStr);
    }
    getSessionHash() {
        const pageNo = this.getPageNumber();
        const token = this.getSessionToken();
        if (pageNo === undefined || token === undefined) {
            return;
        }
        return encodeURI(String(pageNo) + '&' + token);
    }
    getTabId() {
        if (!this.tabId)
            this.createTabId();
        return this.tabId;
    }
    regenerateTabId() {
        const randomId = generateRandomId(12);
        this.app.sessionStorage.setItem(this.options.session_tabid_key, randomId);
        this.tabId = randomId;
    }
    createTabId() {
        const localId = this.app.sessionStorage.getItem(this.options.session_tabid_key);
        if (localId) {
            this.tabId = localId;
        }
        else {
            this.regenerateTabId();
        }
    }
    getInfo() {
        return {
            sessionID: this.sessionID,
            metadata: this.metadata,
            userID: this.userID,
            timestamp: this.timestamp,
            projectID: this.projectID,
        };
    }
    reset() {
        this.app.sessionStorage.removeItem(this.options.session_token_key);
        this.metadata = {};
        this.userID = null;
        this.sessionID = undefined;
        this.timestamp = 0;
    }
}
