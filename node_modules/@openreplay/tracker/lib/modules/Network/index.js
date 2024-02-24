import FetchProxy from './fetchProxy.js';
import XHRProxy from './xhrProxy.js';
import BeaconProxy from './beaconProxy.js';
const getWarning = (api) => console.warn(`Openreplay: Can't find ${api} in global context. 
If you're using serverside rendering in your app, make sure that tracker is loaded dynamically, otherwise ${api} won't be tracked.`);
export default function setProxy(context, ignoredHeaders, setSessionTokenHeader, sanitize, sendMessage, isServiceUrl, tokenUrlMatcher) {
    var _a;
    if (context.XMLHttpRequest) {
        context.XMLHttpRequest = XHRProxy.create(ignoredHeaders, setSessionTokenHeader, sanitize, sendMessage, isServiceUrl, tokenUrlMatcher);
    }
    else {
        getWarning('XMLHttpRequest');
    }
    if (context.fetch) {
        context.fetch = FetchProxy.create(ignoredHeaders, setSessionTokenHeader, sanitize, sendMessage, isServiceUrl, tokenUrlMatcher);
    }
    else {
        getWarning('fetch');
    }
    if ((_a = context === null || context === void 0 ? void 0 : context.navigator) === null || _a === void 0 ? void 0 : _a.sendBeacon) {
        context.navigator.sendBeacon = BeaconProxy.create(ignoredHeaders, setSessionTokenHeader, sanitize, sendMessage, isServiceUrl);
    }
}
