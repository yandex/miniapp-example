import { getProfileData as jsApiGetProfileData, YandexProfileData, YandexProfileField } from './js-api/autofill';

const AUTOFILL_SDK = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-latest.js';

const autofillReadyPromise = new Promise<void>((resolve, reject) => {
    if (window.yandex?.autofill?.getProfileData) {
        return resolve();
    }

    // Загружаем скрипт для автоматического заполнения полей
    const script = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];

    script.src = AUTOFILL_SDK;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();

    firstScript.parentNode?.insertBefore(script, firstScript);
});

export async function getProfileData(): Promise<YandexProfileData> {
    await autofillReadyPromise;

    return jsApiGetProfileData([
        YandexProfileField.Name,
        YandexProfileField.Phone,
        YandexProfileField.Email,
        YandexProfileField.Address,
    ]);
}
