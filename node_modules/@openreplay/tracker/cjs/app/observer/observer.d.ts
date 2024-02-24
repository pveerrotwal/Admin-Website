import App from '../index.js';
export default abstract class Observer {
    protected readonly app: App;
    protected readonly isTopContext: boolean;
    private readonly observer;
    private readonly commited;
    private readonly recents;
    private readonly indexes;
    private readonly attributesMap;
    private readonly textSet;
    constructor(app: App, isTopContext?: boolean);
    private clear;
    private sendNodeAttribute;
    private sendNodeData;
    private bindNode;
    private bindTree;
    private unbindTree;
    private _commitNode;
    private commitNode;
    private commitNodes;
    protected observeRoot(node: Node, beforeCommit: (id?: number) => unknown, nodeToBind?: Node): void;
    disconnect(): void;
}
