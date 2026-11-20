import type {
  AccountProfile,
  EventRankingRow,
  NewsItem,
  RankingCharacterRow,
  RankingGuildRow,
  ServerOverview,
} from '../shared/muData';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `คำขอล้มเหลว (HTTP ${res.status})`);
  }
  return data as T;
}

export const api = {
  getOverview: () => requestJson<ServerOverview>('/api/overview'),

  getNews: () => requestJson<{ news: NewsItem[] }>('/api/news'),

  getCharacterRankings: (type: 'level' | 'resets' | 'gr', classIds: number[], q: string) => {
    const params = new URLSearchParams({ type });
    if (classIds.length > 0) params.set('classIds', classIds.join(','));
    if (q.trim()) params.set('q', q.trim());
    return requestJson<{ type: string; rows: RankingCharacterRow[] }>(`/api/rankings?${params.toString()}`);
  },

  getGuildRankings: (q: string) => {
    const params = new URLSearchParams({ type: 'guilds' });
    if (q.trim()) params.set('q', q.trim());
    return requestJson<{ type: 'guilds'; rows: RankingGuildRow[] }>(`/api/rankings?${params.toString()}`);
  },

  getEventRankings: (type: 'bc' | 'ds', q: string) => {
    const params = new URLSearchParams({ type });
    if (q.trim()) params.set('q', q.trim());
    return requestJson<{ type: 'bc' | 'ds'; rows: EventRankingRow[] }>(`/api/rankings?${params.toString()}`);
  },

  getMe: () => requestJson<{ authenticated: boolean; profile: AccountProfile | null }>('/api/account/me'),

  login: (accountId: string, password: string) =>
    requestJson<{ ok: true; profile: AccountProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ accountId, password }),
    }),

  register: (payload: { accountId: string; password: string; name: string; email: string; personalId: string }) =>
    requestJson<{ ok: true; profile: AccountProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    requestJson<{ ok: true }>('/api/auth/logout', {
      method: 'POST',
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    requestJson<{ ok: true; message: string }>('/api/account/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  createCharacter: (name: string, classId: number) =>
    requestJson<{ ok: true; message: string; profile: AccountProfile }>('/api/account/characters', {
      method: 'POST',
      body: JSON.stringify({ name, classId }),
    }),

  moveHome: (charName: string) =>
    requestJson<{ ok: true; message: string; profile: AccountProfile }>(
      `/api/account/characters/${encodeURIComponent(charName)}/move-home`,
      { method: 'POST' }
    ),

  clearInventory: (charName: string) =>
    requestJson<{ ok: true; message: string; profile: AccountProfile }>(
      `/api/account/characters/${encodeURIComponent(charName)}/clear-inventory`,
      { method: 'POST' }
    ),

  addStats: (charName: string, delta: { str: number; agi: number; vit: number; ene: number }) =>
    requestJson<{ ok: true; message: string; profile: AccountProfile }>(
      `/api/account/characters/${encodeURIComponent(charName)}/add-stats`,
      {
        method: 'POST',
        body: JSON.stringify(delta),
      }
    ),

  resetCharacter: (charName: string) =>
    requestJson<{ ok: true; message: string; profile: AccountProfile }>(
      `/api/account/characters/${encodeURIComponent(charName)}/reset`,
      { method: 'POST' }
    ),

  pkClear: (charName: string) =>
    requestJson<{ ok: true; message: string; profile: AccountProfile }>(
      `/api/account/characters/${encodeURIComponent(charName)}/pk-clear`,
      { method: 'POST' }
    ),
};
