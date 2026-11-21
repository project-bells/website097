import { ArrowRight, ChevronRight, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HERO_LORENCIA_IMAGE, getClassPortrait } from '../data/assets';
import { computeEventCountdowns, type ComputedEventState } from '../lib/eventTimers';
import { formatPortalDate, translateNewsCategory, useLanguage } from '../lib/i18n';
import {
  PLAYABLE_BASE_CLASSES,
  SERVER_CONFIG_SPECS,
  type NewsItem,
  type ServerOverview,
} from '../shared/muData';
import type { PortalPage } from './Navbar';

interface HomeViewProps {
  overview: ServerOverview | null;
  loading: boolean;
  onNavigate: (page: PortalPage) => void;
  accountId: string | null;
}

export function HomeView({ overview, loading, onNavigate, accountId }: HomeViewProps) {
  const { lang, isThai } = useLanguage();
  const [events, setEvents] = useState<ComputedEventState[]>(() => computeEventCountdowns(new Date()));
  const [expandedNewsId, setExpandedNewsId] = useState<number | null>(null);
  const [heroImgError, setHeroImgError] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setEvents(computeEventCountdowns(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const topEvents = events.slice(0, 4);
  const newsList: NewsItem[] = overview?.news ?? [];
  const isLiveDb = overview?.connectionMode === 'mysql-live';

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#24201B]">
        <div className="relative min-h-[480px] lg:min-h-[540px] flex items-end">
          {/* Background Image with resilient fallback */}
          <div className="absolute inset-0 bg-[#12100E]">
            {!heroImgError ? (
              <img
                src={HERO_LORENCIA_IMAGE}
                alt={isThai ? 'ประตูเมือง Lorencia ของเซิร์ฟเวอร์ MuOrigins' : 'Lorencia Citadel of MuOrigins'}
                referrerPolicy="no-referrer"
                onError={() => setHeroImgError(true)}
                className="h-full w-full object-cover object-center opacity-70"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#1C1712] via-[#12100E] to-[#0B0A09]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0A09]/95 via-[#0B0A09]/70 to-[#0B0A09]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-transparent to-[#0B0A09]/40" />
          </div>

          {/* Hero Copy */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl space-y-5">
              <p className="text-sm font-medium text-[#C89B3C]">
                MuOrigins · MU Online 0.97k Native Linux
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[#F7F2E8] sm:text-5xl lg:text-[3.5rem] text-balance">
                {isThai
                  ? 'ตำนานแห่ง Lorencia บนเซิร์ฟเวอร์ MuOrigins ที่เสถียรและโปร่งใส'
                  : 'The Legend of Lorencia on a Fair, High-Stability MuOrigins Realm'}
              </h1>
              <p className="text-base leading-relaxed text-[#C9C1B5] sm:text-lg max-w-xl">
                {isThai
                  ? 'พอร์ทัลผู้เล่นที่เชื่อมต่อโดยตรงกับฐานข้อมูล MuOnline97 ของ Mu-Linux เข้าเล่นออนไลน์ได้ทันที สมัครบัญชี จัดการตัวละคร อัพสเตตัส รีเซ็ต และติดตามรอบกิจกรรมแบบเรียลไทม์'
                  : 'Player portal directly wired to the Mu-Linux MuOnline97 database. Jump into PlayOnline instantly, register accounts, manage characters, allocate stats, reset, and track live event schedules.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={SERVER_CONFIG_SPECS.playOnlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#C89B3C] px-6 py-3 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0B85A]"
                >
                  <span>PlayOnline</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => onNavigate('account')}
                  className="inline-flex items-center gap-2 rounded-md border border-[#3B342B] bg-[#141210]/85 px-5 py-3 text-sm font-medium text-[#EDE8E0] transition-colors hover:border-[#6B5D4A] hover:bg-[#1C1814] whitespace-nowrap"
                >
                  <span>
                    {accountId
                      ? isThai
                        ? 'เปิดแดชบอร์ดตัวละคร'
                        : 'Open Character Panel'
                      : isThai
                        ? 'สมัครสมาชิก / เข้าสู่ระบบ'
                        : 'Register / Sign In'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Server KPI Strip directly below Hero */}
        <div className="border-t border-[#24201B] bg-[#12100E]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-[#24201B] sm:grid-cols-4 sm:divide-x sm:divide-y-0 px-4 sm:px-6 lg:px-8">
            <div className="py-5 sm:pr-6">
              <div className="text-xs text-[#9C9284]">
                {isThai ? 'ผู้เล่นออนไลน์ขณะนี้' : 'Players Online'}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-[#F5E7C6] tabular-nums">
                  {loading ? '—' : (overview?.stats.onlinePlayers ?? 0).toLocaleString()}
                </span>
                <span className={`text-xs ${overview?.gameServer.reachable ? 'text-[#4ADE80]' : 'text-[#9C9284]'}`}>
                  {overview?.gameServer.reachable
                    ? isThai
                      ? 'GameServer พร้อมใช้งาน'
                      : 'GameServer Online'
                    : isLiveDb
                      ? isThai
                        ? 'GameServer ออฟไลน์'
                        : 'GameServer Offline'
                      : isThai
                        ? 'รอเชื่อมต่อเซิร์ฟเวอร์'
                        : 'Awaiting Server Link'}
                </span>
              </div>
            </div>

            <div className="py-5 pl-4 sm:px-6">
              <div className="text-xs text-[#9C9284]">
                {isThai ? 'ตัวละครและกิลด์ในระบบ' : 'Characters & Guilds'}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-[#F5E7C6] tabular-nums">
                  {loading ? '—' : (overview?.stats.totalCharacters ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-[#9C9284] font-mono tabular-nums">
                  / {(overview?.stats.totalGuilds ?? 0).toLocaleString()} {isThai ? 'กิลด์' : 'Guilds'}
                </span>
              </div>
            </div>

            <div className="py-5 sm:px-6">
              <div className="text-xs text-[#9C9284]">
                {isThai ? 'เรตและขีดจำกัด (Common.dat)' : 'Realm Caps (Common.dat)'}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-[#F5E7C6] tabular-nums">
                  Lv.{SERVER_CONFIG_SPECS.maxLevel}
                </span>
                <span className="text-xs text-[#9C9284] font-mono tabular-nums">
                  Max Stat {SERVER_CONFIG_SPECS.maxStatPoint.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="py-5 pl-4 sm:pl-6">
              <div className="text-xs text-[#9C9284]">
                {isThai ? 'พอร์ตเชื่อมต่อเกม' : 'Server Ports'}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-[#E0B85A] tabular-nums">
                  {overview?.connectServer.port ?? 44405}
                </span>
                <span className="text-xs text-[#9C9284] font-mono tabular-nums">
                  GS :{overview?.gameServer.port ?? 55901}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Editorial Grid: Top 5 Champions + News | Live Event Timers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 7 cols: Top 5 Players + Latest Server News */}
          <div className="space-y-10 lg:col-span-7">
            {/* Top 5 Champions */}
            <div className="rounded-lg border border-[#26221D] bg-[#141210]">
              <div className="flex items-center justify-between border-b border-[#24201B] px-6 py-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                    {isThai ? 'ทำเนียบ 5 อันดับผู้เล่นสูงสุด' : 'Top 5 Realm Champions'}
                  </h2>
                  <p className="text-xs text-[#9C9284]">
                    {isThai
                      ? 'จัดอันดับจากตาราง Character · เรียงตามจำนวน Reset และ Grand Reset'
                      : 'Live leaderboard from Character table · Ordered by Resets & Grand Resets'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('rankings')}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#C89B3C] hover:text-[#E0B85A] whitespace-nowrap"
                >
                  <span>{isThai ? 'ดูทั้งหมด' : 'View All'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#24201B] text-xs text-[#9C9284]">
                      <th className="px-6 py-3 font-medium">{isThai ? 'อันดับ' : 'Rank'}</th>
                      <th className="px-4 py-3 font-medium">{isThai ? 'ตัวละคร' : 'Character'}</th>
                      <th className="px-4 py-3 font-medium text-right">{isThai ? 'เลเวล' : 'Level'}</th>
                      <th className="px-4 py-3 font-medium text-right">Reset</th>
                      <th className="px-6 py-3 font-medium text-right">{isThai ? 'สถานะ' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#201C18]">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={5} className="px-6 py-3.5">
                            <div className="h-4 w-full animate-pulse rounded bg-[#1E1A16]" />
                          </td>
                        </tr>
                      ))
                    ) : (overview?.topPlayers ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center space-y-2">
                          <div className="text-sm text-[#B8AFA2]">
                            {isThai
                              ? 'ยังไม่มีข้อมูลตัวละครในฐานข้อมูล MuOnline97'
                              : 'No characters recorded in MuOnline97 yet'}
                          </div>
                          <div className="text-xs text-[#8E8578]">
                            {isThai
                              ? 'สมัครสมาชิกและสร้างตัวละคร หรือเชื่อมต่อฐานข้อมูล MySQL เพื่อแสดงอันดับผู้เล่นจริง'
                              : 'Register an account and create a hero, or connect MySQL to display live rankings.'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      (overview?.topPlayers ?? []).map((p, idx) => (
                        <tr key={p.Name} className="transition-colors hover:bg-[#191613]">
                          <td className="px-6 py-3.5 font-mono text-sm tabular-nums text-[#C89B3C]">
                            #{idx + 1}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-[#F2ECE2]">{p.Name}</div>
                            <div className="text-xs text-[#9C9284]">
                              {p.ClassName}
                              {p.GuildName ? ` · ${isThai ? 'กิลด์' : 'Guild'} ${p.GuildName}` : ''}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#DDD6CA]">
                            {p.cLevel}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#E0B85A]">
                            {p.ResetCount}
                            {p.GrandResetCount > 0 ? ` (${p.GrandResetCount} GR)` : ''}
                          </td>
                          <td className="px-6 py-3.5 text-right text-xs">
                            <span className={p.IsOnline ? 'text-[#4ADE80]' : 'text-[#7F766A]'}>
                              {p.IsOnline ? (isThai ? 'ออนไลน์' : 'Online') : isThai ? 'ออฟไลน์' : 'Offline'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latest News */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl font-semibold text-[#F5EFE6]">
                  {isThai ? 'ประกาศและอัปเดตเซิร์ฟเวอร์' : 'Server News & Announcements'}
                </h2>
                <span className="text-xs text-[#9C9284]">
                  {isThai ? 'ข้อมูลจากตาราง web_news' : 'Synced from web_news'}
                </span>
              </div>

              <div className="divide-y divide-[#24201B] rounded-lg border border-[#26221D] bg-[#141210]">
                {newsList.length === 0 ? (
                  <div className="p-8 text-center space-y-1.5">
                    <p className="text-sm text-[#B8AFA2]">
                      {isThai ? 'ยังไม่มีประกาศข่าวสารในตาราง web_news' : 'No published announcements yet'}
                    </p>
                    <p className="text-xs text-[#8E8578]">
                      {isThai
                        ? 'เมื่อผู้ดูแลระบบเผยแพร่ข่าวสารจากหน้าหลังบ้าน ประกาศจะปรากฏที่นี่อัตโนมัติ'
                        : 'Announcements published from the Admin backoffice will appear here automatically.'}
                    </p>
                  </div>
                ) : (
                  newsList.map((item) => {
                    const isOpen = expandedNewsId === item.id;
                    const dateLabel = formatPortalDate(item.createdAt, lang);
                    return (
                      <article key={item.id} className="p-6">
                        <div className="flex items-center gap-2 text-xs text-[#9C9284]">
                          <span className="text-[#C89B3C]">
                            {translateNewsCategory(item.category, lang)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <time className="font-mono tabular-nums">{dateLabel}</time>
                        </div>
                        <h3 className="mt-2 font-display text-base font-semibold text-[#F2ECE2]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#B8AFA2]">
                          {isOpen ? item.body : item.excerpt}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedNewsId(isOpen ? null : item.id)}
                          className="mt-3 text-xs font-medium text-[#C89B3C] hover:text-[#E0B85A]"
                        >
                          {isOpen
                            ? isThai
                              ? 'ย่อรายละเอียด'
                              : 'Show less'
                            : isThai
                              ? 'อ่านประกาศฉบับเต็ม'
                              : 'Read full announcement'}
                        </button>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right 5 cols: Live Event Timers + Quick Server Rules */}
          <div className="space-y-8 lg:col-span-5">
            <div className="rounded-lg border border-[#26221D] bg-[#141210]">
              <div className="flex items-center justify-between border-b border-[#24201B] px-6 py-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                    {isThai ? 'เวลากิจกรรมรอบถัดไป' : 'Upcoming Event Timers'}
                  </h2>
                  <p className="text-xs text-[#9C9284]">
                    {isThai
                      ? 'ซิงก์ตาม BloodCastle.dat, DevilSquare.dat และ Invasions.toml'
                      : 'Synced with BloodCastle.dat, DevilSquare.dat & Invasions.toml'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('guide')}
                  className="text-sm font-medium text-[#C89B3C] hover:text-[#E0B85A] whitespace-nowrap"
                >
                  {isThai ? 'ตารางทั้งหมด' : 'Full Schedule'}
                </button>
              </div>

              <div className="divide-y divide-[#201C18]">
                {topEvents.map((ev) => (
                  <div key={ev.event.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <div className="font-medium text-[#F2ECE2] truncate">{ev.event.name}</div>
                      <div className="mt-0.5 text-xs text-[#9C9284] truncate">
                        {isThai ? ev.event.maps : ev.event.mapsEn} ·{' '}
                        {isThai ? `รอบ ${ev.nextTimeLabel} น.` : `Next ${ev.nextTimeLabel}`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono text-base font-semibold tabular-nums ${
                          ev.status === 'active'
                            ? 'text-[#4ADE80]'
                            : ev.status === 'warning'
                              ? 'text-[#E0B85A]'
                              : 'text-[#EDE8E0]'
                        }`}
                      >
                        {ev.formattedCountdown}
                      </div>
                      <div className="text-xs text-[#9C9284]">
                        {ev.status === 'active'
                          ? isThai
                            ? 'กำลังเปิดอยู่'
                            : 'Active Now'
                          : ev.status === 'warning'
                            ? isThai
                              ? 'เปิดลงทะเบียนแล้ว'
                              : 'Opening Soon'
                            : isThai
                              ? 'อีกสักครู่'
                              : 'Upcoming'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Server Mechanics Summary */}
            <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                {isThai ? 'โครงสร้างการเล่น MuOrigins 0.97k' : 'MuOrigins 0.97k Realm Overview'}
              </h2>
              <dl className="divide-y divide-[#221E1A] text-sm">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[#A89F91]">
                    {isThai ? 'เงื่อนไขการรีเซ็ต (/reset)' : 'Reset Rule (/reset)'}
                  </dt>
                  <dd className="font-mono text-[#F2ECE2] tabular-nums">
                    {isThai ? 'Lv. 400 · เก็บสเตตัสเดิม' : 'Lv. 400 · Keep Stats'}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[#A89F91]">
                    {isThai ? 'โบนัสปาร์ตี้ 5 คน' : '5-Member Party Bonus'}
                  </dt>
                  <dd className="font-mono text-[#E0B85A] tabular-nums">EXP 200%</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[#A89F91]">
                    {isThai ? 'ออปชันสูงสุด (Jewel of Life)' : 'Max Item Option (JoL)'}
                  </dt>
                  <dd className="font-mono text-[#F2ECE2] tabular-nums">
                    {isThai ? '+16 (4 ขั้น)' : '+16 (4 Tiers)'}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[#A89F91]">Devil Square Ticket Mix</dt>
                  <dd className="font-mono text-[#F2ECE2] tabular-nums">
                    {isThai ? 'สำเร็จ 80%' : '80% Success'}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[#A89F91]">
                    {isThai ? 'การป้องกันโปรฝั่งเซิร์ฟเวอร์' : 'Server-Side Anti-Hack'}
                  </dt>
                  <dd className="text-right text-[#C9C1B5]">MoveCheck · AttackCheck · AutoPotion</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => onNavigate('guide')}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#C89B3C] hover:text-[#E0B85A]"
              >
                <span>
                  {isThai
                    ? 'ดูคำสั่ง /command และตารางวาร์ป Move.txt ทั้งหมด'
                    : 'View all /commands & Move.txt warp gates'}
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Classic 0.97k Playable Classes (DefaultClassType from CreateDatabase.sql) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#F5EFE6]">
              {isThai ? 'อาชีพคลาสสิกทั้ง 4 สายใน MuOrigins' : '4 Classic MuOrigins 0.97k Classes'}
            </h2>
            <p className="mt-1 text-sm text-[#A89F91]">
              {isThai
                ? 'ค่าพลังเริ่มต้นและจุดเกิดอ้างอิงโดยตรงจากตาราง DefaultClassType ในฐานข้อมูล MuOnline97'
                : 'Base attributes and starting maps sourced directly from DefaultClassType in MuOnline97.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('account')}
            className="text-sm font-medium text-[#C89B3C] hover:text-[#E0B85A] whitespace-nowrap"
          >
            {isThai ? 'สร้างตัวละครในบัญชีของคุณ' : 'Create a Character'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAYABLE_BASE_CLASSES.map((cls) => (
            <article
              key={cls.classId}
              className="group overflow-hidden rounded-lg border border-[#26221D] bg-[#141210] flex flex-col"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1B1713]">
                <img
                  src={getClassPortrait(cls.classId)}
                  alt={isThai ? `${cls.name} (${cls.thaiName})` : cls.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/25 to-transparent" />
                <div className="absolute inset-x-4 bottom-3">
                  <div className="text-xs text-[#C89B3C]">{isThai ? cls.role : cls.roleEn}</div>
                  <h3 className="font-display text-xl font-bold text-[#F7F2E8]">{cls.name}</h3>
                  <div className="text-xs text-[#C4BCB0]">
                    {isThai
                      ? `${cls.thaiName} · คลาส 2 ${cls.evolution}`
                      : `2nd Class: ${cls.evolution}`}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <p className="text-sm leading-relaxed text-[#B8AFA2]">
                  {isThai ? cls.description : cls.descriptionEn}
                </p>

                <div className="space-y-2 border-t border-[#24201B] pt-3 text-xs">
                  <div className="grid grid-cols-4 gap-2 font-mono tabular-nums text-center">
                    <div>
                      <div className="text-[#8E8578]">STR</div>
                      <div className="text-[#F2ECE2] font-semibold">{cls.strength}</div>
                    </div>
                    <div>
                      <div className="text-[#8E8578]">AGI</div>
                      <div className="text-[#F2ECE2] font-semibold">{cls.dexterity}</div>
                    </div>
                    <div>
                      <div className="text-[#8E8578]">VIT</div>
                      <div className="text-[#F2ECE2] font-semibold">{cls.vitality}</div>
                    </div>
                    <div>
                      <div className="text-[#8E8578]">ENE</div>
                      <div className="text-[#F2ECE2] font-semibold">{cls.energy}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[#9C9284]">
                    <span>
                      {isThai ? `เมืองเกิด ${cls.startMapName}` : `Starts in ${cls.startMapName}`}
                    </span>
                    <span className="font-mono tabular-nums">
                      HP {cls.life} / MP {cls.mana}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
