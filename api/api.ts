import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Minimal, reliable base URL resolution. Prefer EXPO_PUBLIC_API_URL. Fallbacks are for emulators only.
function resolveBaseURL(): string {
  const envUrl = (process as any)?.env?.EXPO_PUBLIC_API_URL || (process as any)?.env?.API_URL;
  if (envUrl && typeof envUrl === 'string') {
    const raw = String(envUrl);
    const trimmed = raw.trim();
    const noWhitespace = trimmed.replace(/\s/g, '');
    if (noWhitespace !== raw) {
      console.log('[api] note: sanitized EXPO_PUBLIC_API_URL (whitespace removed)');
    }
    const cleaned = noWhitespace.replace(/\/+$/, ''); // drop trailing slashes
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }
  // Emulator/simulator fallbacks
  let PlatformModule: any;
  try { PlatformModule = require('react-native').Platform; } catch { PlatformModule = { OS: 'web' }; }
  if (PlatformModule.OS === 'android') return 'http://10.0.2.2:5000/api';
  if (PlatformModule.OS === 'ios') return 'http://localhost:5000/api';
  return 'http://localhost:5000/api';
}

const api = axios.create({ baseURL: resolveBaseURL() });
console.log('[api] baseURL', api.defaults.baseURL);

// Extra diagnostics: log outgoing requests and network errors with full URL
api.interceptors.request.use((config) => {
  const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
  console.log('[api:req]', config.method?.toUpperCase(), fullUrl);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    try {
      const cfg = (error as any)?.config ?? {};
      const fullUrl = `${cfg.baseURL ?? ''}${cfg.url ?? ''}`;
      console.log('[api:err]', error?.message || error, {
        method: cfg?.method,
        url: fullUrl,
      });
    } catch {}
    return Promise.reject(error);
  }
);

// Proactive health ping to surface connectivity issues early in logs
export const pingHealth = async () => {
  try {
    const r = await api.get('/health');
    console.log('[api] health', r.status, r.data);
  } catch (e: any) {
    console.log('[api] health error', e?.message || e);
  }
};

// Fire and forget on load (non-blocking) — skip during tests to avoid noisy logs
if (!(process as any)?.env?.JEST_WORKER_ID && (process as any)?.env?.NODE_ENV !== 'test') {
  pingHealth().catch(() => {});
}

// --- Token management ---
export const getOrCreateUserToken = async (): Promise<string> => {
  let userToken = await AsyncStorage.getItem('userToken');
  if (!userToken) {
    const res = await api.post('/users/token');
    userToken = res.data?.userToken;
    if (userToken) await AsyncStorage.setItem('userToken', userToken);
  }
  return userToken as string;
};

// --- Expenses ---
export const fetchExpenses = async () => {
  const userToken = await getOrCreateUserToken();
  return api.get('/expenses', { params: { userToken } });
};

export const createExpense = async (expense: any) => {
  const userToken = await getOrCreateUserToken();
  return api.post('/expenses', { ...expense, userToken }, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

export const updateExpense = async (id: string, update: any) => {
  const userToken = await getOrCreateUserToken();
  return api.put(`/expenses/${id}`, { ...update }, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

export const deleteExpense = async (id: string) => {
  const userToken = await getOrCreateUserToken();
  return api.delete(`/expenses/${id}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

// --- Income ---
export const fetchIncome = async () => {
  const userToken = await getOrCreateUserToken();
  return api.get('/income', { params: { userToken } });
};

export const createIncome = async (income: any) => {
  const userToken = await getOrCreateUserToken();
  return api.post('/income', { ...income, userToken }, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

export const updateIncome = async (id: string, update: any) => {
  const userToken = await getOrCreateUserToken();
  return api.put(`/income/${id}`, { ...update }, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

// --- Savings Goals ---
export const fetchSavingsGoals = async () => {
  const userToken = await getOrCreateUserToken();
  return api.get('/savings-goals', { params: { userToken } });
};

export const createSavingsGoal = async (goal: any) => {
  const userToken = await getOrCreateUserToken();
  return api.post('/savings-goals', { ...goal, userToken }, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

export const updateSavingsGoal = async (id: string, update: any) => {
  const userToken = await getOrCreateUserToken();
  return api.put(`/savings-goals/${id}`, { ...update }, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

export const updateSavingsGoalProgress = async (id: string, currentAmount: number) => {
  const userToken = await getOrCreateUserToken();
  return api.patch(`/savings-goals/${id}/progress`, { currentAmount }, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

export const deleteSavingsGoal = async (id: string) => {
  const userToken = await getOrCreateUserToken();
  return api.delete(`/savings-goals/${id}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};
