export class StringDictionary {
    constructor() {
        this.idx = 1;
        this.backDict = {};
    }
    getKey(str) {
        let isNew = false;
        if (!this.backDict[str]) {
            isNew = true;
            this.backDict[str] = this.idx++;
        }
        return [this.backDict[str], isNew];
    }
}
export default class AttributeSender {
    constructor(app, isDictDisabled) {
        this.app = app;
        this.isDictDisabled = isDictDisabled;
        this.dict = new StringDictionary();
    }
    sendSetAttribute(id, name, value) {
        if (this.isDictDisabled) {
            const msg = [12 /* Type.SetNodeAttribute */, id, name, value];
            return this.app.send(msg);
        }
        else {
            const message = [
                51 /* Type.SetNodeAttributeDict */,
                id,
                this.applyDict(name),
                this.applyDict(value),
            ];
            return this.app.send(message);
        }
    }
    applyDict(str) {
        const [key, isNew] = this.dict.getKey(str);
        if (isNew) {
            this.app.send([50 /* Type.StringDict */, key, str]);
        }
        return key;
    }
    clear() {
        this.dict = new StringDictionary();
    }
}
