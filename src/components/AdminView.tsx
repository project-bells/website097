import {
  Download,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Newspaper,
  Plus,
  Shield,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { formatPortalDate, translateNewsCategory, useLanguage } from '../lib/i18n';
import type { AdminSessionInfo, DownloadItem, NewsItem } from '../shared/muData';

interface AdminViewProps {
  onContentChanged: () => void;
}

type AdminTab = 'news' | 'downloads' | 'security';

const NEWS_CATEGORIES = [
  { value: 'ประกาศเซิร์ฟเวอร์', labelTh: 'ประกาศเซิร์ฟเวอร์', labelEn: 'Server Notice' },
  { value: 'กิจกรรม', labelTh: 'กิจกรรม', labelEn: 'Event' },
  { value: 'อัปเดตแพตช์', labelTh: 'อัปเดตแพตช์', labelEn: 'Patch Update' },
  { value: 'ปิดปรับปรุง', labelTh: 'ปิดปรับปรุง', labelEn: 'Maintenance' },
];

export function AdminView({ onContentChanged }: AdminViewProps) {
  const { lang, isThai } = useLanguage();
  const [checkingSession, setCheckingSession] = useState(true);
  const [admin, setAdmin] = useState<AdminSessionInfo | null>(null);
  const [tab, setTab] = useState<AdminTab>('news');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Admin Login Form
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // News Management State
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('ประกาศเซิร์ฟเวอร์');
  const [newsBody, setNewsBody] = useState('');
  const [newsPublished, setNewsPublished] = useState(true);
  const [savingNews, setSavingNews] = useState(false);
  const [confirmDeleteNewsId, setConfirmDeleteNewsId] = useState<number | null>(null);

  // Downloads Management State
  const [downloadsList, setDownloadsList] = useState<DownloadItem[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [editingDownloadId, setEditingDownloadId] = useState<string | null>(null);
  const [dlPlatform, setDlPlatform] = useState('Windows 10 / 11 (64-bit)');
  const [dlTitle, setDlTitle] = useState('');
  const [dlVersion, setDlVersion] = useState('0.97k');
  const [dlRenderer, setDlRenderer] = useState('OpenGL 3.3 / WebGPU');
  const [dlSize, setDlSize] = useState('');
  const [dlUrl, setDlUrl] = useState('');
  const [dlHighlights, setDlHighlights] = useState('');
  const [dlPublished, setDlPublished] = useState(true);
  const [savingDownload, setSavingDownload] = useState(false);
  const [confirmDeleteDlId, setConfirmDeleteDlId] = useState<string | null>(null);

  // Change Password State
  const [curAdminPwd, setCurAdminPwd] = useState('');
  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [confirmAdminPwd, setConfirmAdminPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoadingNews(true);
    setLoadingDownloads(true);
    try {
      const [newsRes, dlRes] = await Promise.all([api.admin.getNews(), api.admin.getDownloads()]);
      setNewsList(newsRes.news);
      setDownloadsList(dlRes.downloads);
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    } finally {
      setLoadingNews(false);
      setLoadingDownloads(false);
    }
  }, []);

  useEffect(() => {
    api.admin
      .getMe()
      .then((res) => {
        if (res.authenticated && res.admin) {
          setAdmin(res.admin);
          loadAdminData();
        }
      })
      .catch(() => {
        // Not logged in
      })
      .finally(() => setCheckingSession(false));
  }, [loadAdminData]);

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginBusy(true);
    try {
      const res = await api.admin.login(username, password);
      setAdmin(res.admin);
      setPassword('');
      setFeedback({
        type: 'ok',
        text: isThai
          ? `เข้าสู่ระบบผู้ดูแล MuOrigins (${res.admin.username}) เรียบร้อยแล้ว`
          : `Signed in to MuOrigins Backoffice as ${res.admin.username}.`,
      });
      await loadAdminData();
    } catch (err) {
      setLoginError((err as Error).message);
    } finally {
      setLoginBusy(false);
    }
  };

  const handleAdminLogout = async () => {
    await api.admin.logout();
    setAdmin(null);
    setFeedback(null);
  };

  // News handlers
  const resetNewsForm = () => {
    setEditingNewsId(null);
    setNewsTitle('');
    setNewsCategory('ประกาศเซิร์ฟเวอร์');
    setNewsBody('');
    setNewsPublished(true);
  };

  const startEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsTitle(item.title);
    setNewsCategory(item.category || 'ประกาศเซิร์ฟเวอร์');
    setNewsBody(item.body);
    setNewsPublished(item.published !== false);
    setFeedback(null);
  };

  const handleSaveNews = async (e: FormEvent) => {
    e.preventDefault();
    setSavingNews(true);
    setFeedback(null);
    try {
      if (editingNewsId !== null) {
        const res = await api.admin.updateNews(editingNewsId, {
          title: newsTitle,
          category: newsCategory,
          body: newsBody,
          published: newsPublished,
        });
        setNewsList(res.news);
        setFeedback({
          type: 'ok',
          text: isThai ? 'อัปเดตประกาศข่าวสารเรียบร้อยแล้ว' : 'Announcement updated successfully.',
        });
      } else {
        const res = await api.admin.createNews({
          title: newsTitle,
          category: newsCategory,
          body: newsBody,
          published: newsPublished,
        });
        setNewsList(res.news);
        setFeedback({
          type: 'ok',
          text: isThai ? 'เพิ่มประกาศข่าวสารใหม่เรียบร้อยแล้ว' : 'New announcement created successfully.',
        });
      }
      resetNewsForm();
      onContentChanged();
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    } finally {
      setSavingNews(false);
    }
  };

  const handleToggleNewsPublish = async (item: NewsItem) => {
    setFeedback(null);
    try {
      const nextPub = item.published === false;
      const res = await api.admin.updateNews(item.id, {
        title: item.title,
        category: item.category,
        body: item.body,
        published: nextPub,
      });
      setNewsList(res.news);
      onContentChanged();
      setFeedback({
        type: 'ok',
        text: nextPub
          ? isThai
            ? `เผยแพร่ข่าว "${item.title}" แล้ว`
            : `Published "${item.title}".`
          : isThai
            ? `ซ่อนข่าว "${item.title}" เป็นฉบับร่างแล้ว`
            : `Moved "${item.title}" to draft.`,
      });
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    }
  };

  const handleDeleteNews = async (id: number) => {
    setFeedback(null);
    try {
      const res = await api.admin.deleteNews(id);
      setNewsList(res.news);
      if (editingNewsId === id) resetNewsForm();
      setConfirmDeleteNewsId(null);
      onContentChanged();
      setFeedback({
        type: 'ok',
        text: isThai ? 'ลบประกาศข่าวสารเรียบร้อยแล้ว' : 'Announcement deleted.',
      });
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    }
  };

  // Downloads handlers
  const resetDownloadForm = () => {
    setEditingDownloadId(null);
    setDlPlatform('Windows 10 / 11 (64-bit)');
    setDlTitle('');
    setDlVersion('0.97k');
    setDlRenderer('OpenGL 3.3 / WebGPU');
    setDlSize('');
    setDlUrl('');
    setDlHighlights('');
    setDlPublished(true);
  };

  const startEditDownload = (item: DownloadItem) => {
    setEditingDownloadId(item.id);
    setDlPlatform(item.platform);
    setDlTitle(item.title);
    setDlVersion(item.version);
    setDlRenderer(item.renderer);
    setDlSize(item.size);
    setDlUrl(item.url);
    setDlHighlights(item.highlights.join('\n'));
    setDlPublished(item.published);
    setFeedback(null);
  };

  const handleSaveDownload = async (e: FormEvent) => {
    e.preventDefault();
    setSavingDownload(true);
    setFeedback(null);
    const highlights = dlHighlights
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingDownloadId) {
        const res = await api.admin.updateDownload(editingDownloadId, {
          platform: dlPlatform,
          title: dlTitle,
          version: dlVersion,
          renderer: dlRenderer,
          size: dlSize,
          url: dlUrl,
          highlights,
          published: dlPublished,
        });
        setDownloadsList(res.downloads);
        setFeedback({
          type: 'ok',
          text: isThai ? 'อัปเดตรายการดาวน์โหลดเรียบร้อยแล้ว' : 'Download package updated.',
        });
      } else {
        const res = await api.admin.createDownload({
          platform: dlPlatform,
          title: dlTitle,
          version: dlVersion,
          renderer: dlRenderer,
          size: dlSize,
          url: dlUrl,
          highlights,
          published: dlPublished,
        });
        setDownloadsList(res.downloads);
        setFeedback({
          type: 'ok',
          text: isThai ? 'เพิ่มรายการดาวน์โหลดใหม่เรียบร้อยแล้ว' : 'Download package added.',
        });
      }
      resetDownloadForm();
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    } finally {
      setSavingDownload(false);
    }
  };

  const handleToggleDownloadPublish = async (item: DownloadItem) => {
    setFeedback(null);
    try {
      const nextPub = !item.published;
      const res = await api.admin.updateDownload(item.id, {
        platform: item.platform,
        title: item.title,
        version: item.version,
        renderer: item.renderer,
        size: item.size,
        url: item.url,
        highlights: item.highlights,
        published: nextPub,
      });
      setDownloadsList(res.downloads);
      setFeedback({
        type: 'ok',
        text: nextPub
          ? isThai
            ? `เปิดแสดงรายการ "${item.title}" บนหน้าดาวน์โหลดแล้ว`
            : `Published "${item.title}" on the Download page.`
          : isThai
            ? `ซ่อนรายการ "${item.title}" แล้ว`
            : `Hidden "${item.title}" from public downloads.`,
      });
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    }
  };

  const handleDeleteDownload = async (id: string) => {
    setFeedback(null);
    try {
      const res = await api.admin.deleteDownload(id);
      setDownloadsList(res.downloads);
      if (editingDownloadId === id) resetDownloadForm();
      setConfirmDeleteDlId(null);
      setFeedback({
        type: 'ok',
        text: isThai ? 'ลบรายการดาวน์โหลดเรียบร้อยแล้ว' : 'Download package deleted.',
      });
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    }
  };

  const handleChangeAdminPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newAdminPwd !== confirmAdminPwd) {
      setFeedback({
        type: 'err',
        text: isThai ? 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' : 'New password and confirmation do not match.',
      });
      return;
    }
    setSavingPwd(true);
    setFeedback(null);
    try {
      const res = await api.admin.changePassword(curAdminPwd, newAdminPwd);
      setCurAdminPwd('');
      setNewAdminPwd('');
      setConfirmAdminPwd('');
      setFeedback({ type: 'ok', text: res.message });
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    } finally {
      setSavingPwd(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-[#9C9284]">
        {isThai ? 'กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...' : 'Verifying administrator session...'}
      </div>
    );
  }

  // =========================================================================
  // ADMIN LOGIN SCREEN
  // =========================================================================
  if (!admin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#C89B3C]">
              <Shield className="h-4 w-4" />
              <span>MuOrigins Backoffice</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#F7F2E8]">
              {isThai ? 'เข้าสู่ระบบผู้ดูแล (Admin)' : 'Administrator Sign In'}
            </h1>
            <p className="text-xs leading-relaxed text-[#A89F91]">
              {isThai
                ? 'ใช้บัญชีผู้ดูแลชุดเดียวกับเซิร์ฟเวอร์ Mu-Linux (ตาราง web_admins, ค่า ADMIN_USER / ADMIN_PASS หรือบัญชี GM ในเกม) เพื่อจัดการข่าวสารและไฟล์ดาวน์โหลด'
                : 'Sign in with your Mu-Linux server admin credentials (web_admins, ADMIN_USER / ADMIN_PASS, or an in-game GM account) to manage news and client downloads.'}
            </p>
          </div>

          {loginError && (
            <div className="rounded-md border border-[#7F1D1D] bg-[#2A1212] px-4 py-3 text-sm text-[#FCA5A5]">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-user" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                {isThai ? 'ชื่อผู้ใช้ผู้ดูแล (Admin Username)' : 'Admin Username'}
              </label>
              <input
                id="admin-user"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                {isThai ? 'รหัสผ่านผู้ดูแล' : 'Admin Password'}
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isThai ? 'กรอกรหัสผ่าน Admin ของเซิร์ฟเวอร์' : 'Enter server admin password'}
                className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loginBusy}
              className="w-full rounded-md bg-[#C89B3C] px-4 py-2.5 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] disabled:opacity-50"
            >
              {loginBusy
                ? isThai
                  ? 'กำลังตรวจสอบสิทธิ์...'
                  : 'Verifying...'
                : isThai
                  ? 'เข้าสู่ระบบหลังบ้าน'
                  : 'Sign In to Backoffice'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  const authSourceLabel =
    admin.authSource === 'web_admins'
      ? isThai
        ? 'ฐานข้อมูล web_admins (MuOnline97)'
        : 'web_admins table (MuOnline97)'
      : admin.authSource === 'gm_account'
        ? isThai
          ? 'บัญชี GameMaster (CtlCode >= 8)'
          : 'GameMaster Account (CtlCode >= 8)'
        : isThai
          ? 'บัญชี Admin เซิร์ฟเวอร์ (ADMIN_USER)'
          : 'Server Admin Account (ADMIN_USER)';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header Strip */}
      <div className="flex flex-col gap-4 rounded-lg border border-[#26221D] bg-[#141210] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-xs text-[#C89B3C]">
            {isThai ? 'ระบบจัดการหลังบ้าน MuOrigins' : 'MuOrigins Admin Backoffice'} · {authSourceLabel}
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F7F2E8]">
            {isThai ? 'ผู้ดูแลระบบ:' : 'Administrator:'} {admin.username}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleAdminLogout}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#352E25] px-4 py-2 text-xs font-medium text-[#C4BCB0] hover:border-[#7F1D1D] hover:text-[#FCA5A5] whitespace-nowrap self-start sm:self-auto"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isThai ? 'ออกจากระบบ Admin' : 'Sign Out Admin'}</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`rounded-md border px-4 py-3 text-sm ${
            feedback.type === 'ok'
              ? 'border-[#166534] bg-[#0F2417] text-[#86EFAC]'
              : 'border-[#7F1D1D] bg-[#2A1212] text-[#FCA5A5]'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#26221D] bg-[#141210] p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('news')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'news' ? 'bg-[#C89B3C] text-[#120F0A]' : 'text-[#B5ADA0] hover:text-[#F2ECE2]'
          }`}
        >
          <Newspaper className="h-4 w-4" />
          <span>
            {isThai ? `จัดการข่าวสาร (${newsList.length})` : `Manage News (${newsList.length})`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab('downloads')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'downloads' ? 'bg-[#C89B3C] text-[#120F0A]' : 'text-[#B5ADA0] hover:text-[#F2ECE2]'
          }`}
        >
          <Download className="h-4 w-4" />
          <span>
            {isThai
              ? `จัดการดาวน์โหลด (${downloadsList.length})`
              : `Manage Downloads (${downloadsList.length})`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab('security')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            tab === 'security' ? 'bg-[#C89B3C] text-[#120F0A]' : 'text-[#B5ADA0] hover:text-[#F2ECE2]'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>{isThai ? 'เปลี่ยนรหัสผ่าน Admin' : 'Admin Password'}</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: NEWS MANAGEMENT (web_news)                                   */}
      {/* =================================================================== */}
      {tab === 'news' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Create / Edit News Form */}
          <form
            onSubmit={handleSaveNews}
            className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4 lg:col-span-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                {editingNewsId !== null
                  ? isThai
                    ? `แก้ไขประกาศ #${editingNewsId}`
                    : `Edit Announcement #${editingNewsId}`
                  : isThai
                    ? 'เพิ่มประกาศข่าวสารใหม่'
                    : 'Create Announcement'}
              </h2>
              {editingNewsId !== null && (
                <button
                  type="button"
                  onClick={resetNewsForm}
                  className="text-xs text-[#9C9284] hover:text-[#F2ECE2]"
                >
                  {isThai ? 'ยกเลิกการแก้ไข' : 'Cancel Edit'}
                </button>
              )}
            </div>

            <div>
              <label htmlFor="news-title" className="block text-xs text-[#C4BCB0] mb-1.5">
                {isThai ? 'หัวข้อประกาศ' : 'Headline'}
              </label>
              <input
                id="news-title"
                type="text"
                required
                maxLength={200}
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder={
                  isThai
                    ? 'เช่น ประกาศปิดปรับปรุงประจำสัปดาห์ หรือ กิจกรรมคูณ EXP'
                    : 'e.g. Weekly Maintenance Notice or Double EXP Event'
                }
                className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="news-cat" className="block text-xs text-[#C4BCB0] mb-1.5">
                {isThai ? 'หมวดหมู่' : 'Category'}
              </label>
              <select
                id="news-cat"
                value={newsCategory}
                onChange={(e) => setNewsCategory(e.target.value)}
                className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
              >
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {isThai ? c.labelTh : c.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="news-body" className="block text-xs text-[#C4BCB0] mb-1.5">
                {isThai ? 'รายละเอียดข่าวสาร' : 'Announcement Body'}
              </label>
              <textarea
                id="news-body"
                required
                rows={6}
                value={newsBody}
                onChange={(e) => setNewsBody(e.target.value)}
                placeholder={
                  isThai
                    ? 'พิมพ์รายละเอียดข่าวสาร ประกาศกิจกรรม หรือรายละเอียดแพตช์...'
                    : 'Write announcement details, event schedules, or patch notes...'
                }
                className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-[#D7CFC2] cursor-pointer">
              <input
                type="checkbox"
                checked={newsPublished}
                onChange={(e) => setNewsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-[#3B342B] bg-[#0E0D0B] accent-[#C89B3C]"
              />
              <span>{isThai ? 'เผยแพร่บนหน้าแรกทันที' : 'Publish on homepage immediately'}</span>
            </label>

            <button
              type="submit"
              disabled={savingNews}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#C89B3C] px-4 py-2.5 text-sm font-semibold text-[#120F0A] hover:bg-[#D9AE50] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>
                {savingNews
                  ? isThai
                    ? 'กำลังบันทึก...'
                    : 'Saving...'
                  : editingNewsId !== null
                    ? isThai
                      ? 'บันทึกการแก้ไขข่าวสาร'
                      : 'Save Changes'
                    : isThai
                      ? 'เผยแพร่ข่าวสาร'
                      : 'Publish Announcement'}
              </span>
            </button>
          </form>

          {/* News List */}
          <div className="rounded-lg border border-[#26221D] bg-[#141210] lg:col-span-7 overflow-hidden">
            <div className="border-b border-[#24201B] px-6 py-4">
              <h2 className="font-display text-base font-semibold text-[#F5EFE6]">
                {isThai ? 'รายการข่าวสารทั้งหมด (ตาราง web_news)' : 'All Announcements (web_news)'}
              </h2>
            </div>

            {loadingNews ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded bg-[#1E1A16]" />
                ))}
              </div>
            ) : newsList.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#9C9284]">
                {isThai
                  ? 'ยังไม่มีประกาศข่าวสารในระบบ เริ่มสร้างประกาศแรกได้จากแบบฟอร์มด้านซ้าย'
                  : 'No announcements yet. Create your first post using the form on the left.'}
              </div>
            ) : (
              <div className="divide-y divide-[#201C18]">
                {newsList.map((item) => {
                  const dateLabel = formatPortalDate(item.createdAt, lang);
                  const isPub = item.published !== false;
                  return (
                    <div key={item.id} className="p-5 space-y-3 hover:bg-[#191613] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9C9284]">
                            <span className="text-[#C89B3C]">
                              {translateNewsCategory(item.category, lang)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{dateLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span className={isPub ? 'text-[#4ADE80]' : 'text-[#FBBF24]'}>
                              {isPub
                                ? isThai
                                  ? 'เผยแพร่อยู่'
                                  : 'Published'
                                : isThai
                                  ? 'ฉบับร่าง (ซ่อน)'
                                  : 'Draft (Hidden)'}
                            </span>
                          </div>
                          <h3 className="font-display text-base font-semibold text-[#F2ECE2]">
                            {item.title}
                          </h3>
                          <p className="text-xs text-[#A89F91] line-clamp-2">{item.excerpt}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            title={
                              isPub
                                ? isThai
                                  ? 'ซ่อนข่าว'
                                  : 'Hide'
                                : isThai
                                  ? 'เผยแพร่ข่าว'
                                  : 'Publish'
                            }
                            onClick={() => handleToggleNewsPublish(item)}
                            className="rounded border border-[#2E2922] p-2 text-[#C4BCB0] hover:border-[#C89B3C] hover:text-[#F5E7C6]"
                          >
                            {isPub ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            title={isThai ? 'แก้ไขข่าว' : 'Edit'}
                            onClick={() => startEditNews(item)}
                            className="rounded border border-[#2E2922] p-2 text-[#C4BCB0] hover:border-[#C89B3C] hover:text-[#F5E7C6]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {confirmDeleteNewsId === item.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteNews(item.id)}
                              className="rounded bg-[#B91C1C] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#DC2626]"
                            >
                              {isThai ? 'ยืนยันลบ' : 'Confirm'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              title={isThai ? 'ลบข่าว' : 'Delete'}
                              onClick={() => setConfirmDeleteNewsId(item.id)}
                              className="rounded border border-[#3B2220] p-2 text-[#FCA5A5] hover:bg-[#2A1212]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: DOWNLOADS MANAGEMENT (downloads.json)                        */}
      {/* =================================================================== */}
      {tab === 'downloads' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Create / Edit Download Form */}
          <form
            onSubmit={handleSaveDownload}
            className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4 lg:col-span-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                {editingDownloadId
                  ? isThai
                    ? 'แก้ไขรายการดาวน์โหลด'
                    : 'Edit Download Package'
                  : isThai
                    ? 'เพิ่มไฟล์ดาวน์โหลดใหม่'
                    : 'Add Download Package'}
              </h2>
              {editingDownloadId && (
                <button
                  type="button"
                  onClick={resetDownloadForm}
                  className="text-xs text-[#9C9284] hover:text-[#F2ECE2]"
                >
                  {isThai ? 'ยกเลิกการแก้ไข' : 'Cancel Edit'}
                </button>
              )}
            </div>

            <div>
              <label htmlFor="dl-title" className="block text-xs text-[#C4BCB0] mb-1.5">
                {isThai ? 'ชื่อไฟล์ / แพ็กเกจดาวน์โหลด' : 'Package Title'}
              </label>
              <input
                id="dl-title"
                type="text"
                required
                value={dlTitle}
                onChange={(e) => setDlTitle(e.target.value)}
                placeholder="MuOrigins Full Client — Windows"
                className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="dl-platform" className="block text-xs text-[#C4BCB0] mb-1.5">
                  {isThai ? 'แพลตฟอร์ม' : 'Platform'}
                </label>
                <input
                  id="dl-platform"
                  type="text"
                  required
                  value={dlPlatform}
                  onChange={(e) => setDlPlatform(e.target.value)}
                  placeholder="Windows 10/11 (64-bit)"
                  className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="dl-size" className="block text-xs text-[#C4BCB0] mb-1.5">
                  {isThai ? 'ขนาดไฟล์' : 'File Size'}
                </label>
                <input
                  id="dl-size"
                  type="text"
                  value={dlSize}
                  onChange={(e) => setDlSize(e.target.value)}
                  placeholder="412 MB"
                  className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="dl-ver" className="block text-xs text-[#C4BCB0] mb-1.5">
                  {isThai ? 'เวอร์ชัน' : 'Version'}
                </label>
                <input
                  id="dl-ver"
                  type="text"
                  value={dlVersion}
                  onChange={(e) => setDlVersion(e.target.value)}
                  placeholder="0.97k"
                  className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="dl-renderer" className="block text-xs text-[#C4BCB0] mb-1.5">
                  {isThai ? 'Renderer / หมายเหตุสั้น' : 'Renderer / Short Note'}
                </label>
                <input
                  id="dl-renderer"
                  type="text"
                  value={dlRenderer}
                  onChange={(e) => setDlRenderer(e.target.value)}
                  placeholder="OpenGL 3.3 / WebGPU"
                  className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dl-url" className="block text-xs text-[#C4BCB0] mb-1.5">
                {isThai ? 'ลิงก์ดาวน์โหลด (URL)' : 'Download URL'}
              </label>
              <input
                id="dl-url"
                type="url"
                required
                value={dlUrl}
                onChange={(e) => setDlUrl(e.target.value)}
                placeholder="https://download.muorigins.online/MuOrigins-Client.zip"
                className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 font-mono text-xs text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="dl-highlights" className="block text-xs text-[#C4BCB0] mb-1.5">
                {isThai
                  ? 'จุดเด่น / คำแนะนำติดตั้ง (1 ข้อต่อ 1 บรรทัด)'
                  : 'Highlights / Install Notes (one per line)'}
              </label>
              <textarea
                id="dl-highlights"
                rows={4}
                value={dlHighlights}
                onChange={(e) => setDlHighlights(e.target.value)}
                placeholder={
                  isThai
                    ? 'แตกไฟล์แล้วเข้าเล่นได้ทันที\nรองรับจอกว้างและเฟรมเรตสูง\nซิงก์ไอเทม Custom จากเซิร์ฟเวอร์อัตโนมัติ'
                    : 'Extract and play immediately\nWidescreen & high-FPS support\nAuto-syncs custom items from server'
                }
                className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-[#D7CFC2] cursor-pointer">
              <input
                type="checkbox"
                checked={dlPublished}
                onChange={(e) => setDlPublished(e.target.checked)}
                className="h-4 w-4 rounded border-[#3B342B] bg-[#0E0D0B] accent-[#C89B3C]"
              />
              <span>{isThai ? 'แสดงบนหน้าดาวน์โหลดทันที' : 'Publish on Download page immediately'}</span>
            </label>

            <button
              type="submit"
              disabled={savingDownload}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#C89B3C] px-4 py-2.5 text-sm font-semibold text-[#120F0A] hover:bg-[#D9AE50] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>
                {savingDownload
                  ? isThai
                    ? 'กำลังบันทึก...'
                    : 'Saving...'
                  : editingDownloadId
                    ? isThai
                      ? 'บันทึกการแก้ไขรายการดาวน์โหลด'
                      : 'Save Changes'
                    : isThai
                      ? 'เพิ่มรายการดาวน์โหลด'
                      : 'Add Download Package'}
              </span>
            </button>
          </form>

          {/* Downloads List */}
          <div className="rounded-lg border border-[#26221D] bg-[#141210] lg:col-span-7 overflow-hidden">
            <div className="border-b border-[#24201B] px-6 py-4">
              <h2 className="font-display text-base font-semibold text-[#F5EFE6]">
                {isThai ? 'รายการดาวน์โหลดทั้งหมด (downloads.json)' : 'All Download Packages (downloads.json)'}
              </h2>
            </div>

            {loadingDownloads ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-[#1E1A16]" />
                ))}
              </div>
            ) : downloadsList.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#9C9284]">
                {isThai
                  ? 'ยังไม่มีรายการดาวน์โหลด เพิ่มลิงก์ไคลเอนต์ Windows หรือ Linux ได้จากแบบฟอร์มด้านซ้าย'
                  : 'No download packages yet. Add a Windows or Linux client link using the form on the left.'}
              </div>
            ) : (
              <div className="divide-y divide-[#201C18]">
                {downloadsList.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-[#191613] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#9C9284]">
                          <span className="text-[#C89B3C]">{item.platform}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {item.version} {item.size ? `· ${item.size}` : ''}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className={item.published ? 'text-[#4ADE80]' : 'text-[#FBBF24]'}>
                            {item.published
                              ? isThai
                                ? 'แสดงอยู่'
                                : 'Published'
                              : isThai
                                ? 'ซ่อนอยู่'
                                : 'Hidden'}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-semibold text-[#F2ECE2]">
                          {item.title}
                        </h3>
                        <div className="font-mono text-xs text-[#8E8578] truncate">{item.url}</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          title={
                            item.published
                              ? isThai
                                ? 'ซ่อนรายการ'
                                : 'Hide'
                              : isThai
                                ? 'เปิดแสดงรายการ'
                                : 'Publish'
                          }
                          onClick={() => handleToggleDownloadPublish(item)}
                          className="rounded border border-[#2E2922] p-2 text-[#C4BCB0] hover:border-[#C89B3C] hover:text-[#F5E7C6]"
                        >
                          {item.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          title={isThai ? 'แก้ไขรายการ' : 'Edit'}
                          onClick={() => startEditDownload(item)}
                          className="rounded border border-[#2E2922] p-2 text-[#C4BCB0] hover:border-[#C89B3C] hover:text-[#F5E7C6]"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        {confirmDeleteDlId === item.id ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteDownload(item.id)}
                            className="rounded bg-[#B91C1C] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#DC2626]"
                          >
                            {isThai ? 'ยืนยันลบ' : 'Confirm'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            title={isThai ? 'ลบรายการ' : 'Delete'}
                            onClick={() => setConfirmDeleteDlId(item.id)}
                            className="rounded border border-[#3B2220] p-2 text-[#FCA5A5] hover:bg-[#2A1212]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: ADMIN PASSWORD                                               */}
      {/* =================================================================== */}
      {tab === 'security' && (
        <form
          onSubmit={handleChangeAdminPassword}
          className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4 max-w-xl"
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
              {isThai
                ? `เปลี่ยนรหัสผ่านผู้ดูแลระบบ (${admin.username})`
                : `Change Admin Password (${admin.username})`}
            </h2>
            <p className="text-xs text-[#9C9284]">
              {isThai
                ? 'บันทึกการเข้ารหัสด้วย bcrypt ลงในตาราง web_admins (เมื่อเชื่อม MySQL) หรือไฟล์ตั้งค่าผู้ดูแล'
                : 'Hashes and stores your new password with bcrypt in web_admins (when MySQL is connected) or the local admin config.'}
            </p>
          </div>

          <div>
            <label htmlFor="admin-cur-pwd" className="block text-xs text-[#C4BCB0] mb-1.5">
              {isThai ? 'รหัสผ่านผู้ดูแลปัจจุบัน' : 'Current Admin Password'}
            </label>
            <input
              id="admin-cur-pwd"
              type="password"
              required
              value={curAdminPwd}
              onChange={(e) => setCurAdminPwd(e.target.value)}
              className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="admin-new-pwd" className="block text-xs text-[#C4BCB0] mb-1.5">
              {isThai ? 'รหัสผ่านใหม่ (6–64 ตัวอักษร)' : 'New Password (6–64 chars)'}
            </label>
            <input
              id="admin-new-pwd"
              type="password"
              required
              minLength={6}
              maxLength={64}
              value={newAdminPwd}
              onChange={(e) => setNewAdminPwd(e.target.value)}
              className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="admin-new-pwd2" className="block text-xs text-[#C4BCB0] mb-1.5">
              {isThai ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}
            </label>
            <input
              id="admin-new-pwd2"
              type="password"
              required
              minLength={6}
              maxLength={64}
              value={confirmAdminPwd}
              onChange={(e) => setConfirmAdminPwd(e.target.value)}
              className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={savingPwd}
            className="rounded-md bg-[#C89B3C] px-5 py-2.5 text-sm font-semibold text-[#120F0A] hover:bg-[#D9AE50] disabled:opacity-50"
          >
            {savingPwd
              ? isThai
                ? 'กำลังบันทึกรหัสผ่าน...'
                : 'Updating Password...'
              : isThai
                ? 'บันทึกรหัสผ่านใหม่'
                : 'Save New Password'}
          </button>
        </form>
      )}
    </div>
  );
}
