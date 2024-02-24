function wrap(callback, n) {
    let t = 0;
    return () => {
        if (t++ >= n) {
            t = 0;
            callback();
        }
    };
}
export default class Ticker {
    constructor(app) {
        this.app = app;
        this.timer = null;
        this.callbacks = [];
    }
    /**
     * @param {Callback} callback - repeated cb
     * @param {number} n - number of turn skips; ticker have a 30 ms cycle
     * @param {boolean} useSafe - using safe wrapper to check if app is active
     * @param {object} thisArg - link to <this>
     * */
    attach(callback, n = 0, useSafe = true, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        if (useSafe) {
            callback = this.app.safe(callback);
        }
        this.callbacks.unshift(n ? wrap(callback, n) : callback) - 1;
    }
    start() {
        if (this.timer === null) {
            this.timer = setInterval(() => this.callbacks.forEach((cb) => {
                if (cb)
                    cb();
            }), 30);
        }
    }
    stop() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}
