import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  CLASS_GROUPS,
  getPkLabel,
  type EventRankingRow,
  type RankingCharacterRow,
  type RankingGuildRow,
} from '../shared/muData';

type RankingTab = 'resets' | 'level' | 'gr' | 'guilds' | 'bc' | 'ds';

const RANKING_TABS: Array<{ id: RankingTab; label: string }> = [
  { id: 'resets', label: 'รีเซ็ตสูงสุด' },
  { id: 'level', label: 'เลเวลสูงสุด' },
  { id: 'gr', label: 'แกรนด์รีเซ็ต' },
  { id: 'guilds', label: 'อันดับกิลด์' },
  { id: 'bc', label: 'Blood Castle' },
  { id: 'ds', label: 'Devil Square' },
];

export function RankingsView() {
  const [tab, setTab] = useState<RankingTab>('resets');
  const [classGroup, setClassGroup] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [charRows, setCharRows] = useState<RankingCharacterRow[]>([]);
  const [guildRows, setGuildRows] = useState<RankingGuildRow[]>([]);
  const [eventRows, setEventRows] = useState<EventRankingRow[]>([]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        if (tab === 'guilds') {
          const res = await api.getGuildRankings(search);
          if (active) setGuildRows(res.rows);
        } else if (tab === 'bc' || tab === 'ds') {
          const res = await api.getEventRankings(tab, search);
          if (active) setEventRows(res.rows);
        } else {
          const grp = CLASS_GROUPS.find((g) => g.id === classGroup);
          const res = await api.getCharacterRankings(tab, grp?.classIds ?? [], search);
          if (active) setCharRows(res.rows);
        }
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }, 120);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [tab, classGroup, search]);

  const isCharTab = tab === 'resets' || tab === 'level' || tab === 'gr';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-[#F7F2E8]">
          ทำเนียบอันดับผู้เล่นและกิลด์
        </h1>
        <p className="text-sm text-[#A89F91]">
          ดึงข้อมูลตรงจากตาราง Character, Guild, GuildMember, RankingBloodCastle และ RankingDevilSquare ในฐานข้อมูล MuOnline97
        </p>
      </div>

      {/* Controls Bar: Segmented Tabs + Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#26221D] bg-[#141210] p-1">
          {RANKING_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-md px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#C89B3C] text-[#120F0A]'
                    : 'text-[#B5ADA0] hover:bg-[#1E1A16] hover:text-[#F2ECE2]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8578]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'guilds' ? 'ค้นหาชื่อกิลด์หรือหัวหน้ากิลด์...' : 'ค้นหาชื่อตัวละคร...'}
            className="w-full rounded-md border border-[#2C2721] bg-[#141210] py-2 pl-9 pr-3 text-sm text-[#EDE8E0] placeholder:text-[#787065] focus:border-[#C89B3C] focus:outline-none"
          />
        </div>
      </div>

      {/* Class Filter Row (only for character rankings) */}
      {isCharTab && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#9C9284] mr-1">กรองตามสายอาชีพ:</span>
          {CLASS_GROUPS.map((grp) => {
            const active = classGroup === grp.id;
            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => setClassGroup(grp.id)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'border-[#C89B3C] bg-[#C89B3C]/15 text-[#E0B85A]'
                    : 'border-[#26221D] bg-[#141210] text-[#A89F91] hover:border-[#3E372E] hover:text-[#EDE8E0]'
                }`}
              >
                {grp.label}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-[#7F1D1D] bg-[#2A1212] px-4 py-3 text-sm text-[#FCA5A5]">
          {error}
        </div>
      )}

      {/* Table Surface */}
      <div className="overflow-hidden rounded-lg border border-[#26221D] bg-[#141210]">
        <div className="overflow-x-auto">
          {isCharTab && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#24201B] bg-[#181512] text-xs text-[#9C9284]">
                  <th className="px-5 py-3.5 font-medium">อันดับ</th>
                  <th className="px-4 py-3.5 font-medium">ชื่อตัวละคร</th>
                  <th className="px-4 py-3.5 font-medium">อาชีพ</th>
                  <th className="px-4 py-3.5 font-medium text-right">เลเวล</th>
                  <th className="px-4 py-3.5 font-medium text-right">Reset</th>
                  <th className="px-4 py-3.5 font-medium text-right">Grand Reset</th>
                  <th className="px-4 py-3.5 font-medium">แผนที่ปัจจุบัน</th>
                  <th className="px-4 py-3.5 font-medium">กิลด์</th>
                  <th className="px-5 py-3.5 font-medium text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201C18]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={9} className="px-5 py-3.5">
                        <div className="h-4 w-full animate-pulse rounded bg-[#1E1A16]" />
                      </td>
                    </tr>
                  ))
                ) : charRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-10 text-center text-[#9C9284]">
                      ไม่พบตัวละครที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  charRows.map((row, idx) => (
                    <tr key={row.Name} className="transition-colors hover:bg-[#191613]">
                      <td className="px-5 py-3.5 font-mono tabular-nums text-[#C89B3C]">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-[#F5EFE6]">{row.Name}</div>
                        {row.PkLevel !== 3 && (
                          <div className={`text-xs ${row.PkLevel > 3 ? 'text-[#F87171]' : 'text-[#93C5FD]'}`}>
                            {getPkLabel(row.PkLevel)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#C9C1B5]">{row.ClassName}</td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#F2ECE2]">
                        {row.cLevel}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums font-semibold text-[#E0B85A]">
                        {row.ResetCount}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#C9C1B5]">
                        {row.GrandResetCount}
                      </td>
                      <td className="px-4 py-3.5 text-[#B5ADA0]">{row.MapName}</td>
                      <td className="px-4 py-3.5 text-[#B5ADA0]">{row.GuildName ?? '—'}</td>
                      <td className="px-5 py-3.5 text-right text-xs">
                        <span className={row.IsOnline ? 'text-[#4ADE80]' : 'text-[#7F766A]'}>
                          {row.IsOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === 'guilds' && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#24201B] bg-[#181512] text-xs text-[#9C9284]">
                  <th className="px-5 py-3.5 font-medium">อันดับ</th>
                  <th className="px-4 py-3.5 font-medium">ชื่อกิลด์</th>
                  <th className="px-4 py-3.5 font-medium">หัวหน้ากิลด์</th>
                  <th className="px-4 py-3.5 font-medium text-right">สมาชิก</th>
                  <th className="px-4 py-3.5 font-medium text-right">คะแนนกิลด์</th>
                  <th className="px-5 py-3.5 font-medium">ประกาศกิลด์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201C18]">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={6} className="px-5 py-3.5">
                        <div className="h-4 w-full animate-pulse rounded bg-[#1E1A16]" />
                      </td>
                    </tr>
                  ))
                ) : guildRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[#9C9284]">
                      ไม่พบกิลด์ที่ตรงกับการค้นหา
                    </td>
                  </tr>
                ) : (
                  guildRows.map((g, idx) => (
                    <tr key={g.GuildName} className="transition-colors hover:bg-[#191613]">
                      <td className="px-5 py-3.5 font-mono tabular-nums text-[#C89B3C]">#{idx + 1}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#F5EFE6]">{g.GuildName}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-[#DDD6CA]">{g.GuildMaster}</span>
                        <span className="mx-2 text-[#524B42]">·</span>
                        <span className={`text-xs ${g.IsMasterOnline ? 'text-[#4ADE80]' : 'text-[#7F766A]'}`}>
                          {g.IsMasterOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#DDD6CA]">
                        {g.Members}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums font-semibold text-[#E0B85A]">
                        {g.GuildScore.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#A89F91] max-w-md truncate">
                        {g.Notice || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {(tab === 'bc' || tab === 'ds') && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#24201B] bg-[#181512] text-xs text-[#9C9284]">
                  <th className="px-5 py-3.5 font-medium">อันดับ</th>
                  <th className="px-4 py-3.5 font-medium">ชื่อตัวละคร</th>
                  <th className="px-4 py-3.5 font-medium">อาชีพ</th>
                  <th className="px-4 py-3.5 font-medium text-right">เลเวล / Reset</th>
                  <th className="px-4 py-3.5 font-medium text-right">
                    {tab === 'bc' ? 'คะแนน Blood Castle' : 'คะแนน Devil Square'}
                  </th>
                  <th className="px-5 py-3.5 font-medium text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201C18]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={6} className="px-5 py-3.5">
                        <div className="h-4 w-full animate-pulse rounded bg-[#1E1A16]" />
                      </td>
                    </tr>
                  ))
                ) : eventRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[#9C9284]">
                      ยังไม่มีคะแนนบันทึกในกิจกรรมนี้
                    </td>
                  </tr>
                ) : (
                  eventRows.map((row, idx) => (
                    <tr key={row.Name} className="transition-colors hover:bg-[#191613]">
                      <td className="px-5 py-3.5 font-mono tabular-nums text-[#C89B3C]">#{idx + 1}</td>
                      <td className="px-4 py-3.5 font-medium text-[#F5EFE6]">{row.Name}</td>
                      <td className="px-4 py-3.5 text-[#C9C1B5]">{row.ClassName}</td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#DDD6CA]">
                        Lv.{row.cLevel} · {row.ResetCount} RR
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums font-semibold text-[#E0B85A]">
                        {row.Score.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs">
                        <span className={row.IsOnline ? 'text-[#4ADE80]' : 'text-[#7F766A]'}>
                          {row.IsOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
