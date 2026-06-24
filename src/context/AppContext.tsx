import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { I18nManager } from 'react-native';
import { DEFAULT_LANGUAGE, LanguageCode, getLanguage } from '../constants/languages';
import { PlanId, getPlan } from '../constants/pricing';
import * as storage from '../services/storage';
import { ENGLISH, TRANSLATIONS, TranslationKey } from '../i18n/translations';

interface AppContextValue {
  // bootstrap
  ready: boolean;
  onboarded: boolean;
  completeOnboarding: () => Promise<void>;

  // auth
  user: storage.StoredUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<storage.EditableProfile>) => Promise<void>;
  logout: () => Promise<void>;

  // subscription
  planId: PlanId;
  setPlan: (planId: PlanId) => Promise<void>;
  usage: storage.UsageRecord;
  refreshUsage: () => Promise<void>;
  registerDocumentUse: () => Promise<boolean>;
  canProcessDocument: boolean;

  // i18n
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => Promise<void>;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  phone: string;
  address: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState<storage.StoredUser | null>(null);
  const [planId, setPlanId] = useState<PlanId>('free');
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [usage, setUsage] = useState<storage.UsageRecord>({
    month: new Date().toISOString().slice(0, 7),
    documentsProcessed: 0,
  });

  useEffect(() => {
    (async () => {
      const [savedUser, savedSub, savedLang, savedOnboarded, savedUsage] = await Promise.all([
        storage.loadUser(),
        storage.loadSubscription(),
        storage.loadLanguage(),
        storage.loadOnboarded(),
        storage.loadUsage(),
      ]);
      setUser(savedUser);
      setPlanId(savedSub.planId);
      if (savedLang) setLanguageState(savedLang);
      setOnboarded(savedOnboarded);
      setUsage(savedUsage);
      setReady(true);
    })();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await storage.setOnboarded(true);
    setOnboarded(true);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // Demo auth: a real implementation would call your backend and store the token.
    // Preserve an existing saved profile for this email if present.
    const existing = await storage.loadUser();
    const u: storage.StoredUser =
      existing && existing.email === email
        ? existing
        : {
            id: `u_${Date.now()}`,
            email,
            name: email.split('@')[0],
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            nationality: '',
            idNumber: '',
            phone: '',
            address: '',
            createdAt: new Date().toISOString(),
          };
    await storage.setToken(`demo_token_${u.id}`);
    await storage.saveUser(u);
    setUser(u);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const u: storage.StoredUser = {
      id: `u_${Date.now()}`,
      email: data.email,
      name: fullName || data.email.split('@')[0],
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth.trim(),
      nationality: data.nationality.trim(),
      idNumber: data.idNumber.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      createdAt: new Date().toISOString(),
    };
    await storage.setToken(`demo_token_${u.id}`);
    await storage.saveUser(u);
    setUser(u);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<storage.EditableProfile>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const merged: storage.StoredUser = { ...prev, ...data };
        merged.name = `${merged.firstName} ${merged.lastName}`.trim() || merged.name;
        storage.saveUser(merged);
        return merged;
      });
    },
    []
  );

  const logout = useCallback(async () => {
    await storage.clearToken();
    await storage.clearUser();
    setUser(null);
  }, []);

  const setPlan = useCallback(async (id: PlanId) => {
    await storage.saveSubscription(id);
    setPlanId(id);
  }, []);

  const refreshUsage = useCallback(async () => {
    setUsage(await storage.loadUsage());
  }, []);

  const plan = getPlan(planId);
  const canProcessDocument =
    plan.documentLimit === null || usage.documentsProcessed < plan.documentLimit;

  const registerDocumentUse = useCallback(async (): Promise<boolean> => {
    const current = await storage.loadUsage();
    const limit = getPlan(planId).documentLimit;
    if (limit !== null && current.documentsProcessed >= limit) {
      return false;
    }
    const updated = await storage.incrementUsage();
    setUsage(updated);
    return true;
  }, [planId]);

  const setLanguage = useCallback(async (code: LanguageCode) => {
    await storage.saveLanguage(code);
    setLanguageState(code);
    const rtl = getLanguage(code).rtl;
    try {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    } catch {
      // no-op on web
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return TRANSLATIONS[language]?.[key] ?? ENGLISH[key] ?? key;
    },
    [language]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      onboarded,
      completeOnboarding,
      user,
      isAuthenticated: !!user,
      login,
      register,
      updateProfile,
      logout,
      planId,
      setPlan,
      usage,
      refreshUsage,
      registerDocumentUse,
      canProcessDocument,
      language,
      setLanguage,
      t,
      isRTL: getLanguage(language).rtl,
    }),
    [
      ready,
      onboarded,
      completeOnboarding,
      user,
      login,
      register,
      updateProfile,
      logout,
      planId,
      setPlan,
      usage,
      refreshUsage,
      registerDocumentUse,
      canProcessDocument,
      language,
      setLanguage,
      t,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
