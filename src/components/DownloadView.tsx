import { Check, Copy, Download, ExternalLink, Globe } from 'lucide-react';
import { useState } from 'react';
import { SERVER_CONFIG_SPECS, type ServerOverview } from '../shared/muData';

interface DownloadViewProps {
  overview: ServerOverview | null;
}

const CLIENT_PACKAGES = [
  {
    id: 'windows',
    platform: 'Windows 10 / 11 (64-bit)',
    title: 'MuOrigins 0.97k Client — Windows',
    renderer: 'OpenGL 3.3 / WebGPU',
    size: '412 MB',
    highlights: [
      'คอมไพล์ใหม่จากซอร์ส 0.97k ไม่ใช้ DLL Inject แบบเก่า',
      'รองรับความละเอียดจอกว้าง, เฟรมเรตลื่นไหล และแถบเลือดมอนสเตอร์',
      'ซิงก์ Custom Items สูงสุด 511 ชิ้นต่อหมวดจากเซิร์ฟเวอร์โดยตรง',
    ],
    url: 'https://github.com/EmanuelCatania/Mu-Linux/releases',
  },
  {
    id: 'linux',
    platform: 'Linux Native (x86_64 & ARM64)',
    title: 'MuOrigins 0.97k Client — Linux',
    renderer: 'OpenGL 3.3 / WebGPU Native',
    size: '398 MB',
    highlights: [
      'รันเนทีฟบน Linux โดยตรง ไม่ต้องติดตั้ง Wine หรือ Proton',
      'รองรับทั้งสถาปัตยกรรม amd64 และ ARM64',
      'ทำงานคู่กับเซิร์ฟเวอร์ Linux epoll และ ConnectServer TCP 44405',
    ],
    url: 'https://github.com/EmanuelCatania/Mu-Linux/releases',
  },
];

const ENV_SNIPPET = `DB_HOST=mysql
DB_PORT=3306
DB_USER=admin
DB_PASS=your_mysql_password
DB_NAME=MuOnline97
CS_HOST=mu-server
CS_PORT=44405
GS_HOST=mu-server
GS_PORT=55901`;

export function DownloadView({ overview }: DownloadViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEnv = async () => {
    try {
      await navigator.clipboard.writeText(ENV_SNIPPET);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-[#F7F2E8]">
            ดาวน์โหลดและเข้าเล่น MuOrigins
          </h1>
          <p className="text-sm text-[#A89F91] max-w-2xl">
            เลือกเข้าเล่นออนไลน์ผ่านเว็บได้ทันที หรือดาวน์โหลดไคลเอนต์เวอร์ชัน 0.97k สำหรับ Windows และ Linux เนทีฟ
          </p>
        </div>
        <a
          href={SERVER_CONFIG_SPECS.playOnlineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#C89B3C] px-5 py-2.5 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] whitespace-nowrap shrink-0"
        >
          <Globe className="h-4 w-4" />
          <span>PlayOnline</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* PlayOnline Highlight Banner */}
      <div className="flex flex-col gap-5 rounded-lg border border-[#3B3122] bg-[#16130F] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-[#C89B3C]">
            เข้าเล่นออนไลน์ · ไม่ต้องติดตั้งโปรแกรม
          </div>
          <h2 className="font-display text-xl font-semibold text-[#F7F2E8]">
            MuOrigins PlayOnline
          </h2>
          <p className="text-sm text-[#B8AFA2]">
            เชื่อมต่อเข้าสู่โลก MuOrigins ออนไลน์ได้ทันทีที่{' '}
            <span className="font-mono text-[#E0B85A]">playonline.muorigins.online</span>
          </p>
        </div>
        <a
          href={SERVER_CONFIG_SPECS.playOnlineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#C89B3C] px-6 py-3 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] whitespace-nowrap shrink-0"
        >
          <span>เปิด PlayOnline</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Client Packages */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {CLIENT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="flex flex-col justify-between rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#C89B3C]">
                <span>{pkg.platform}</span>
                <span className="font-mono tabular-nums text-[#A89F91]">
                  {pkg.renderer} · {pkg.size}
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold text-[#F5EFE6]">{pkg.title}</h2>
              <ul className="space-y-2 pt-2 text-sm text-[#C4BCB0]">
                {pkg.highlights.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#C89B3C]" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#24201B] pt-5">
              <span className="text-xs text-[#9C9284]">
                อัปเดตล่าสุดจาก GitHub Releases
              </span>
              <a
                href={pkg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[#3B342B] bg-[#1B1814] px-4 py-2 text-sm font-medium text-[#EDE8E0] transition-colors hover:border-[#C89B3C] hover:text-[#F5E7C6] whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                <span>ดาวน์โหลดไคลเอนต์</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* System Requirements + Live Mu-Linux Backend Connection */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4 lg:col-span-5">
          <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
            ความต้องการของระบบ (ขั้นต่ำ / แนะนำ)
          </h2>
          <dl className="divide-y divide-[#221E1A] text-sm">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#9C9284]">ระบบปฏิบัติการ</dt>
              <dd className="text-right text-[#E3DDD3]">Windows 10+ หรือ Linux (x86_64 / ARM64)</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#9C9284]">การ์ดจอ (GPU)</dt>
              <dd className="text-right text-[#E3DDD3]">รองรับ OpenGL 3.3 หรือ WebGPU</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#9C9284]">หน่วยความจำ (RAM)</dt>
              <dd className="text-right font-mono tabular-nums text-[#E3DDD3]">2 GB ขึ้นไป</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#9C9284]">พื้นที่ว่าง</dt>
              <dd className="text-right font-mono tabular-nums text-[#E3DDD3]">1.5 GB</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#9C9284]">พอร์ตเกมที่ต้องเปิด</dt>
              <dd className="text-right font-mono tabular-nums text-[#E0B85A]">
                TCP {SERVER_CONFIG_SPECS.connectServerPort} / {SERVER_CONFIG_SPECS.gameServerPort}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
                สถานะการเชื่อมต่อฐานข้อมูล MuOnline97
              </h2>
              <p className="text-xs text-[#9C9284]">
                รองรับการเชื่อมต่อตรงเข้า MySQL 8.4 (MuOnline97) และ JoinServer bcrypt (PasswordHash=1) ของ EmanuelCatania/Mu-Linux
              </p>
            </div>
            <a
              href={SERVER_CONFIG_SPECS.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C89B3C] hover:text-[#E0B85A] whitespace-nowrap"
            >
              <span>ดูซอร์สโค้ด GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 border-y border-[#24201B] py-4 text-xs sm:grid-cols-3">
            <div>
              <div className="text-[#9C9284]">โหมดฐานข้อมูลปัจจุบัน</div>
              <div className="mt-1 font-mono font-semibold text-[#F2ECE2]">
                {overview?.connectionMode === 'mysql-live'
                  ? 'MySQL 8.4 (เชื่อมต่อแล้ว)'
                  : 'ยังไม่กำหนดค่า DB_HOST'}
              </div>
            </div>
            <div>
              <div className="text-[#9C9284]">ConnectServer / GameServer</div>
              <div className="mt-1 font-mono tabular-nums text-[#E0B85A]">
                :{overview?.connectServer.port ?? 44405} · :{overview?.gameServer.port ?? 55901}
              </div>
            </div>
            <div>
              <div className="text-[#9C9284]">การเข้ารหัสรหัสผ่าน</div>
              <div className="mt-1 font-mono text-[#F2ECE2]">bcrypt VARBINARY(60)</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A89F91]">
                ตั้งค่าตัวแปรสภาพแวดล้อม (.env) เพื่อเชื่อมกับ Docker stack ของเซิร์ฟเวอร์โดยตรง
              </span>
              <button
                type="button"
                onClick={handleCopyEnv}
                className="inline-flex items-center gap-1.5 rounded border border-[#2E2922] px-2.5 py-1 text-xs text-[#C9C1B5] hover:border-[#C89B3C]"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกค่า .env'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto rounded-md border border-[#24201B] bg-[#0D0C0A] p-4 font-mono text-xs leading-relaxed text-[#D8D0C3]">
              {ENV_SNIPPET}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
