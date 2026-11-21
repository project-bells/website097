import type {
  AccountProfile,
  AdminSessionInfo,
  DownloadItem,
  EventRankingRow,
  NewsItem,
  RankingCharacterRow,
  RankingGuildRow,
  ServerOverview,
} from '../shared/muData';

import { getActiveLang } from './i18n';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const lang = getActiveLang();
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-Lang': lang,
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fallback = lang === 'th' ? `คำขอล้มเหลว (HTTP ${res.status})` : `Request failed (HTTP ${res.status})`;
    throw new Error(data.error || fallback);
  }
  return data as T;
}

export const api = {
  getOverview: () => requestJson<ServerOverview>('/api/overview'),

  getNews: () => requestJson<{ news: NewsItem[] }>('/api/news'),

  getDownloads: () => requestJson<{ downloads: DownloadItem[] }>('/api/downloads'),

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

  admin: {
    getMe: () => requestJson<{ authenticated: boolean; admin: AdminSessionInfo | null }>('/api/admin/me'),

    login: (username: string, password: string) =>
      requestJson<{ ok: true; admin: AdminSessionInfo }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    logout: () =>
      requestJson<{ ok: true }>('/api/admin/logout', {
        method: 'POST',
      }),

    changePassword: (currentPassword: string, newPassword: string) =>
      requestJson<{ ok: true; message: string }>('/api/admin/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),

    getNews: () => requestJson<{ news: NewsItem[] }>('/api/admin/news'),

    createNews: (payload: { title: string; category: string; body: string; published: boolean }) =>
      requestJson<{ ok: true; item: NewsItem; news: NewsItem[] }>('/api/admin/news', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    updateNews: (id: number, payload: { title: string; category: string; body: string; published: boolean }) =>
      requestJson<{ ok: true; news: NewsItem[] }>(`/api/admin/news/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    deleteNews: (id: number) =>
      requestJson<{ ok: true; news: NewsItem[] }>(`/api/admin/news/${id}`, {
        method: 'DELETE',
      }),

    getDownloads: () => requestJson<{ downloads: DownloadItem[] }>('/api/admin/downloads'),

    createDownload: (payload: {
      platform: string;
      title: string;
      renderer: string;
      version: string;
      size: string;
      url: string;
      highlights: string[];
      published: boolean;
    }) =>
      requestJson<{ ok: true; item: DownloadItem; downloads: DownloadItem[] }>('/api/admin/downloads', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    updateDownload: (
      id: string,
      payload: {
        platform: string;
        title: string;
        renderer: string;
        version: string;
        size: string;
        url: string;
        highlights: string[];
        published: boolean;
      }
    ) =>
      requestJson<{ ok: true; downloads: DownloadItem[] }>(`/api/admin/downloads/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    deleteDownload: (id: string) =>
      requestJson<{ ok: true; downloads: DownloadItem[] }>(`/api/admin/downloads/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
  },
};
