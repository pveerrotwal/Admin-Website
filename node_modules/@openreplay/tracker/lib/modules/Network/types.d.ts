export interface RequestResponseData {
    readonly status: number;
    readonly method: string;
    url: string;
    request: {
        body: string | null;
        headers: Record<string, string>;
    };
    response: {
        body: string | null;
        headers: Record<string, string>;
    };
}
