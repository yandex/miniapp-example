export type YMetrikaVisitParams = object | object[];

export type YMetrikaInitParams = {
    defer?: boolean;
    clickmap?: boolean;
    trackLinks?: boolean;
    accurateTrackBounce?: boolean;
    webvisor?: boolean;
    trackHash?: boolean;
    params?: YMetrikaVisitParams;
};
