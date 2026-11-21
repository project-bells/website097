import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Lang = 'en' | 'th';

const STORAGE_KEY = 'muorigins_lang';

let activeLangStore: Lang = 'en';

export function getActiveLang(): Lang {
  return activeLangStore;
}

function detectClientRegionFallback(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Bangkok') {
      return 'th';
    }
  } catch {
    // Ignore Intl errors
  }

  const navLang = (navigator.language || '').toLowerCase();
  if (navLang === 'th' || navLang.startsWith('th-')) {
    return 'th';
  }

  return 'en';
}

function readStoredLang(): Lang | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'th') return stored;
  } catch {
    // Ignore storage access errors in restricted iframes
  }
  return null;
}

function resolveInitialLang(): Lang {
  const stored = readStoredLang();
  const resolved = stored ?? detectClientRegionFallback();
  activeLangStore = resolved;
  return resolved;
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  toggleLang: () => void;
  isThai: boolean;
  detectedCountry: string | null;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  isThai: false,
  detectedCountry: null,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(resolveInitialLang);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  const applyLang = useCallback((next: Lang, persist: boolean) => {
    activeLangStore = next;
    setLangState(next);
    if (persist && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  const setLang = useCallback(
    (next: Lang) => {
      applyLang(next, true);
    },
    [applyLang]
  );

  const toggleLang = useCallback(() => {
    applyLang(lang === 'th' ? 'en' : 'th', true);
  }, [applyLang, lang]);

  // Sync <html lang> and <title>
  useEffect(() => {
    activeLangStore = lang;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.title =
        lang === 'th'
          ? 'MuOrigins — พอร์ทัลผู้เล่นและจัดการตัวละคร'
          : 'MuOrigins — Player Portal & Character Manager';
    }
  }, [lang]);

  // Authoritative Geo-IP country lookup from server (/api/locale)
  // If user has NOT manually selected a language:
  //   - Visiting from Thailand (TH) => default Thai ('th')
  //   - Visiting from any other country => default English ('en')
  useEffect(() => {
    let active = true;
    fetch('/api/locale', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { country?: string | null; defaultLang?: Lang | null } | null) => {
        if (!active || !data) return;
        if (data.country) {
          setDetectedCountry(data.country);
        }
        // Only apply geo-default if the user hasn't manually overridden it
        if (!readStoredLang() && (data.defaultLang === 'th' || data.defaultLang === 'en')) {
          applyLang(data.defaultLang, false);
        }
      })
      .catch(() => {
        // Keep client fallback
      });

    return () => {
      active = false;
    };
  }, [applyLang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        isThai: lang === 'th',
        detectedCountry,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function formatPortalDate(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const NEWS_CATEGORY_TO_EN: Record<string, string> = {
  ประกาศเซิร์ฟเวอร์: 'Server Notice',
  กิจกรรม: 'Event',
  อัปเดตแพตช์: 'Patch Update',
  ปิดปรับปรุง: 'Maintenance',
};

const NEWS_CATEGORY_TO_TH: Record<string, string> = {
  'Server Notice': 'ประกาศเซิร์ฟเวอร์',
  Event: 'กิจกรรม',
  'Patch Update': 'อัปเดตแพตช์',
  Maintenance: 'ปิดปรับปรุง',
};

export function translateNewsCategory(category: string, lang: Lang): string {
  if (lang === 'en') {
    return NEWS_CATEGORY_TO_EN[category] ?? category;
  }
  return NEWS_CATEGORY_TO_TH[category] ?? category;
}
