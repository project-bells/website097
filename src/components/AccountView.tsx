import {
  AlertTriangle,
  KeyRound,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Trash2,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { getClassPortrait } from '../data/assets';
import { api } from '../lib/api';
import {
  PLAYABLE_BASE_CLASSES,
  SERVER_CONFIG_SPECS,
  getAccountTierLabel,
  getPkLabel,
  type AccountProfile,
  type CharacterRecord,
} from '../shared/muData';

interface AccountViewProps {
  profile: AccountProfile | null;
  onProfileChange: (profile: AccountProfile | null) => void;
  onRefreshOverview: () => void;
}

type AuthTab = 'login' | 'register';
type ManageTab = 'services' | 'stats' | 'security';

export function AccountView({
  profile,
  onProfileChange,
  onRefreshOverview,
}: AccountViewProps) {
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPwd, setLoginPwd] = useState('');

  // Register form state
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regPwdConfirm, setRegPwdConfirm] = useState('');
  const [regPersonalId, setRegPersonalId] = useState('111111111111111111');

  // Authenticated workspace state
  const [selectedCharName, setSelectedCharName] = useState<string | null>(null);
  const [manageTab, setManageTab] = useState<ManageTab>('services');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [confirmClearInv, setConfirmClearInv] = useState(false);

  // Add stats inputs
  const [addStr, setAddStr] = useState('0');
  const [addAgi, setAddAgi] = useState('0');
  const [addVit, setAddVit] = useState('0');
  const [addEne, setAddEne] = useState('0');

  // Create character form
  const [showCreateChar, setShowCreateChar] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharClass, setNewCharClass] = useState<number>(16);

  // Change password form
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwdConfirm, setNewPwdConfirm] = useState('');

  useEffect(() => {
    if (!profile || profile.Characters.length === 0) {
      setSelectedCharName(null);
      return;
    }
    const stillExists = profile.Characters.some((c) => c.Name === selectedCharName);
    if (!stillExists) {
      setSelectedCharName(profile.Characters[0].Name);
    }
  }, [profile, selectedCharName]);

  const selectedChar: CharacterRecord | null =
    profile?.Characters.find((c) => c.Name === selectedCharName) ?? profile?.Characters[0] ?? null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const res = await api.login(loginId, loginPwd);
      onProfileChange(res.profile);
      setFeedback({ type: 'ok', text: `ยินดีต้อนรับสู่ MuOrigins, ${res.profile.memb___id}` });
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (regPwd !== regPwdConfirm) {
      setAuthError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await api.register({
        accountId: regId,
        password: regPwd,
        name: regName || regId,
        email: regEmail,
        personalId: regPersonalId,
      });
      onProfileChange(res.profile);
      onRefreshOverview();
      setFeedback({
        type: 'ok',
        text: `สมัครบัญชี ${res.profile.memb___id} สำเร็จ (บันทึกในตาราง MEMB_INFO พร้อมเข้ารหัส bcrypt)`,
      });
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    onProfileChange(null);
    setFeedback(null);
  };

  const runCharAction = async (key: string, fn: () => Promise<{ message: string; profile: AccountProfile }>) => {
    setBusyAction(key);
    setFeedback(null);
    try {
      const res = await fn();
      onProfileChange(res.profile);
      onRefreshOverview();
      setFeedback({ type: 'ok', text: res.message });
      setConfirmClearInv(false);
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    } finally {
      setBusyAction(null);
    }
  };

  const handleAddStatsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedChar) return;
    await runCharAction('add-stats', async () => {
      const res = await api.addStats(selectedChar.Name, {
        str: Number(addStr) || 0,
        agi: Number(addAgi) || 0,
        vit: Number(addVit) || 0,
        ene: Number(addEne) || 0,
      });
      setAddStr('0');
      setAddAgi('0');
      setAddVit('0');
      setAddEne('0');
      return res;
    });
  };

  const handleCreateCharacter = async (e: FormEvent) => {
    e.preventDefault();
    await runCharAction('create-char', async () => {
      const res = await api.createCharacter(newCharName, newCharClass);
      setNewCharName('');
      setShowCreateChar(false);
      return res;
    });
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPwd !== newPwdConfirm) {
      setFeedback({ type: 'err', text: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' });
      return;
    }
    setBusyAction('change-pwd');
    setFeedback(null);
    try {
      const res = await api.changePassword(curPwd, newPwd);
      setCurPwd('');
      setNewPwd('');
      setNewPwdConfirm('');
      setFeedback({ type: 'ok', text: res.message });
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    } finally {
      setBusyAction(null);
    }
  };

  // =========================================================================
  // UNAUTHENTICATED VIEW (LOGIN / REGISTER)
  // =========================================================================
  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          {/* Left Explanation */}
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#C89B3C]">
                ระบบบัญชีผู้เล่น MuOrigins · MuOnline97 (MEMB_INFO)
              </p>
              <h1 className="font-display text-3xl font-bold text-[#F7F2E8]">
                เข้าสู่ระบบหรือสร้างบัญชีเกมใหม่
              </h1>
              <p className="text-sm leading-relaxed text-[#A89F91]">
                บัญชีที่สมัครผ่านพอร์ทัลนี้ใช้เข้าเล่น MuOrigins ได้ทันทีทั้งผ่าน PlayOnline และไคลเอนต์ 0.97k
                โดยเข้ารหัสรหัสผ่านด้วย bcrypt ตรงกับ JoinServer (PasswordHash=1)
              </p>
            </div>

            <div className="rounded-lg border border-[#26221D] bg-[#141210] p-5 space-y-3 text-sm">
              <h2 className="font-display text-sm font-semibold text-[#F2ECE2]">
                บริการผู้เล่นหลังเข้าสู่ระบบ
              </h2>
              <ul className="space-y-2 text-xs text-[#B5ADA0]">
                <li>· วาร์ปกลับเมืองปลอดภัย (Lorencia / Noria) เมื่อตัวละครค้างแผนที่</li>
                <li>· อัพแต้มสเตตัส STR / AGI / VIT / ENE ผ่านเว็บสูงสุด 32,767</li>
                <li>· รีเซ็ตตัวละครที่เลเวล 400 พร้อมเก็บค่าพลังเดิมและล้างหัวแดง (PK Clear)</li>
                <li>· ล้างกระเป๋าตัวละคร (760 bytes 0xFF) พร้อมระบบคูลดาวน์ป้องกันกดพลาด</li>
                <li>· ตรวจสอบยอด Rena, Stone และ Lucky Number ของ Golden Archer</li>
              </ul>
            </div>
          </div>

          {/* Right Auth Form Card */}
          <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 sm:p-8 lg:col-span-7">
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-md border border-[#26221D] bg-[#0F0E0C] p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError(null);
                }}
                className={`rounded py-2 text-sm font-medium transition-colors ${
                  authTab === 'login' ? 'bg-[#C89B3C] text-[#120F0A]' : 'text-[#A89F91] hover:text-[#F2ECE2]'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setAuthError(null);
                }}
                className={`rounded py-2 text-sm font-medium transition-colors ${
                  authTab === 'register' ? 'bg-[#C89B3C] text-[#120F0A]' : 'text-[#A89F91] hover:text-[#F2ECE2]'
                }`}
              >
                สมัครสมาชิกใหม่
              </button>
            </div>

            {authError && (
              <div className="mb-5 rounded-md border border-[#7F1D1D] bg-[#2A1212] px-4 py-3 text-sm text-[#FCA5A5]">
                {authError}
              </div>
            )}

            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-id" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                    ชื่อบัญชี (Account ID / memb___id)
                  </label>
                  <input
                    id="login-id"
                    type="text"
                    required
                    maxLength={10}
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="กรอกชื่อบัญชี 4–10 ตัวอักษร"
                    className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="login-pwd" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                    รหัสผ่าน
                  </label>
                  <input
                    id="login-pwd"
                    type="password"
                    required
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                    placeholder="กรอกรหัสผ่านบัญชีเกม"
                    className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full rounded-md bg-[#C89B3C] px-4 py-2.5 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] disabled:opacity-50"
                >
                  {authSubmitting ? 'กำลังตรวจสอบบัญชี...' : 'เข้าสู่ระบบ'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="reg-id" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                      ชื่อบัญชี (4–10 ตัวอักษร a-z, 0-9)
                    </label>
                    <input
                      id="reg-id"
                      type="text"
                      required
                      maxLength={10}
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                      placeholder="เช่น knight97"
                      className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                      ชื่อผู้เล่น (สูงสุด 10 ตัวอักษร)
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      maxLength={10}
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="ชื่อเรียกในระบบ"
                      className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                    อีเมล (mail_addr)
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] placeholder:text-[#6E665C] focus:border-[#C89B3C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="reg-pwd" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                      รหัสผ่าน (6–20 ตัวอักษร)
                    </label>
                    <input
                      id="reg-pwd"
                      type="password"
                      required
                      minLength={6}
                      maxLength={20}
                      value={regPwd}
                      onChange={(e) => setRegPwd(e.target.value)}
                      className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-pwd2" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                      ยืนยันรหัสผ่าน
                    </label>
                    <input
                      id="reg-pwd2"
                      type="password"
                      required
                      minLength={6}
                      maxLength={20}
                      value={regPwdConfirm}
                      onChange={(e) => setRegPwdConfirm(e.target.value)}
                      className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-sno" className="block text-xs font-medium text-[#C4BCB0] mb-1.5">
                    รหัสส่วนบุคคล 18 หลัก (sno__numb สำหรับลบตัวละคร/ออกจากกิลด์ในเกม)
                  </label>
                  <input
                    id="reg-sno"
                    type="text"
                    maxLength={18}
                    value={regPersonalId}
                    onChange={(e) => setRegPersonalId(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 font-mono text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full rounded-md bg-[#C89B3C] px-4 py-2.5 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] disabled:opacity-50"
                >
                  {authSubmitting ? 'กำลังสร้างบัญชีใน MuOnline97...' : 'ยืนยันสมัครสมาชิก'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED ACCOUNT & CHARACTER MANAGEMENT WORKSPACE
  // =========================================================================
  const totalAddPoints =
    (Number(addStr) || 0) + (Number(addAgi) || 0) + (Number(addVit) || 0) + (Number(addEne) || 0);
  const remainingAfterAdd = (selectedChar?.LevelUpPoint ?? 0) - totalAddPoints;
  const isAccountOnline = profile.ConnectStat === 1;

  const isSelectedElf =
    selectedChar && (selectedChar.Class === 32 || selectedChar.Class === 33 || selectedChar.Class === 34);
  const safeZoneTargetLabel = isSelectedElf ? 'Noria (Map 3 · 174, 112)' : 'Lorencia (Map 0 · 137, 124)';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Top Account Summary Strip */}
      <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9C9284]">
              <span className="text-[#C89B3C] font-medium">{getAccountTierLabel(profile.AccountLevel)}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.mail_addr || 'ไม่ระบุอีเมล'}</span>
              <span aria-hidden="true">·</span>
              <span className={isAccountOnline ? 'text-[#4ADE80]' : 'text-[#A89F91]'}>
                {isAccountOnline ? `กำลังออนไลน์ (${profile.ServerName})` : 'ออฟไลน์ — พร้อมจัดการตัวละคร'}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#F7F2E8]">
              บัญชี {profile.memb___id} ({profile.memb_name})
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-6 text-sm border-r border-[#26221D] pr-6">
              <div>
                <div className="text-xs text-[#9C9284]">เวลาออนไลน์</div>
                <div className="font-mono font-semibold tabular-nums text-[#F2ECE2]">
                  {profile.OnlineHours.toLocaleString()} ชม.
                </div>
              </div>
              <div>
                <div className="text-xs text-[#9C9284]">Golden Archer</div>
                <div className="font-mono font-semibold tabular-nums text-[#E0B85A]">
                  {profile.Renas} Rena · {profile.Stones} Stone
                </div>
              </div>
              {profile.LuckyNumber && (
                <div className="hidden sm:block">
                  <div className="text-xs text-[#9C9284]">Lucky Number</div>
                  <div className="font-mono font-semibold text-[#F2ECE2]">{profile.LuckyNumber}</div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#352E25] px-3.5 py-2 text-xs font-medium text-[#C4BCB0] hover:border-[#7F1D1D] hover:text-[#FCA5A5] whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
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

      {/* Offline Guard Notice when Online */}
      {isAccountOnline && (
        <div className="flex items-start gap-3 rounded-md border border-[#854D0E] bg-[#241B0D] px-4 py-3 text-sm text-[#FDE047]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            ระบบตรวจพบว่าบัญชีนี้กำลังออนไลน์อยู่ในเกม (MEMB_STAT.ConnectStat = 1) เพื่อป้องกันข้อมูลทับกันใน GameServer กรุณาออกจากเกมก่อนใช้คำสั่งย้ายเมือง อัพสเตตัส รีเซ็ต หรือล้างกระเป๋า
          </span>
        </div>
      )}

      {/* Main 2-Column Character Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left 4 cols: Character Roster (AccountCharacter 5 slots) */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#F5EFE6]">
              ตัวละครในไอดี ({profile.Characters.length}/5)
            </h2>
            {profile.Characters.length < 5 && (
              <button
                type="button"
                onClick={() => setShowCreateChar((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#C89B3C] hover:text-[#E0B85A]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>สร้างตัวละคร</span>
              </button>
            )}
          </div>

          {showCreateChar && (
            <form
              onSubmit={handleCreateCharacter}
              className="rounded-lg border border-[#3B3122] bg-[#171410] p-4 space-y-3"
            >
              <div className="text-xs font-semibold text-[#E0B85A]">
                สร้างตัวละครใหม่ (อ้างอิง DefaultClassType)
              </div>
              <div>
                <label htmlFor="new-char-name" className="block text-xs text-[#A89F91] mb-1">
                  ชื่อตัวละคร (3–10 ตัวอักษรภาษาอังกฤษ/ตัวเลข)
                </label>
                <input
                  id="new-char-name"
                  type="text"
                  required
                  maxLength={10}
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  placeholder="เช่น SiamKnight"
                  className="w-full rounded border border-[#2E2922] bg-[#0E0D0B] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="new-char-class" className="block text-xs text-[#A89F91] mb-1">
                  เลือกสายอาชีพเริ่มต้น
                </label>
                <select
                  id="new-char-class"
                  value={newCharClass}
                  onChange={(e) => setNewCharClass(Number(e.target.value))}
                  className="w-full rounded border border-[#2E2922] bg-[#0E0D0B] px-3 py-2 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                >
                  {PLAYABLE_BASE_CLASSES.map((cls) => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.name} ({cls.thaiName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={busyAction === 'create-char'}
                  className="flex-1 rounded bg-[#C89B3C] px-3 py-2 text-xs font-semibold text-[#120F0A] hover:bg-[#D9AE50] disabled:opacity-50"
                >
                  {busyAction === 'create-char' ? 'กำลังสร้าง...' : 'ยืนยันสร้างตัวละคร'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateChar(false)}
                  className="rounded border border-[#2E2922] px-3 py-2 text-xs text-[#A89F91] hover:text-[#F2ECE2]"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          )}

          {profile.Characters.length === 0 ? (
            <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 text-center space-y-3">
              <p className="text-sm text-[#A89F91]">
                ยังไม่มีตัวละครในบัญชีนี้ เริ่มสร้างตัวละครแรกของคุณได้เลย
              </p>
              <button
                type="button"
                onClick={() => setShowCreateChar(true)}
                className="rounded-md bg-[#C89B3C] px-4 py-2 text-xs font-semibold text-[#120F0A] hover:bg-[#D9AE50]"
              >
                สร้างตัวละครแรก
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {profile.Characters.map((ch) => {
                const active = selectedChar?.Name === ch.Name;
                return (
                  <button
                    key={ch.Name}
                    type="button"
                    onClick={() => {
                      setSelectedCharName(ch.Name);
                      setConfirmClearInv(false);
                    }}
                    className={`w-full rounded-lg border p-3.5 text-left transition-colors flex items-center gap-3.5 ${
                      active
                        ? 'border-[#C89B3C] bg-[#1A1611]'
                        : 'border-[#26221D] bg-[#141210] hover:border-[#3A332A]'
                    }`}
                  >
                    <img
                      src={getClassPortrait(ch.Class)}
                      alt={ch.ClassName}
                      referrerPolicy="no-referrer"
                      className="h-14 w-12 shrink-0 rounded object-cover object-top border border-[#2C261F]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-semibold text-[#F5EFE6] truncate">
                          {ch.Name}
                        </span>
                        <span className="font-mono text-xs text-[#E0B85A] tabular-nums shrink-0">
                          Lv.{ch.cLevel}
                        </span>
                      </div>
                      <div className="text-xs text-[#A89F91] truncate">
                        {ch.ClassName} · {ch.ResetCount} Reset
                        {ch.GrandResetCount > 0 ? ` (${ch.GrandResetCount} GR)` : ''}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-[#8E8578]">
                        <span className="truncate">{ch.MapName}</span>
                        {ch.LevelUpPoint > 0 && (
                          <span className="font-mono text-[#4ADE80] tabular-nums shrink-0">
                            +{ch.LevelUpPoint} pt
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Right 8 cols: Active Character Detail & Tools */}
        <div className="space-y-6 lg:col-span-8">
          {selectedChar ? (
            <>
              {/* Character Header & Stats Summary */}
              <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#24201B] pb-5">
                  <div>
                    <div className="text-xs text-[#C89B3C]">
                      {selectedChar.ClassName}
                      {selectedChar.GuildName ? ` · กิลด์ ${selectedChar.GuildName}` : ''}
                      {' · '}
                      <span className={selectedChar.PkLevel > 3 ? 'text-[#F87171]' : 'text-[#A89F91]'}>
                        {getPkLabel(selectedChar.PkLevel)}
                      </span>
                    </div>
                    <h2 className="mt-1 font-display text-2xl font-bold text-[#F7F2E8]">
                      {selectedChar.Name}
                    </h2>
                    <div className="mt-1 text-xs text-[#9C9284] font-mono tabular-nums">
                      พิกัด: {selectedChar.MapName} (Map {selectedChar.MapNumber} · X {selectedChar.MapPosX}, Y {selectedChar.MapPosY})
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-5 text-right font-mono tabular-nums">
                    <div>
                      <div className="text-xs font-sans text-[#9C9284]">เลเวล</div>
                      <div className="text-xl font-semibold text-[#F5EFE6]">{selectedChar.cLevel}</div>
                    </div>
                    <div>
                      <div className="text-xs font-sans text-[#9C9284]">Reset / GR</div>
                      <div className="text-xl font-semibold text-[#E0B85A]">
                        {selectedChar.ResetCount} / {selectedChar.GrandResetCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-sans text-[#9C9284]">แต้มคงเหลือ</div>
                      <div className="text-xl font-semibold text-[#4ADE80]">
                        {selectedChar.LevelUpPoint.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Attribute Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-6 text-sm font-mono tabular-nums">
                  <div className="rounded-md border border-[#24201B] bg-[#181512] p-3">
                    <div className="text-xs font-sans text-[#9C9284]">Strength</div>
                    <div className="mt-1 font-semibold text-[#F2ECE2]">
                      {selectedChar.Strength.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-md border border-[#24201B] bg-[#181512] p-3">
                    <div className="text-xs font-sans text-[#9C9284]">Dexterity</div>
                    <div className="mt-1 font-semibold text-[#F2ECE2]">
                      {selectedChar.Dexterity.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-md border border-[#24201B] bg-[#181512] p-3">
                    <div className="text-xs font-sans text-[#9C9284]">Vitality</div>
                    <div className="mt-1 font-semibold text-[#F2ECE2]">
                      {selectedChar.Vitality.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-md border border-[#24201B] bg-[#181512] p-3">
                    <div className="text-xs font-sans text-[#9C9284]">Energy</div>
                    <div className="mt-1 font-semibold text-[#F2ECE2]">
                      {selectedChar.Energy.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-md border border-[#24201B] bg-[#181512] p-3">
                    <div className="text-xs font-sans text-[#9C9284]">เงิน Zen</div>
                    <div className="mt-1 font-semibold text-[#E0B85A] truncate">
                      {selectedChar.Money.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-md border border-[#24201B] bg-[#181512] p-3">
                    <div className="text-xs font-sans text-[#9C9284]">ช่องกระเป๋า</div>
                    <div className="mt-1 font-semibold text-[#F2ECE2]">
                      {selectedChar.InventoryItemCount} / 76
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#26221D] bg-[#141210] p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setManageTab('services')}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    manageTab === 'services' ? 'bg-[#C89B3C] text-[#120F0A]' : 'text-[#B5ADA0] hover:text-[#F2ECE2]'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>บริการตัวละคร</span>
                </button>
                <button
                  type="button"
                  onClick={() => setManageTab('stats')}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    manageTab === 'stats' ? 'bg-[#C89B3C] text-[#120F0A]' : 'text-[#B5ADA0] hover:text-[#F2ECE2]'
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  <span>อัพสเตตัสผ่านเว็บ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setManageTab('security')}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    manageTab === 'security' ? 'bg-[#C89B3C] text-[#120F0A]' : 'text-[#B5ADA0] hover:text-[#F2ECE2]'
                  }`}
                >
                  <KeyRound className="h-4 w-4" />
                  <span>เปลี่ยนรหัสผ่าน</span>
                </button>
              </div>

              {/* TAB 1: CHARACTER SERVICES */}
              {manageTab === 'services' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Move Home */}
                  <div className="flex flex-col justify-between rounded-lg border border-[#26221D] bg-[#141210] p-5 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-display text-base font-semibold text-[#F5EFE6]">
                        วาร์ปกลับเมืองปลอดภัย (Move Home)
                      </h3>
                      <p className="text-xs leading-relaxed text-[#A89F91]">
                        แก้ปัญหาตัวละครค้างแผนที่หรือเข้าเกมไม่ได้ ย้ายไปยัง{' '}
                        <span className="font-mono text-[#E0B85A]">{safeZoneTargetLabel}</span>{' '}
                        ตรงตามกฎของเซิร์ฟเวอร์
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busyAction !== null || isAccountOnline}
                      onClick={() => runCharAction('move-home', () => api.moveHome(selectedChar.Name))}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#C89B3C] px-4 py-2 text-xs font-semibold text-[#120F0A] hover:bg-[#D9AE50] disabled:opacity-45"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {selectedChar.Cooldowns && selectedChar.Cooldowns.moveHomeSeconds > 0
                          ? `รอคูลดาวน์ (${selectedChar.Cooldowns.moveHomeSeconds} วิ)`
                          : 'วาร์ปกลับเขตปลอดภัย'}
                      </span>
                    </button>
                  </div>

                  {/* Web Reset */}
                  <div className="flex flex-col justify-between rounded-lg border border-[#26221D] bg-[#141210] p-5 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-display text-base font-semibold text-[#F5EFE6]">
                        รีเซ็ตตัวละคร (Web Reset)
                      </h3>
                      <p className="text-xs leading-relaxed text-[#A89F91]">
                        เงื่อนไข Command.dat: เลเวล {SERVER_CONFIG_SPECS.resetLevel} ขึ้นไป · ฟรี 0 Zen · เก็บสเตตัส สกิล และเควสต์เดิมครบทั้งหมด
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={
                        busyAction !== null ||
                        isAccountOnline ||
                        selectedChar.cLevel < SERVER_CONFIG_SPECS.resetLevel
                      }
                      onClick={() => runCharAction('reset', () => api.resetCharacter(selectedChar.Name))}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-[#C89B3C] bg-[#C89B3C]/15 px-4 py-2 text-xs font-semibold text-[#E0B85A] hover:bg-[#C89B3C]/25 disabled:opacity-40"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>
                        {selectedChar.cLevel >= SERVER_CONFIG_SPECS.resetLevel
                          ? `ทำ Reset #${selectedChar.ResetCount + 1} ทันที`
                          : `ต้องการเลเวล ${SERVER_CONFIG_SPECS.resetLevel} (ปัจจุบัน Lv.${selectedChar.cLevel})`}
                      </span>
                    </button>
                  </div>

                  {/* PK Clear */}
                  <div className="flex flex-col justify-between rounded-lg border border-[#26221D] bg-[#141210] p-5 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-display text-base font-semibold text-[#F5EFE6]">
                        ล้างหัวแดง (PK Clear)
                      </h3>
                      <p className="text-xs leading-relaxed text-[#A89F91]">
                        รีเซ็ตสถานะ PK จาก{' '}
                        <span className="text-[#E3DDD3]">{getPkLabel(selectedChar.PkLevel)}</span>{' '}
                        (สังหาร {selectedChar.PkCount} ครั้ง) กลับเป็นสถานะปกติ
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busyAction !== null || isAccountOnline || selectedChar.PkLevel <= 3}
                      onClick={() => runCharAction('pk-clear', () => api.pkClear(selectedChar.Name))}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-[#352E25] bg-[#1C1814] px-4 py-2 text-xs font-semibold text-[#EDE8E0] hover:border-[#C89B3C] disabled:opacity-40"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>
                        {selectedChar.PkLevel > 3 ? 'ล้างค่าหัวแดงทันที' : 'ตัวละครมีสถานะปกติอยู่แล้ว'}
                      </span>
                    </button>
                  </div>

                  {/* Clear Inventory */}
                  <div className="flex flex-col justify-between rounded-lg border border-[#3A2220] bg-[#161110] p-5 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-display text-base font-semibold text-[#FCA5A5]">
                        ล้างกระเป๋าตัวละคร (Clear Inventory)
                      </h3>
                      <p className="text-xs leading-relaxed text-[#C4A8A4]">
                        เขียนทับข้อมูล Inventory 760 ไบต์เป็น 0xFF ทั้งหมด ใช้เมื่อเกิดบั๊กไอเทมในกระเป๋า (ไม่สามารถกู้คืนได้)
                      </p>
                    </div>
                    {!confirmClearInv ? (
                      <button
                        type="button"
                        disabled={busyAction !== null || isAccountOnline}
                        onClick={() => setConfirmClearInv(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#7F1D1D] bg-[#2A1212] px-4 py-2 text-xs font-semibold text-[#FCA5A5] hover:bg-[#3B1717] disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>ล้างกระเป๋า ({selectedChar.InventoryItemCount} ช่องที่มีไอเทม)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyAction !== null}
                          onClick={() =>
                            runCharAction('clear-inv', () => api.clearInventory(selectedChar.Name))
                          }
                          className="flex-1 rounded-md bg-[#B91C1C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#DC2626]"
                        >
                          ยืนยันลบไอเทมทั้งหมด
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClearInv(false)}
                          className="rounded-md border border-[#3B2E2A] px-3 py-2 text-xs text-[#C4BCB0]"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ADD STAT POINTS */}
              {manageTab === 'stats' && (
                <form
                  onSubmit={handleAddStatsSubmit}
                  className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#24201B] pb-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#F5EFE6]">
                        กระจายแต้มสเตตัสให้ {selectedChar.Name}
                      </h3>
                      <p className="text-xs text-[#9C9284]">
                        จำกัดสูงสุด {SERVER_CONFIG_SPECS.maxStatPoint.toLocaleString()} แต้มต่อช่อง (MaxStatPoint_AL0)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#9C9284]">แต้มคงเหลือหลังเพิ่ม</div>
                      <div
                        className={`font-mono text-xl font-semibold tabular-nums ${
                          remainingAfterAdd < 0 ? 'text-[#F87171]' : 'text-[#4ADE80]'
                        }`}
                      >
                        {remainingAfterAdd.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Strength (STR)', current: selectedChar.Strength, value: addStr, setter: setAddStr },
                      { label: 'Dexterity (AGI)', current: selectedChar.Dexterity, value: addAgi, setter: setAddAgi },
                      { label: 'Vitality (VIT)', current: selectedChar.Vitality, value: addVit, setter: setAddVit },
                      { label: 'Energy (ENE)', current: selectedChar.Energy, value: addEne, setter: setAddEne },
                    ].map((stat) => {
                      const addVal = Math.max(0, Number(stat.value) || 0);
                      return (
                        <div
                          key={stat.label}
                          className="rounded-md border border-[#24201B] bg-[#181512] p-4 space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#E3DDD3]">{stat.label}</span>
                            <span className="font-mono tabular-nums text-[#9C9284]">
                              {stat.current.toLocaleString()} →{' '}
                              <span className="text-[#E0B85A]">
                                {(stat.current + addVal).toLocaleString()}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={SERVER_CONFIG_SPECS.maxStatPoint - stat.current}
                              value={stat.value}
                              onChange={(e) => stat.setter(e.target.value)}
                              className="w-full rounded border border-[#2E2922] bg-[#0E0D0B] px-3 py-2 font-mono text-sm tabular-nums text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => stat.setter(String(addVal + 100))}
                              className="rounded border border-[#2E2922] px-2.5 py-2 font-mono text-xs text-[#C9C1B5] hover:border-[#C89B3C] whitespace-nowrap"
                            >
                              +100
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAddStr('0');
                        setAddAgi('0');
                        setAddVit('0');
                        setAddEne('0');
                      }}
                      className="text-xs text-[#9C9284] hover:text-[#F2ECE2]"
                    >
                      ล้างตัวเลขที่กรอก
                    </button>
                    <button
                      type="submit"
                      disabled={
                        busyAction !== null ||
                        isAccountOnline ||
                        totalAddPoints <= 0 ||
                        remainingAfterAdd < 0
                      }
                      className="rounded-md bg-[#C89B3C] px-6 py-2.5 text-sm font-semibold text-[#120F0A] hover:bg-[#D9AE50] disabled:opacity-45"
                    >
                      {busyAction === 'add-stats'
                        ? 'กำลังบันทึกสเตตัส...'
                        : `ยืนยันอัพ ${totalAddPoints.toLocaleString()} แต้ม`}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: CHANGE PASSWORD */}
              {manageTab === 'security' && (
                <form
                  onSubmit={handleChangePassword}
                  className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4 max-w-xl"
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#F5EFE6]">
                      เปลี่ยนรหัสผ่านบัญชี (MEMB_INFO.memb__pwd)
                    </h3>
                    <p className="text-xs text-[#9C9284]">
                      รหัสผ่านใหม่จะถูกเข้ารหัสด้วย bcrypt (Cost 10) เพื่อใช้งานกับ JoinServer ทันที
                    </p>
                  </div>

                  <div>
                    <label htmlFor="cur-pwd" className="block text-xs text-[#C4BCB0] mb-1.5">
                      รหัสผ่านปัจจุบัน
                    </label>
                    <input
                      id="cur-pwd"
                      type="password"
                      required
                      value={curPwd}
                      onChange={(e) => setCurPwd(e.target.value)}
                      className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-pwd" className="block text-xs text-[#C4BCB0] mb-1.5">
                      รหัสผ่านใหม่ (6–20 ตัวอักษร)
                    </label>
                    <input
                      id="new-pwd"
                      type="password"
                      required
                      minLength={6}
                      maxLength={20}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-pwd2" className="block text-xs text-[#C4BCB0] mb-1.5">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <input
                      id="new-pwd2"
                      type="password"
                      required
                      minLength={6}
                      maxLength={20}
                      value={newPwdConfirm}
                      onChange={(e) => setNewPwdConfirm(e.target.value)}
                      className="w-full rounded-md border border-[#2E2922] bg-[#0E0D0B] px-3.5 py-2.5 text-sm text-[#F2ECE2] focus:border-[#C89B3C] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busyAction === 'change-pwd'}
                    className="rounded-md bg-[#C89B3C] px-5 py-2.5 text-sm font-semibold text-[#120F0A] hover:bg-[#D9AE50] disabled:opacity-50"
                  >
                    {busyAction === 'change-pwd' ? 'กำลังอัปเดตรหัสผ่าน...' : 'บันทึกรหัสผ่านใหม่'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-[#26221D] bg-[#141210] p-10 text-center space-y-3">
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                เลือกหรือสร้างตัวละครเพื่อเริ่มจัดการ
              </h2>
              <p className="text-sm text-[#A89F91]">
                เมื่อสร้างตัวละครแล้ว คุณสามารถวาร์ปกลับเมือง อัพสเตตัส ทำรีเซ็ต และล้างหัวแดงได้จากหน้านี้ทันที
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
