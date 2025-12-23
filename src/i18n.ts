import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/common.json';
import zh from './locales/zh/common.json';

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: en },
            zh: { common: zh },
        },
        fallbackLng: 'zh',
        supportedLngs: ['en', 'zh'],
        ns: ['common'],
        defaultNS: 'common',
        detection: {
            order: ['querystring', 'localStorage', 'navigator'],
            caches: ['localStorage'],
        },
        interpolation: { escapeValue: false },
        returnEmptyString: false,
    });

export default i18n;
