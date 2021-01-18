import { CLIENT_ID } from './js-api/auth';
import { AppError, AppErrorCode } from './error';

enum OauthErrorCodes {
    AccessDenied = 'access_denied',
    UnauthorizedClient = 'unauthorized_client',
}

const parsedOauthToken = (function() {
    const params = new URLSearchParams(window.location.hash.slice(1));

    const token = params.get('access_token');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    // Нужно очистить hash от данных OAuth, т.к. роутинг страниц завязан на нём
    if (token || error) {
        const url = new URL(window.location.href);

        url.hash = '';

        window.history.replaceState(window.history.state, document.title, url.toString());
    }

    return { token, error, errorDescription };
})();

export function getOauthToken(options: { withError?: boolean } = {}): string | null {
    const { withError } = options;
    const { token, error, errorDescription } = parsedOauthToken;

    if (error && withError) {
        const errorReason = errorDescription ? decodeURIComponent(errorDescription) : 'unknown reason';

        switch (error) {
            case OauthErrorCodes.AccessDenied:
                throw new AppError(AppErrorCode.OauthAccessDenied, `OAuth access denied: ${errorReason}`);
            case OauthErrorCodes.UnauthorizedClient:
                throw new AppError(AppErrorCode.OauthUnauthorizedClient, `OAuth unauthorized client: ${errorReason}`);
        }
    }

    return token;
}

export function redirectToOauthAuthorize(): void {
    const search = new URLSearchParams();

    search.append('client_id', CLIENT_ID);
    search.append('redirect_uri', `${window.location.origin}${window.location.pathname}`);
    search.append('response_type', 'token');

    window.location.href = `https://oauth.yandex.ru/authorize?${search.toString()}`;
}
