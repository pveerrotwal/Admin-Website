import type App from '../app/index.js';
declare function selection(app: App): void;
export default selection;
/** TODO: research how to get all in-between nodes inside selection range
 *        including nodes between anchor and focus nodes and their children
 *        without recursively searching the dom tree
 */
