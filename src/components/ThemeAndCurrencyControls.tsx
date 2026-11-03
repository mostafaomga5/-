import React, { useState, useEffect } from 'react';
import { Moon, Sun, Coins } from 'lucide-react';
import {
  SUPPORTED_CURRENCIES,
  SupportedCurrencyCode,
  getDefaultCurrencyForCountry,
  convertPriceCurrency,
  CURRENCY_RATE_REFERENCE_DATE,
} from '../lib/domainRules';
import { usePlastico } from '../context/PlasticoContext';

const THEME_STORAGE_KEY = 'plastico_theme_mode_v1';
const CURRENCY_STORAGE_KEY = 'plastico_selected_currency_v1';

export function useThemeAndCurrency() {
  const { realUser } = usePlastico();

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [currency, setCurrency] = useState<SupportedCurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as SupportedCurrencyCode | null;
      if (saved && SUPPORTED_CURRENCIES.some((c) => c.code === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'EGP';
  });

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', themeMode === 'dark');
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // ignore
    }
  }, [themeMode]);

  useEffect(() => {
    const userCountry = realUser?.country || 'مصر';
    const countryDefault = getDefaultCurrencyForCountry(userCountry);
    const explicitKey = realUser?.id
      ? `${CURRENCY_STORAGE_KEY}_explicit_usr_${realUser.id}`
      : `${CURRENCY_STORAGE_KEY}_explicit_guest`;
    try {
      const userExplicit = localStorage.getItem(explicitKey) as SupportedCurrencyCode | null;
      if (userExplicit && SUPPORTED_CURRENCIES.some((c) => c.code === userExplicit)) {
        setCurrency(userExplicit);
        localStorage.setItem(CURRENCY_STORAGE_KEY, userExplicit);
        window.dispatchEvent(new CustomEvent('plastico:currency-change', { detail: userExplicit }));
      } else {
        setCurrency(countryDefault);
        localStorage.setItem(CURRENCY_STORAGE_KEY, countryDefault);
        window.dispatchEvent(new CustomEvent('plastico:currency-change', { detail: countryDefault }));
      }
    } catch {
      setCurrency(countryDefault);
    }
  }, [realUser?.country, realUser?.id]);

  const handleSelectCurrency = (code: SupportedCurrencyCode) => {
    setCurrency(code);
    const explicitKey = realUser?.id
      ? `${CURRENCY_STORAGE_KEY}_explicit_usr_${realUser.id}`
      : `${CURRENCY_STORAGE_KEY}_explicit_guest`;
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
      localStorage.setItem(explicitKey, code);
      window.dispatchEvent(new CustomEvent('plastico:currency-change', { detail: code }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onCurrencyChange = (e: Event) => {
      const detail = (e as CustomEvent<SupportedCurrencyCode>).detail;
      if (detail) setCurrency(detail);
    };
    window.addEventListener('plastico:currency-change', onCurrencyChange);
    return () => window.removeEventListener('plastico:currency-change', onCurrencyChange);
  }, []);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const formatPrice = (amount: number, sourceCurrency = 'EGP') => {
    return convertPriceCurrency(amount, sourceCurrency, currency);
  };

  return {
    themeMode,
    toggleTheme,
    currency,
    setCurrency: handleSelectCurrency,
    formatPrice,
    rateReferenceDate: CURRENCY_RATE_REFERENCE_DATE,
  };
}

export const ThemeAndCurrencyControls: React.FC<{
  compact?: boolean;
}> = ({ compact = false }) => {
  const { lang, t } = usePlastico();
  const { themeMode, toggleTheme, currency, setCurrency } = useThemeAndCurrency();

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0">
      {/* 10-Currency Selector */}
      <div className="relative inline-flex items-center">
        <Coins className="w-3.5 h-3.5 text-[#FF8A2A] absolute start-2 pointer-events-none" />
        <select
          aria-label={t('اختيار العملة', 'Select Currency')}
          data-testid="header-currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as SupportedCurrencyCode)}
          title={t(
            `العملة الحالية (${currency}) — أسعار الصرف استرشادية بتاريخ ${CURRENCY_RATE_REFERENCE_DATE}`,
            `Active Currency (${currency}) — Reference rates as of ${CURRENCY_RATE_REFERENCE_DATE}`
          )}
          className={`ps-7 pe-2 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-white text-[11px] font-extrabold focus:outline-none cursor-pointer ${
            compact ? 'max-w-[78px]' : 'max-w-[92px]'
          }`}
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-[#071A33] text-white">
              {c.code} ({lang === 'ar' ? c.symbolAr : c.symbolEn})
            </option>
          ))}
        </select>
      </div>

      {/* Dark Mode / Light Mode Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        data-testid="theme-mode-toggle-btn"
        aria-label={
          themeMode === 'dark'
            ? t('تفعيل الوضع الفاتح', 'Switch to Light Mode')
            : t('تفعيل الوضع الليلي', 'Switch to Dark Mode')
        }
        title={
          themeMode === 'dark'
            ? t('الوضع الفاتح', 'Light Mode')
            : t('الوضع الليلي', 'Dark Mode')
        }
        className="p-2 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-white transition-colors cursor-pointer shrink-0"
      >
        {themeMode === 'dark' ? (
          <Sun className="w-4 h-4 text-[#FF8A2A]" />
        ) : (
          <Moon className="w-4 h-4 text-[#27BED6]" />
        )}
      </button>
    </div>
  );
};
