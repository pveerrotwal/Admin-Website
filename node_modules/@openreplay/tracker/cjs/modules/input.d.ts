import type App from '../app/index.js';
type TextFieldElement = HTMLInputElement | HTMLTextAreaElement;
export declare function getInputLabel(node: TextFieldElement): string;
export declare const InputMode: {
    readonly Plain: 0;
    readonly Obscured: 1;
    readonly Hidden: 2;
};
export type InputModeT = (typeof InputMode)[keyof typeof InputMode];
export interface Options {
    obscureInputNumbers: boolean;
    obscureInputEmails: boolean;
    defaultInputMode: InputModeT;
    obscureInputDates: boolean;
}
export default function (app: App, opts: Partial<Options>): void;
export {};
