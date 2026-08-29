import React, { createContext, useContext, useState } from 'react';
import { en } from '../locales/en';
import { mr } from '../locales/mr';
import { hi } from '../locales/hi';

const LanguageContext = createContext();

const translations = { en, mr, hi };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('hotel_lang') || 'en';
  });

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguage(langCode);
      localStorage.setItem('hotel_lang', langCode);
    }
  };

  const t = (key) => {
    const currentDict = translations[language] || translations.en;
    return currentDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
