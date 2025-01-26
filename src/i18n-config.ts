import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const LANGUAGES = [
    //    { code: 'cs', name: 'Čeština' },
    //    { code: 'de', name: 'Deutsch' },
    //    { code: 'el', name: 'Ελληνικά' },
    { code: 'en', name: 'English' },
    //    { code: 'es', name: 'Español' },
    //    { code: 'fi', name: 'Suomi' },
    //    { code: 'fr', name: 'Français' },
    //    { code: 'hr', name: 'Hrvatski' },
    //    { code: 'hu', name: 'Magyar' },
    //    { code: 'it', name: 'Italiano' },
    //    { code: 'kk', name: 'Қазақ' },
    //    { code: 'pl', name: 'Polski' },
    //    { code: 'pt', name: 'Português' },
    //    { code: 'ro', name: 'Română' },
    { code: 'ru', name: 'Русский' },
    //    { code: 'sr', name: 'Српски' },
    //    { code: 'tr', name: 'Türkçe' },
    //    { code: 'uk', name: 'Українська' },
    //    { code: 'zh', name: '中文 (简体)' },
];

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: LANGUAGES.map((l) => l.code),
        fallbackLng: 'en',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
