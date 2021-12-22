import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { production } from "./environment/profile";
import translationEN from "./locales/en/translation.json";

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en: {
                translation: translationEN
            }
        },
        lng: "en",
        fallbackLng: "en",
        debug: !production,
        interpolation: {
            escapeValue: false // React already does escaping
        }
    });