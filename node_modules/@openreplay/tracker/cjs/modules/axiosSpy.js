"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_gen_js_1 = require("../app/messages.gen.js");
const utils_js_1 = require("../utils.js");
const exception_js_1 = require("./exception.js");
function default_1(app, instance, opts, sanitize, stringify) {
    app.debug.log('Openreplay: attaching axios spy to instance', instance);
    function captureResponseData(axiosResponseObj) {
        app.debug.log('Openreplay: capturing axios response data', axiosResponseObj);
        const { headers: reqHs, data: reqData, method, url, baseURL } = axiosResponseObj.config;
        const { data: rData, headers: rHs, status: globStatus, response } = axiosResponseObj;
        const { data: resData, headers: resHs, status: resStatus } = response || {};
        const ihOpt = opts.ignoreHeaders;
        const isHIgnoring = Array.isArray(ihOpt) ? (name) => ihOpt.includes(name) : () => ihOpt;
        function writeHeader(hsObj, header) {
            if (!isHIgnoring(header[0])) {
                hsObj[header[0]] = header[1];
            }
        }
        let requestHs = {};
        let responseHs = {};
        if (reqHs.toJSON) {
            requestHs = reqHs.toJSON();
        }
        else if (reqHs instanceof Headers) {
            reqHs.forEach((v, n) => writeHeader(requestHs, [n, v]));
        }
        else if (Array.isArray(reqHs)) {
            reqHs.forEach((h) => writeHeader(requestHs, h));
        }
        else if (typeof reqHs === 'object') {
            Object.entries(reqHs).forEach((h) => writeHeader(requestHs, h));
        }
        const usedResHeader = resHs ? resHs : rHs;
        if (usedResHeader.toJSON) {
            responseHs = usedResHeader.toJSON();
        }
        else if (usedResHeader instanceof Headers) {
            usedResHeader.forEach((v, n) => writeHeader(responseHs, [n, v]));
        }
        else if (Array.isArray(usedResHeader)) {
            usedResHeader.forEach((h) => writeHeader(responseHs, h));
        }
        else if (typeof usedResHeader === 'object') {
            Object.entries(usedResHeader).forEach(([n, v]) => {
                if (!isHIgnoring(n))
                    responseHs[n] = v;
            });
        }
        const reqResInfo = sanitize({
            url,
            method: method || '',
            status: globStatus || resStatus || 0,
            request: {
                headers: requestHs,
                body: reqData,
            },
            response: {
                headers: responseHs,
                body: resData || rData,
            },
        });
        if (!reqResInfo) {
            app.debug.log('Openreplay: empty request/response info, skipping');
            return;
        }
        const requestStart = axiosResponseObj.config.__openreplay_timing;
        const duration = performance.now() - requestStart;
        app.debug.log('Openreplay: final req object', reqResInfo);
        app.send((0, messages_gen_js_1.NetworkRequest)('xhr', String(method), String(reqResInfo.url), stringify(reqResInfo.request), stringify(reqResInfo.response), reqResInfo.status, requestStart + (0, utils_js_1.getTimeOrigin)(), duration, 0));
    }
    function getStartTime(config) {
        app.debug.log('Openreplay: capturing API request', config);
        config.__openreplay_timing = performance.now();
        if (opts.sessionTokenHeader) {
            const header = typeof opts.sessionTokenHeader === 'string'
                ? opts.sessionTokenHeader
                : 'X-OpenReplay-Session-Token';
            const headerValue = app.getSessionToken();
            if (headerValue) {
                config.headers.set(header, headerValue);
            }
        }
        return config;
    }
    function captureNetworkRequest(response) {
        if (opts.failuresOnly)
            return response;
        captureResponseData(response);
        return response;
    }
    function captureNetworkError(error) {
        app.debug.log('Openreplay: capturing API request error', error);
        if (isAxiosError(error) && Boolean(error.response)) {
            captureResponseData(error.response);
        }
        else if (error instanceof Error) {
            app.send((0, exception_js_1.getExceptionMessage)(error, []));
        }
        return Promise.reject(error);
    }
    function logRequestError(ev) {
        app.debug.log('Openreplay: failed API request, skipping', ev);
    }
    const reqInt = instance.interceptors.request.use(getStartTime, logRequestError, {
        synchronous: true,
    });
    const resInt = instance.interceptors.response.use(captureNetworkRequest, captureNetworkError, {
        synchronous: true,
    });
    app.attachStopCallback(() => {
        var _a, _b, _c, _d;
        (_b = (_a = instance.interceptors.request).eject) === null || _b === void 0 ? void 0 : _b.call(_a, reqInt);
        (_d = (_c = instance.interceptors.response).eject) === null || _d === void 0 ? void 0 : _d.call(_c, resInt);
    });
}
exports.default = default_1;
function isAxiosError(payload) {
    return isObject(payload) && payload.isAxiosError === true;
}
function isObject(thing) {
    return thing !== null && typeof thing === 'object';
}
