import { AppError, AppErrorCode } from '../error';
import { callJsApi } from './utils';

export enum YandexProfileField {
    Name = 'name',
    Email = 'email',
    Phone = 'phone',
    Address = 'address',
}

export type YandexProfileData = {
    firstName: string;
    lastName: string;
    middleName: string;
    phoneNumber: string;
    email: string;
    streetAddress: string;
};

export async function getProfileData(profileFields: Array<YandexProfileField>): Promise<YandexProfileData> {
    try {
        return await callJsApi({
            name: 'window.yandex.autofill.getProfileData',
            args: [profileFields],
            scope: window?.yandex?.autofill,
            method: 'getProfileData',
        });
    } catch (err) {
        const { code } = err;

        if (code === 'denied') {
            throw new AppError(AppErrorCode.JsApiDenied, 'Autofill denied.');
        }

        throw err;
    }
}
