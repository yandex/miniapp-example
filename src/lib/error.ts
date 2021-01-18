export enum AppErrorCode {
    OauthAccessDenied = 'oauth_access_denied',
    OauthUnauthorizedClient = 'oauth_unauthorized_client',
    JsApiDenied = 'js_api_denied',
    JsApiCancelled = 'js_api_cancelled',
    JsApiAlreadyShown = 'js_api_already_shown',
    JsApiMethodNotAvailable = 'js_api_method_not_available',
}

export class AppError extends Error {
    public code: AppErrorCode;

    constructor(code: AppErrorCode, message: string) {
        super(message);

        this.code = code;
        this.name = 'AppError';
    }
}
