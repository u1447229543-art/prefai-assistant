import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { I18nManager } from 'react-native';
import { DEFAULT_LANGUAGE, LanguageCode, getLanguage } from '../constants/languages';
import { PlanId, getPlan } from '../constants/pricing';
import { JourneyId, getJourney } from '../constants/journeys';
import * as storage from '../services/storage';
import * as api from '../services/api';
import { ENGLISH, TRANSLATIONS, TranslationKey } from '../i18n/translations';

const DEFAULT_TASKS: storage.StoredTask[] = [
  { id: 'task-1', title: 'Gather your passport & proof of address', done: false },
  { id: 'task-2', title: 'Validate your visa online (if not done)', done: false },
  { id: 'task-3', title: 'Open or confirm your French bank account', done: false },
];

interface AppContextValue {
  // bootstrap
  ready: boolean;
  syncing: boolean;
  syncError: string | null;
  onboarded: boolean;
  completeOnboarding: () => Promise<void>;

  // auth
  user: storage.StoredUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<storage.EditableProfile>) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  profileSaving: boolean;

  // subscription
  planId: PlanId;
  setPlan: (planId: PlanId) => Promise<void>;
  usage: storage.UsageRecord;
  refreshUsage: () => Promise<void>;
  registerDocumentUse: () => Promise<boolean>;
  canProcessDocument: boolean;

  // journey
  journey: storage.JourneyProgress;
  journeyPercent: number;
  journeySyncing: boolean;
  selectJourney: (id: JourneyId) => Promise<void>;
  toggleJourneyStep: (stepId: string) => Promise<void>;
  resetJourney: () => Promise<void>;
  refreshJourney: () => Promise<void>;

  // documents
  documents: storage.StoredDocument[];
  documentsLoading: boolean;
  refreshDocuments: () => Promise<void>;
  uploadDocument: (
    doc: storage.StoredDocument,
    backendCategory: string
  ) => Promise<storage.StoredDocument>;
  /** Save a document to the local vault (+ React state) without requiring the API. */
  addCachedDocument: (doc: storage.StoredDocument) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;

  // today's tasks (local only)
  tasks: storage.StoredTask[];
  toggleTask: (id: string) => Promise<void>;

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
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState<storage.StoredUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [planId, setPlanId] = useState<PlanId>('free');
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [usage, setUsage] = useState<storage.UsageRecord>({
    month: new Date().toISOString().slice(0, 7),
    documentsProcessed: 0,
  });
  const [journey, setJourney] = useState<storage.JourneyProgress>({
    journeyId: null,
    completedStepIds: [],
  });
  const [journeySyncing, setJourneySyncing] = useState(false);
  const [documents, setDocuments] = useState<storage.StoredDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [tasks, setTasks] = useState<storage.StoredTask[]>(DEFAULT_TASKS);

  const logoutRef = useRef<(() => Promise<void>) | null>(null);

  const applyUser = useCallback(async (apiUser: api.ApiUser) => {
    const u = api.toStoredUser(apiUser);
    await storage.saveUser(u);
    await storage.saveSubscription(apiUser.subscriptionPlan || 'free');
    setUser(u);
    setPlanId(apiUser.subscriptionPlan || 'free');
    setUsage({
      month: new Date().toISOString().slice(0, 7),
      documentsProcessed: apiUser.documentsUsedThisMonth ?? 0,
    });
    return u;
  }, []);

  const applyJourney = useCallback(async (j: api.ApiJourney | null) => {
    if (!j || !j.journeyType) {
      const empty: storage.JourneyProgress = { journeyId: null, completedStepIds: [], progress: 0 };
      setJourney(empty);
      await storage.saveJourney(empty);
      return;
    }
    const next = api.toJourneyProgress(j);
    setJourney(next);
    await storage.saveJourney(next);
  }, []);

  const refreshDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const { documents: list } = await api.getDocuments();
      const mapped = list.map(api.toStoredDocument);
      // Keep local-only vault entries (e.g. migrated from @prefai/documents or
      // offline explain saves) so a server sync never deletes them.
      const cached = await storage.loadVault();
      const remoteIds = new Set(mapped.map((d) => d.remoteId ?? d.id));
      const localOnly = cached.filter((d) => !d.remoteId && !remoteIds.has(d.id));
      const next = [...mapped, ...localOnly];
      setDocuments(next);
      await storage.saveVault(next);
      setSyncError(null);
    } catch (e) {
      if (api.isNetworkError(e)) {
        const cached = await storage.loadVault();
        setDocuments(cached);
        setSyncError(e instanceof Error ? e.message : 'Offline — showing cached documents');
      } else if (!(e instanceof api.ApiError && e.status === 401)) {
        throw e;
      }
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await storage.clearToken();
    await storage.clearUser();
    setUser(null);
    setDocuments([]);
    setJourney({ journeyId: null, completedStepIds: [], progress: 0 });
    setSyncError(null);
  }, []);

  logoutRef.current = logout;

  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      void logoutRef.current?.();
    });
    return () => api.setUnauthorizedHandler(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { user: apiUser } = await api.getProfile();
      await applyUser(apiUser);
      setSyncError(null);
    } catch (e) {
      if (api.isNetworkError(e)) {
        const cached = await storage.loadUser();
        if (cached) setUser(cached);
        setSyncError(e instanceof Error ? e.message : 'Offline — showing cached profile');
      } else if (!(e instanceof api.ApiError && e.status === 401)) {
        throw e;
      }
    }
  }, [applyUser]);

  const refreshJourney = useCallback(async () => {
    setJourneySyncing(true);
    try {
      const { journey: j } = await api.getJourney();
      await applyJourney(j);
      setSyncError(null);
    } catch (e) {
      if (api.isNetworkError(e)) {
        const cached = await storage.loadJourney();
        setJourney(cached);
        setSyncError(e instanceof Error ? e.message : 'Offline — showing cached journey');
      } else if (!(e instanceof api.ApiError && e.status === 401)) {
        throw e;
      }
    } finally {
      setJourneySyncing(false);
    }
  }, [applyJourney]);

  const syncFromBackend = useCallback(async () => {
    const token = await storage.getToken();
    if (!token || token.startsWith('demo_token_')) {
      // Legacy demo token — force re-login.
      if (token?.startsWith('demo_token_')) {
        await storage.clearToken();
        setUser(null);
      }
      return;
    }

    setSyncing(true);
    setSyncError(null);
    try {
      await Promise.all([refreshProfile(), refreshJourney(), refreshDocuments()]);
    } catch (e) {
      if (!api.isNetworkError(e)) {
        setSyncError(e instanceof Error ? e.message : 'Sync failed');
      }
    } finally {
      setSyncing(false);
    }
  }, [refreshProfile, refreshJourney, refreshDocuments]);

  // Bootstrap: load local prefs, then sync from API if authenticated.
  useEffect(() => {
    (async () => {
      const [savedUser, savedSub, savedLang, savedOnboarded, savedUsage, savedJourney, savedTasks, savedVault] =
        await Promise.all([
          storage.loadUser(),
          storage.loadSubscription(),
          storage.loadLanguage(),
          storage.loadOnboarded(),
          storage.loadUsage(),
          storage.loadJourney(),
          storage.loadTasks(),
          storage.loadVault(),
        ]);

      setUser(savedUser);
      setPlanId(savedSub.planId);
      if (savedLang) setLanguageState(savedLang);
      setOnboarded(savedOnboarded);
      setUsage(savedUsage);
      setJourney(savedJourney);
      setDocuments(savedVault);
      setTasks(savedTasks.length ? savedTasks : DEFAULT_TASKS);

      const token = await storage.getToken();
      if (token && !token.startsWith('demo_token_')) {
        await syncFromBackend();
      }
      setReady(true);
    })();
  }, [syncFromBackend]);

  const completeOnboarding = useCallback(async () => {
    await storage.setOnboarded(true);
    setOnboarded(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthLoading(true);
      setSyncError(null);
      try {
        const { token, user: apiUser } = await api.login(email, password);
        await storage.setToken(token);
        await applyUser(apiUser);
        await Promise.all([refreshJourney(), refreshDocuments()]);
      } finally {
        setAuthLoading(false);
      }
    },
    [applyUser, refreshJourney, refreshDocuments]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      setAuthLoading(true);
      setSyncError(null);
      try {
        const { token, user: apiUser } = await api.register({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          password: data.password,
          nationality: data.nationality.trim(),
          idNumber: data.idNumber.trim(),
          phoneNumber: data.phone.trim(),
          dateOfBirth: data.dateOfBirth.trim(),
          address: data.address.trim(),
        });
        await storage.setToken(token);
        await applyUser(apiUser);
        await Promise.all([refreshJourney(), refreshDocuments()]);
      } finally {
        setAuthLoading(false);
      }
    },
    [applyUser, refreshJourney, refreshDocuments]
  );

  const updateProfile = useCallback(
    async (data: Partial<storage.EditableProfile>) => {
      setProfileSaving(true);
      setSyncError(null);
      try {
        const { user: apiUser } = await api.updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          nationality: data.nationality,
          city: data.city,
          phoneNumber: data.phone,
          idNumber: data.idNumber,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
        });
        await applyUser(apiUser);
      } catch (e) {
        if (api.isNetworkError(e)) {
          // Offline: save locally and queue for next sync.
          setUser((prev) => {
            if (!prev) return prev;
            const merged: storage.StoredUser = { ...prev, ...data };
            merged.name = `${merged.firstName} ${merged.lastName}`.trim() || merged.name;
            storage.saveUser(merged);
            return merged;
          });
          setSyncError('Saved locally — will sync when back online.');
        } else {
          throw e;
        }
      } finally {
        setProfileSaving(false);
      }
    },
    [applyUser]
  );

  const setPlan = useCallback(async (id: PlanId) => {
    await storage.saveSubscription(id);
    setPlanId(id);
  }, []);

  const refreshUsage = useCallback(async () => {
    try {
      const sub = await api.getSubscription();
      setPlanId(sub.plan as PlanId);
      setUsage({
        month: new Date().toISOString().slice(0, 7),
        documentsProcessed: sub.documentsUsedThisMonth,
      });
    } catch (e) {
      if (api.isNetworkError(e)) {
        setUsage(await storage.loadUsage());
      }
    }
  }, []);

  const plan = getPlan(planId);
  const canProcessDocument =
    plan.documentLimit === null || usage.documentsProcessed < plan.documentLimit;

  const registerDocumentUse = useCallback(async (): Promise<boolean> => {
    const limit = getPlan(planId).documentLimit;
    if (limit !== null && usage.documentsProcessed >= limit) return false;
    setUsage((prev) => ({
      ...prev,
      documentsProcessed: prev.documentsProcessed + 1,
    }));
    return true;
  }, [planId, usage.documentsProcessed]);

  const selectJourney = useCallback(
    async (id: JourneyId) => {
      setJourneySyncing(true);
      try {
        const { journey: j } = await api.setJourney(id);
        await applyJourney(j);
      } catch (e) {
        if (api.isNetworkError(e)) {
          const next: storage.JourneyProgress = {
            journeyId: id,
            completedStepIds: [],
            startedAt: new Date().toISOString(),
            progress: 0,
          };
          setJourney(next);
          await storage.saveJourney(next);
          setSyncError('Journey saved locally — will sync when back online.');
        } else {
          throw e;
        }
      } finally {
        setJourneySyncing(false);
      }
    },
    [applyJourney]
  );

  const toggleJourneyStep = useCallback(
    async (stepId: string) => {
      const done = journey.completedStepIds.includes(stepId);
      const willComplete = !done;

      // Optimistic update.
      setJourney((prev) => {
        const completedStepIds = willComplete
          ? [...prev.completedStepIds, stepId]
          : prev.completedStepIds.filter((s) => s !== stepId);
        const total = prev.journeyId ? getJourney(prev.journeyId).steps.length : 0;
        const progress = total ? Math.round((completedStepIds.length / total) * 100) : 0;
        const next = { ...prev, completedStepIds, progress };
        storage.saveJourney(next);
        return next;
      });

      try {
        const { journey: j } = await api.completeStep(stepId, willComplete);
        await applyJourney(j);
      } catch (e) {
        if (!api.isNetworkError(e)) throw e;
        setSyncError('Step saved locally — will sync when back online.');
      }
    },
    [journey.completedStepIds, applyJourney]
  );

  const resetJourney = useCallback(async () => {
    const next: storage.JourneyProgress = { journeyId: null, completedStepIds: [], progress: 0 };
    setJourney(next);
    await storage.saveJourney(next);
  }, []);

  const uploadDocument = useCallback(
    async (doc: storage.StoredDocument, backendCategory: string): Promise<storage.StoredDocument> => {
      const { document } = await api.addDocument({
        fileName: doc.name,
        fileSize: doc.size,
        fileType: doc.mimeType,
        category: backendCategory,
        fileUrl: doc.uri,
      });
      const saved: storage.StoredDocument = {
        ...api.toStoredDocument(document),
        summary: doc.summary,
      };
      setDocuments((prev) => {
        const next = [saved, ...prev.filter((d) => d.id !== saved.id && d.id !== doc.id)];
        void storage.saveVault(next);
        return next;
      });
      await refreshUsage();
      return saved;
    },
    [refreshUsage]
  );

  const addCachedDocument = useCallback(async (doc: storage.StoredDocument) => {
    const next = await storage.addToVault(doc);
    setDocuments(next);
  }, []);

  const removeDocument = useCallback(async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    const remoteId = doc?.remoteId ?? id;
    try {
      await api.deleteDocument(remoteId);
    } catch (e) {
      if (!api.isNetworkError(e)) throw e;
    }
    setDocuments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      void storage.saveVault(next);
      return next;
    });
  }, [documents]);

  const toggleTask = useCallback(async (id: string) => {
    setTasks((prev) => {
      const next = prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
      storage.saveTasks(next);
      return next;
    });
  }, []);

  const journeyPercent = useMemo(() => {
    if (journey.progress !== undefined && journey.progress !== null) {
      return journey.progress;
    }
    if (!journey.journeyId) return 0;
    const total = getJourney(journey.journeyId).steps.length;
    if (total === 0) return 0;
    return Math.round((journey.completedStepIds.length / total) * 100);
  }, [journey]);

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
    (key: TranslationKey): string => TRANSLATIONS[language]?.[key] ?? ENGLISH[key] ?? key,
    [language]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      syncing,
      syncError,
      onboarded,
      completeOnboarding,
      user,
      isAuthenticated: !!user,
      authLoading,
      login,
      register,
      updateProfile,
      logout,
      refreshProfile,
      profileSaving,
      planId,
      setPlan,
      usage,
      refreshUsage,
      registerDocumentUse,
      canProcessDocument,
      journey,
      journeyPercent,
      journeySyncing,
      selectJourney,
      toggleJourneyStep,
      resetJourney,
      refreshJourney,
      documents,
      documentsLoading,
      refreshDocuments,
      uploadDocument,
      addCachedDocument,
      removeDocument,
      tasks,
      toggleTask,
      language,
      setLanguage,
      t,
      isRTL: getLanguage(language).rtl,
    }),
    [
      ready,
      syncing,
      syncError,
      onboarded,
      completeOnboarding,
      user,
      authLoading,
      login,
      register,
      updateProfile,
      logout,
      refreshProfile,
      profileSaving,
      planId,
      setPlan,
      usage,
      refreshUsage,
      registerDocumentUse,
      canProcessDocument,
      journey,
      journeyPercent,
      journeySyncing,
      selectJourney,
      toggleJourneyStep,
      resetJourney,
      refreshJourney,
      documents,
      documentsLoading,
      refreshDocuments,
      uploadDocument,
      addCachedDocument,
      removeDocument,
      tasks,
      toggleTask,
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
