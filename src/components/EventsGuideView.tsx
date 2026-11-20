import { Check, Copy, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { computeEventCountdowns, type ComputedEventState } from '../lib/eventTimers';
import {
  MOVE_GATES,
  PLAYER_COMMANDS,
  SERVER_CONFIG_SPECS,
  type PlayerCommandSpec,
} from '../shared/muData';

type GuideSection = 'events' | 'commands' | 'maps' | 'rates';

const SECTION_TABS: Array<{ id: GuideSection; label: string }> = [
  { id: 'events', label: 'ตารางกิจกรรมสด' },
  { id: 'commands', label: 'คำสั่งผู้เล่น (Command.txt)' },
  { id: 'maps', label: 'แผนที่และวาร์ป (Move.txt)' },
  { id: 'rates', label: 'อัตราและกติกาเซิร์ฟเวอร์' },
];

const COMMAND_CATEGORIES: Array<'ทั้งหมด' | PlayerCommandSpec['category']> = [
  'ทั้งหมด',
  'การเคลื่อนที่และสื่อสาร',
  'สเตตัสและรีเซ็ต',
  'ตัวละครและคลัง',
  'กิลด์และระบบ',
];

export function EventsGuideView() {
  const [section, setSection] = useState<GuideSection>('events');
  const [events, setEvents] = useState<ComputedEventState[]>(() => computeEventCountdowns(new Date()));
  const [cmdCategory, setCmdCategory] = useState<'ทั้งหมด' | PlayerCommandSpec['category']>('ทั้งหมด');
  const [cmdSearch, setCmdSearch] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [mapSearch, setMapSearch] = useState('');

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
    const matchCat = cmdCategory === 'ทั้งหมด' || c.category === cmdCategory;
    const q = cmdSearch.trim().toLowerCase();
    const matchQ =
      !q ||
      c.command.toLowerCase().includes(q) ||
      c.syntax.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const filteredMaps = MOVE_GATES.filter((m) => {
    const q = mapSearch.trim().toLowerCase();
    return !q || m.name.toLowerCase().includes(q) || m.zone.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-[#F7F2E8]">
          ตารางกิจกรรมและคู่มือผู้เล่น MuOrigins
        </h1>
        <p className="text-sm text-[#A89F91]">
          ข้อมูลทั้งหมดอ้างอิงโดยตรงจากไฟล์ตั้งค่าเซิร์ฟเวอร์ใน repository EmanuelCatania/Mu-Linux
        </p>
      </div>

      {/* Section Switcher */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#26221D] bg-[#141210] p-1 w-fit">
        {SECTION_TABS.map((item) => {
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
                    {ev.event.category} · {ev.event.sourceFile}
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
                      ? 'กำลังดำเนินการ'
                      : ev.status === 'warning'
                        ? 'แจ้งเตือนก่อนเริ่ม'
                        : `รอบถัดไป ${ev.nextTimeLabel} น.`}
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#24201B] pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#9C9284]">สถานที่ / แผนที่</span>
                  <span className="text-right text-[#E3DDD3]">{ev.event.maps}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#9C9284]">ระยะเวลารอบ</span>
                  <span className="font-mono tabular-nums text-[#E3DDD3]">
                    {ev.event.durationMinutes} นาที
                    {ev.event.warningMinutes > 0 ? ` (เตือนล่วงหน้า ${ev.event.warningMinutes} นาที)` : ''}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#9C9284]">ของรางวัลหลัก</span>
                  <span className="text-right text-[#C9C1B5]">{ev.event.rewardSummary}</span>
                </div>
                <div className="pt-2 text-xs text-[#8E8578] font-mono tabular-nums">
                  รอบเวลา: {ev.event.scheduleTimes.join(', ')}
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
              {COMMAND_CATEGORIES.map((cat) => {
                const active = cmdCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCmdCategory(cat)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'border-[#C89B3C] bg-[#C89B3C]/15 text-[#E0B85A]'
                        : 'border-[#26221D] bg-[#141210] text-[#A89F91] hover:border-[#3E372E]'
                    }`}
                  >
                    {cat}
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
                placeholder="ค้นหาคำสั่ง เช่น /reset, /str..."
                className="w-full rounded-md border border-[#2C2721] bg-[#141210] py-2 pl-9 pr-3 text-sm text-[#EDE8E0] placeholder:text-[#787065] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#26221D] bg-[#141210]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#24201B] bg-[#181512] text-xs text-[#9C9284]">
                    <th className="px-5 py-3.5 font-medium">รูปแบบคำสั่ง</th>
                    <th className="px-4 py-3.5 font-medium">หมวดหมู่</th>
                    <th className="px-4 py-3.5 font-medium">คำอธิบายการทำงาน</th>
                    <th className="px-5 py-3.5 font-medium text-right">คัดลอก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#201C18]">
                  {filteredCommands.map((cmd) => (
                    <tr key={cmd.command} className="transition-colors hover:bg-[#191613]">
                      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-[#E0B85A] whitespace-nowrap">
                        {cmd.syntax}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#9C9284] whitespace-nowrap">
                        {cmd.category}
                      </td>
                      <td className="px-4 py-3.5 text-[#D2CAC0]">{cmd.description}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy(cmd.command)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#2E2922] px-2.5 py-1.5 text-xs text-[#C9C1B5] hover:border-[#C89B3C] hover:text-[#F5E7C6] whitespace-nowrap"
                        >
                          {copiedCmd === cmd.command ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#4ADE80]" />
                              <span>คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>คัดลอก</span>
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
              พิมพ์คำสั่ง <code className="font-mono text-[#E0B85A]">/move ชื่อแผนที่</code> ในเกมหรือกดปุ่ม <code className="font-mono text-[#E0B85A]">M</code> เพื่อวาร์ป (อ้างอิง Data/Move/Move.txt ทั้ง 23 จุด)
            </p>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8578]" />
              <input
                type="search"
                value={mapSearch}
                onChange={(e) => setMapSearch(e.target.value)}
                placeholder="ค้นหาแผนที่ เช่น Tarkan, Icarus..."
                className="w-full rounded-md border border-[#2C2721] bg-[#141210] py-2 pl-9 pr-3 text-sm text-[#EDE8E0] placeholder:text-[#787065] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#26221D] bg-[#141210]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#24201B] bg-[#181512] text-xs text-[#9C9284]">
                    <th className="px-5 py-3.5 font-medium">คำสั่งวาร์ป</th>
                    <th className="px-4 py-3.5 font-medium">รายละเอียดพื้นที่</th>
                    <th className="px-4 py-3.5 font-medium text-right">เลเวลขั้นต่ำ</th>
                    <th className="px-4 py-3.5 font-medium text-right">ค่าวาร์ป (Zen)</th>
                    <th className="px-5 py-3.5 font-medium text-right">Gate ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#201C18]">
                  {filteredMaps.map((m) => (
                    <tr key={m.index} className="transition-colors hover:bg-[#191613]">
                      <td className="px-5 py-3 font-mono font-medium text-[#E0B85A] whitespace-nowrap">
                        /move {m.name}
                      </td>
                      <td className="px-4 py-3 text-[#D2CAC0]">{m.zone}</td>
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
                การตั้งค่าระบบรีเซ็ตและอัตราเซิร์ฟเวอร์
              </h2>
              <p className="text-xs text-[#9C9284]">
                GameServerInfo - Common.dat, Command.dat และ ChaosMix.dat
              </p>
            </div>
            <dl className="divide-y divide-[#221E1A] text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">เลเวลสูงสุด / เลเวลรีเซ็ต</dt>
                <dd className="font-mono tabular-nums text-[#F5EFE6]">
                  Lv. {SERVER_CONFIG_SPECS.maxLevel} / Lv. {SERVER_CONFIG_SPECS.resetLevel}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">ค่าใช้จ่ายรีเซ็ต (CommandResetMoney)</dt>
                <dd className="font-mono tabular-nums text-[#4ADE80]">ฟรี (0 Zen)</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">ระบบเก็บสเตตัสเมื่อรีเซ็ต</dt>
                <dd className="text-[#F5EFE6]">เก็บสเตตัส สกิล และเควสต์เดิมทั้งหมด</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">สเตตัสสูงสุดต่อช่อง (MaxStatPoint)</dt>
                <dd className="font-mono tabular-nums text-[#E0B85A]">
                  {SERVER_CONFIG_SPECS.maxStatPoint.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">อัตราดรอปไอเทม / เงิน Zen</dt>
                <dd className="font-mono tabular-nums text-[#F5EFE6]">
                  {SERVER_CONFIG_SPECS.itemDropRate} / {SERVER_CONFIG_SPECS.zenDropRate}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">จำกัดการเชื่อมต่อต่อ IP (MaxIpConnection)</dt>
                <dd className="font-mono tabular-nums text-[#F5EFE6]">
                  {SERVER_CONFIG_SPECS.maxIpConnections} จอต่อ IP
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A89F91]">เลเวลสูงสุดที่ลบตัวละครได้</dt>
                <dd className="font-mono tabular-nums text-[#F5EFE6]">
                  ไม่เกิน Lv. {SERVER_CONFIG_SPECS.charDeleteMaxLevel}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                โบนัส EXP ปาร์ตี้ (PartyExperience)
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SERVER_CONFIG_SPECS.partyExpBonus.map((p) => (
                  <div
                    key={p.members}
                    className="rounded-md border border-[#24201B] bg-[#181512] p-3 text-center"
                  >
                    <div className="text-xs text-[#9C9284]">ปาร์ตี้ {p.members} คน</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-[#E0B85A] tabular-nums">
                      {p.rate}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                ระบบป้องกันโปรแกรมช่วยเล่นฝั่งเซิร์ฟเวอร์
              </h2>
              <div className="divide-y divide-[#221E1A] text-sm">
                {SERVER_CONFIG_SPECS.antiHack.map((rule) => (
                  <div key={rule.key} className="py-2.5">
                    <div className="font-mono text-xs font-semibold text-[#E0B85A]">{rule.key}</div>
                    <div className="mt-0.5 text-[#C4BCB0]">{rule.detail}</div>
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
