// frontend/src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// منابع نمونه؛ جایگزین با منابع واقعی پروژه‌ی خودتان
const resources = {
  fa: { translation: {} },
  en: { translation: {} },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fa",              // زبان پیش‌فرض
    fallbackLng: "fa",
    interpolation: { escapeValue: false },
    // اگر ترجمه‌ها را از فایل JSON لود می‌کنید، این‌جا backend loader را اضافه کنید
  });

export default i18n;
