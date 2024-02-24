import { TabChange } from '../app/messages.gen.js';
export default function (app) {
    function changeTab() {
        if (!document.hidden) {
            app.debug.log('Openreplay: tab change to' + app.session.getTabId());
            app.send(TabChange(app.session.getTabId()));
        }
    }
    app.attachEventListener(window, 'focus', changeTab, false, false);
}
