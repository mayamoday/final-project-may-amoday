import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Language = 'he' | 'en' | 'ar';

const STORAGE_KEYS = {
  language: 'ui:language',
  compactView: 'ui:compactView',
  showAvatars: 'ui:showAvatars',
} as const;

interface UIPreferencesContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  compactView: boolean;
  setCompactView: (value: boolean) => void;
  showAvatars: boolean;
  setShowAvatars: (value: boolean) => void;
}

const UIPreferencesContext = createContext<UIPreferencesContextType | undefined>(undefined);

function readBoolean(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === 'true';
}

function readLanguage(): Language {
  const raw = localStorage.getItem(STORAGE_KEYS.language);
  return raw === 'en' || raw === 'ar' ? raw : 'he';
}

export function UIPreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage]       = useState<Language>(readLanguage);
  const [compactView, setCompactView] = useState(() => readBoolean(STORAGE_KEYS.compactView, false));
  const [showAvatars, setShowAvatars] = useState(() => readBoolean(STORAGE_KEYS.showAvatars, true));

  // Applies globally regardless of which page is mounted, and on first load.
  useEffect(() => {
    document.documentElement.classList.toggle('compact-mode', compactView);
    localStorage.setItem(STORAGE_KEYS.compactView, String(compactView));
  }, [compactView]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.showAvatars, String(showAvatars));
  }, [showAvatars]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, language);
    if (language !== 'he') {
      console.log(`[UIPreferences] language changed to: ${language}`);
    }
  }, [language]);

  return (
    <UIPreferencesContext.Provider value={{ language, setLanguage, compactView, setCompactView, showAvatars, setShowAvatars }}>
      {children}
    </UIPreferencesContext.Provider>
  );
}

export function useUIPreferences() {
  const ctx = useContext(UIPreferencesContext);
  if (!ctx) throw new Error('useUIPreferences must be used within a UIPreferencesProvider');
  return ctx;
}
