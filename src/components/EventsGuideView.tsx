import { Check, Copy, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { computeEventCountdowns, type ComputedEventState } from '../lib/eventTimers';
import { useLanguage } from '../lib/i18n';
import {
  MOVE_GATES,
  PLAYER_COMMANDS,
  SERVER_CONFIG_SPECS,
  type CommandCategoryId,
} from '../shared/muData';

type GuideSection = 'events' | 'commands' | 'maps' | 'rates';

export function EventsGuideView() {
  const { isThai } = useLanguage();
  const [section, setSection] = useState<GuideSection>('events');
  const [events, setEvents] = useState<ComputedEventState[]>(() => computeEventCountdowns(new Date()));
  const [cmdCategory, setCmdCategory] = useState<'all' | CommandCategoryId>('all');
  const [cmdSearch, setCmdSearch] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [mapSearch, setMapSearch] = useState('');

  const sectionTabs: Array<{ id: GuideSection; label: string }> = [
    { id: 'events', label: isThai ? 'ตารางกิจกรรมสด' : 'Live Events' },
    { id: 'commands', label: isThai ? 'คำสั่งผู้เล่น (Command.txt)' : 'Commands (Command.txt)' },
    { id: 'maps', label: isThai ? 'แผนที่และวาร์ป (Move.txt)' : 'Maps & Warps (Move.txt)' },
    { id: 'rates', label: isThai ? 'อัตราและกติกาเซิร์ฟเวอร์' : 'Rates & Server Rules' },
  ];

  const commandCategories: Array<{ id: 'all' | CommandCategoryId; label: string }> = [
    { id: 'all', label: isThai ? 'ทั้งหมด' : 'All' },
    { id: 'movement', label: isThai ? 'การเคลื่อนที่และสื่อสาร' : 'Movement & Chat' },
    { id: 'stats', label: isThai ? 'สเตตัสและรีเซ็ต' : 'Stats & Reset' },
    { id: 'character', label: isThai ? 'ตัวละครและคลัง' : 'Character & Vault' },
    { id: 'guild', label: isThai ? 'กิลด์และระบบ' : 'Guild & System' },
  ];

  useEffect(() => {
    const id = window.setInterval(() => {
      setEvents(computeEventCountdowns(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCmd(text);
      window.setTimeout(() => setCopiedCmd(null), 1500);
    } catch {
      // Fallback ignored in restricted frames
    }
  };

  const filteredCommands = PLAYER_COMMANDS.filter((c) => {
    const matchCat = cmdCategory === 'all' || c.categoryId === cmdCategory;
    const q = cmdSearch.trim().toLowerCase();
    const matchQ =
      !q ||
      c.command.toLowerCase().includes(q) ||
      c.syntax.toLowerCase().includes(q) ||
      c.syntaxEn.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.descriptionEn.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const filteredMaps = MOVE_GATES.filter((m) => {
    const q = mapSearch.trim().toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.zone.toLowerCase().includes(q) ||
      m.zoneEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-[#F7F2E8]">
          {isThai ? 'ตารางกิจกรรมและคู่มือผู้เล่น MuOrigins' : 'MuOrigins Event Schedule & Player Guide'}
        </h1>
        <p className="text-sm text-[#A89F91]">
          {isThai
            ? 'ข้อมูลทั้งหมดอ้างอิงโดยตรงจากไฟล์ตั้งค่าเซิร์ฟเวอร์ใน repository EmanuelCatania/Mu-Linux'
            : 'All schedules, commands, warps, and rates are synchronized directly with the Mu-Linux server configuration.'}
        </p>
      </div>

      {/* Section Switcher */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#26221D] bg-[#141210] p-1 w-fit">
        {sectionTabs.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
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

      {/* 1. LIVE EVENTS SCHEDULE */}
      {section === 'events' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {events.map((ev) => (
            <div
              key={ev.event.id}
              className="flex flex-col justify-between rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-[#C89B3C]">
                    {isThai ? ev.event.category : ev.event.categoryEn} · {ev.event.sourceFile}
                  </div>
                  <h2 className="mt-1 font-display text-xl font-semibold text-[#F5EFE6]">
                    {ev.event.name}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={`font-mono text-2xl font-semibold tabular-nums ${
                      ev.status === 'active'
                        ? 'text-[#4ADE80]'
                        : ev.status === 'warning'
                          ? 'text-[#E0B85A]'
                          : 'text-[#F5EFE6]'
                    }`}
                  >
                    {ev.formattedCountdown}
                  </div>
                  <div className="text-xs text-[#9C9284]">
                    {ev.status === 'active'
                      ? isThai
                        ? 'กำลังดำเนินการ'
                        : 'In Progress'
                      : ev.status === 'warning'
                        ? isThai
                          ? 'แจ้งเตือนก่อนเริ่ม'
                          : 'Opening Soon'
                        : isThai
                          ? `รอบถัดไป ${ev.nextTimeLabel} น.`
                          : `Next round ${ev.nextTimeLabel}`}
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#24201B] pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#9C9284]">{isThai ? 'สถานที่ / แผนที่' : 'Location / Map'}</span>
                  <span className="text-right text-[#E3DDD3]">
                    {isThai ? ev.event.maps : ev.event.mapsEn}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#9C9284]">{isThai ? 'ระยะเวลารอบ' : 'Duration'}</span>
                  <span className="font-mono tabular-nums text-[#E3DDD3]">
                    {isThai ? `${ev.event.durationMinutes} นาที` : `${ev.event.durationMinutes} min`}
                    {ev.event.warningMinutes > 0
                      ? isThai
                        ? ` (เตือนล่วงหน้า ${ev.event.warningMinutes} นาที)`
                        : ` (${ev.event.warningMinutes}m notice)`
                      : ''}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#9C9284]">{isThai ? 'ของรางวัลหลัก' : 'Key Rewards'}</span>
                  <span className="text-right text-[#C9C1B5]">
                    {isThai ? ev.event.rewardSummary : ev.event.rewardSummaryEn}
                  </span>
                </div>
                <div className="pt-2 text-xs text-[#8E8578] font-mono tabular-nums">
                  {isThai ? 'รอบเวลา: ' : 'Schedule: '}
                  {ev.event.scheduleTimes.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. PLAYER COMMANDS */}
      {section === 'commands' && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {commandCategories.map((cat) => {
                const active = cmdCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCmdCategory(cat.id)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'border-[#C89B3C] bg-[#C89B3C]/15 text-[#E0B85A]'
                        : 'border-[#26221D] bg-[#141210] text-[#A89F91] hover:border-[#3E372E]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8578]" />
              <input
                type="search"
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
                placeholder={isThai ? 'ค้นหาคำสั่ง เช่น /reset, /str...' : 'Search e.g. /reset, /str...'}
                className="w-full rounded-md border border-[#2C2721] bg-[#141210] py-2 pl-9 pr-3 text-sm text-[#EDE8E0] placeholder:text-[#787065] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#26221D] bg-[#141210]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#24201B] bg-[#181512] text-xs text-[#9C9284]">
                    <th className="px-5 py-3.5 font-medium">{isThai ? 'รูปแบบคำสั่ง' : 'Command Syntax'}</th>
                    <th className="px-4 py-3.5 font-medium">{isThai ? 'หมวดหมู่' : 'Category'}</th>
                    <th className="px-4 py-3.5 font-medium">{isThai ? 'คำอธิบายการทำงาน' : 'Description'}</th>
                    <th className="px-5 py-3.5 font-medium text-right">{isThai ? 'คัดลอก' : 'Copy'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#201C18]">
                  {filteredCommands.map((cmd) => (
                    <tr key={cmd.command} className="transition-colors hover:bg-[#191613]">
                      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-[#E0B85A] whitespace-nowrap">
                        {isThai ? cmd.syntax : cmd.syntaxEn}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#9C9284] whitespace-nowrap">
                        {isThai ? cmd.category : cmd.categoryEn}
                      </td>
                      <td className="px-4 py-3.5 text-[#D2CAC0]">
                        {isThai ? cmd.description : cmd.descriptionEn}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy(cmd.command)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#2E2922] px-2.5 py-1.5 text-xs text-[#C9C1B5] hover:border-[#C89B3C] hover:text-[#F5E7C6] whitespace-nowrap"
                        >
                          {copiedCmd === cmd.command ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#4ADE80]" />
                              <span>{isThai ? 'คัดลอกแล้ว' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>{isThai ? 'คัดลอก' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. WARP / MOVE.TXT */}
      {section === 'maps' && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#A89F91]">
              {isThai ? (
                <>
                  พิมพ์คำสั่ง <code className="font-mono text-[#E0B85A]">/move ชื่อแผนที่</code> ในเกมหรือกดปุ่ม{' '}
                  <code className="font-mono text-[#E0B85A]">M</code> เพื่อวาร์ป (อ้างอิง Data/Move/Move.txt ทั้ง 23 จุด)
                </>
              ) : (
                <>
                  Type <code className="font-mono text-[#E0B85A]">/move MapName</code> in-game or press{' '}
                  <code className="font-mono text-[#E0B85A]">M</code> to warp (all 23 entries from Data/Move/Move.txt).
                </>
              )}
            </p>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8578]" />
              <input
                type="search"
                value={mapSearch}
                onChange={(e) => setMapSearch(e.target.value)}
                placeholder={isThai ? 'ค้นหาแผนที่ เช่น Tarkan, Icarus...' : 'Search maps e.g. Tarkan, Icarus...'}
                className="w-full rounded-md border border-[#2C2721] bg-[#141210] py-2 pl-9 pr-3 text-sm text-[#EDE8E0] placeholder:text-[#787065] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#26221D] bg-[#141210]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#24201B] bg-[#181512] text-xs text-[#9C9284]">
                    <th className="px-5 py-3.5 font-medium">{isThai ? 'คำสั่งวาร์ป' : 'Warp Command'}</th>
                    <th className="px-4 py-3.5 font-medium">{isThai ? 'รายละเอียดพื้นที่' : 'Zone Description'}</th>
                    <th className="px-4 py-3.5 font-medium text-right">{isThai ? 'เลเวลขั้นต่ำ' : 'Min Level'}</th>
                    <th className="px-4 py-3.5 font-medium text-right">{isThai ? 'ค่าวาร์ป (Zen)' : 'Warp Cost'}</th>
                    <th className="px-5 py-3.5 font-medium text-right">Gate ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#201C18]">
                  {filteredMaps.map((m) => (
                    <tr key={m.index} className="transition-colors hover:bg-[#191613]">
                      <td className="px-5 py-3 font-mono font-medium text-[#E0B85A] whitespace-nowrap">
                        /move {m.name}
                      </td>
                      <td className="px-4 py-3 text-[#D2CAC0]">{isThai ? m.zone : m.zoneEn}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#F2ECE2]">
                        Lv. {m.minLevel}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#C9C1B5]">
                        {m.zen.toLocaleString()} Zen
                      </td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-[#8E8578]">
                        #{m.gate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SERVER RATES & ANTI-HACK */}
      {section === 'rates' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                {isThai ? 'การตั้งค่าระบบรีเซ็ตและอัตราเซิร์ฟเวอร์' : 'Reset System & Server Rates'}
              </h2>
              <p className="text-xs text-[#9C9284]">
                GameServerInfo - Common.dat, Command.dat &amp; ChaosMix.dat
              </p>
            </div>
            <dl className="divide-y divide-[#221E1A] text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">
                  {isThai ? 'เลเวลสูงสุด / เลเวลรีเซ็ต' : 'Max Level / Reset Level'}
                </dt>
                <dd className="font-mono tabular-nums text-[#F5EFE6]">
                  Lv. {SERVER_CONFIG_SPECS.maxLevel} / Lv. {SERVER_CONFIG_SPECS.resetLevel}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">
                  {isThai ? 'ค่าใช้จ่ายรีเซ็ต (CommandResetMoney)' : 'Reset Cost (CommandResetMoney)'}
                </dt>
                <dd className="font-mono tabular-nums text-[#4ADE80]">
                  {isThai ? 'ฟรี (0 Zen)' : 'Free (0 Zen)'}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">
                  {isThai ? 'ระบบเก็บสเตตัสเมื่อรีเซ็ต' : 'Reset Stat Policy'}
                </dt>
                <dd className="text-[#F5EFE6]">
                  {isThai ? 'เก็บสเตตัส สกิล และเควสต์เดิมทั้งหมด' : 'Keep all stats, skills, and quests'}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">
                  {isThai ? 'สเตตัสสูงสุดต่อช่อง (MaxStatPoint)' : 'Max Stat Cap (MaxStatPoint)'}
                </dt>
                <dd className="font-mono tabular-nums text-[#E0B85A]">
                  {SERVER_CONFIG_SPECS.maxStatPoint.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">
                  {isThai ? 'อัตราดรอปไอเทม / เงิน Zen' : 'Item Drop / Zen Drop Rate'}
                </dt>
                <dd className="font-mono tabular-nums text-[#F5EFE6]">
                  {SERVER_CONFIG_SPECS.itemDropRate} / {SERVER_CONFIG_SPECS.zenDropRate}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">
                  {isThai ? 'จำกัดการเชื่อมต่อต่อ IP (MaxIpConnection)' : 'Connections per IP (MaxIpConnection)'}
                </dt>
                <dd className="font-mono tabular-nums text-[#F5EFE6]">
                  {isThai
                    ? `${SERVER_CONFIG_SPECS.maxIpConnections} จอต่อ IP`
                    : `${SERVER_CONFIG_SPECS.maxIpConnections} clients / IP`}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">
                  {isThai ? 'เลเวลสูงสุดที่ลบตัวละครได้' : 'Max Character Delete Level'}
                </dt>
                <dd className="font-mono tabular-nums text-[#F5EFE6]">
                  {isThai
                    ? `ไม่เกิน Lv. ${SERVER_CONFIG_SPECS.charDeleteMaxLevel}`
                    : `Up to Lv. ${SERVER_CONFIG_SPECS.charDeleteMaxLevel}`}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                {isThai ? 'โบนัส EXP ปาร์ตี้ (PartyExperience)' : 'Party EXP Bonus (PartyExperience)'}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SERVER_CONFIG_SPECS.partyExpBonus.map((p) => (
                  <div
                    key={p.members}
                    className="rounded-md border border-[#24201B] bg-[#181512] p-3 text-center"
                  >
                    <div className="text-xs text-[#9C9284]">
                      {isThai ? `ปาร์ตี้ ${p.members} คน` : `${p.members} Players`}
                    </div>
                    <div className="mt-1 font-mono text-lg font-semibold text-[#E0B85A] tabular-nums">
                      {p.rate}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                {isThai ? 'ระบบป้องกันโปรแกรมช่วยเล่นฝั่งเซิร์ฟเวอร์' : 'Server-Side Anti-Hack Protection'}
              </h2>
              <div className="divide-y divide-[#221E1A] text-sm">
                {SERVER_CONFIG_SPECS.antiHack.map((rule) => (
                  <div key={rule.key} className="py-2.5">
                    <div className="font-mono text-xs font-semibold text-[#E0B85A]">{rule.key}</div>
                    <div className="mt-0.5 text-[#C4BCB0]">{isThai ? rule.detail : rule.detailEn}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
