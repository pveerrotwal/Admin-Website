"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("../utils.js");
const messages_gen_js_1 = require("../app/messages.gen.js");
const printError = utils_js_1.IN_BROWSER && 'InstallTrigger' in window // detect Firefox
    ? (e) => e.message + '\n' + e.stack
    : (e) => e.stack || e.message;
function printString(arg) {
    if (arg === undefined) {
        return 'undefined';
    }
    if (arg === null) {
        return 'null';
    }
    if (arg instanceof Error) {
        return printError(arg);
    }
    if (Array.isArray(arg)) {
        return `Array(${arg.length})`;
    }
    return String(arg);
}
function printFloat(arg) {
    if (typeof arg !== 'number')
        return 'NaN';
    return arg.toString();
}
function printInt(arg) {
    if (typeof arg !== 'number')
        return 'NaN';
    return Math.floor(arg).toString();
}
function printObject(arg) {
    if (arg === undefined) {
        return 'undefined';
    }
    if (arg === null) {
        return 'null';
    }
    if (arg instanceof Error) {
        return printError(arg);
    }
    if (Array.isArray(arg)) {
        const length = arg.length;
        const values = arg.slice(0, 10).map(printString).join(', ');
        return `Array(${length})[${values}]`;
    }
    if (typeof arg === 'object') {
        const res = [];
        let i = 0;
        for (const k in arg) {
            if (++i === 10) {
                break;
            }
            const v = arg[k];
            res.push(k + ': ' + printString(v));
        }
        return '{' + res.join(', ') + '}';
    }
    return arg.toString();
}
function printf(args) {
    if (typeof args[0] === 'string') {
        args.unshift(args.shift().replace(/%(o|s|f|d|i)/g, (s, t) => {
            const arg = args.shift();
            if (arg === undefined)
                return s;
            switch (t) {
                case 'o':
                    return printObject(arg);
                case 's':
                    return printString(arg);
                case 'f':
                    return printFloat(arg);
                case 'd':
                case 'i':
                    return printInt(arg);
                default:
                    return s;
            }
        }));
    }
    return args.map(printObject).join(' ');
}
const consoleMethods = ['log', 'info', 'warn', 'error', 'debug', 'assert'];
function default_1(app, opts) {
    const options = Object.assign({
        consoleMethods,
        consoleThrottling: 30,
    }, opts);
    if (!Array.isArray(options.consoleMethods) || options.consoleMethods.length === 0) {
        return;
    }
    const sendConsoleLog = app.safe((level, args) => app.send((0, messages_gen_js_1.ConsoleLog)(level, printf(args))));
    let n = 0;
    const reset = () => {
        n = 0;
    };
    app.attachStartCallback(reset);
    app.ticker.attach(reset, 33, false);
    const patchConsole = (console, ctx) => {
        const handler = {
            apply: function (target, thisArg, argumentsList) {
                Reflect.apply(target, ctx, argumentsList);
                n = n + 1;
                if (n > options.consoleThrottling) {
                    return;
                }
                else {
                    sendConsoleLog(target.name, argumentsList);
                }
            },
        };
        options.consoleMethods.forEach((method) => {
            if (consoleMethods.indexOf(method) === -1) {
                app.debug.error(`OpenReplay: unsupported console method "${method}"`);
                return;
            }
            const fn = ctx.console[method];
            console[method] = new Proxy(fn, handler);
        });
    };
    const patchContext = app.safe((context) => patchConsole(context.console, context));
    patchContext(window);
    app.observer.attachContextCallback(patchContext);
}
exports.default = default_1;
