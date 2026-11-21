import { Download, ExternalLink, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatPortalDate, useLanguage } from '../lib/i18n';
import { SERVER_CONFIG_SPECS, type DownloadItem } from '../shared/muData';

export function DownloadView() {
  const { lang, isThai } = useLanguage();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getDownloads()
      .then((res) => {
        if (active) setDownloads(res.downloads);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-[#F7F2E8]">
            {isThai ? 'ดาวน์โหลดและเข้าเล่น MuOrigins' : 'Download & Play MuOrigins'}
          </h1>
          <p className="text-sm text-[#A89F91] max-w-2xl">
            {isThai
              ? 'เข้าเล่นออนไลน์ผ่านเว็บเบราว์เซอร์ได้ทันที หรือดาวน์โหลดไฟล์ตัวเกมเวอร์ชันล่าสุดที่เผยแพร่โดยผู้ดูแลเซิร์ฟเวอร์'
              : 'Play instantly online in your browser or download the latest client packages published by the server administrators.'}
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
            {isThai ? 'เข้าเล่นออนไลน์ · ไม่ต้องติดตั้งโปรแกรม' : 'Instant Browser Play · No Install Required'}
          </div>
          <h2 className="font-display text-xl font-semibold text-[#F7F2E8]">
            MuOrigins PlayOnline
          </h2>
          <p className="text-sm text-[#B8AFA2]">
            {isThai ? (
              <>
                เชื่อมต่อเข้าสู่โลก MuOrigins ออนไลน์ได้ทันทีที่{' '}
                <span className="font-mono text-[#E0B85A]">playonline.muorigins.online</span>
              </>
            ) : (
              <>
                Connect directly to the MuOrigins realm online at{' '}
                <span className="font-mono text-[#E0B85A]">playonline.muorigins.online</span>
              </>
            )}
          </p>
        </div>
        <a
          href={SERVER_CONFIG_SPECS.playOnlineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#C89B3C] px-6 py-3 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] whitespace-nowrap shrink-0"
        >
          <span>{isThai ? 'เปิด PlayOnline' : 'Launch PlayOnline'}</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {error && (
        <div className="rounded-md border border-[#7F1D1D] bg-[#2A1212] px-4 py-3 text-sm text-[#FCA5A5]">
          {error}
        </div>
      )}

      {/* Client Packages (Managed from Admin Backoffice) */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-[#F5EFE6]">
          {isThai ? 'ไฟล์ดาวน์โหลดไคลเอนต์' : 'Client Downloads'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-lg border border-[#26221D] bg-[#141210] p-6"
              />
            ))}
          </div>
        ) : downloads.length === 0 ? (
          <div className="rounded-lg border border-[#26221D] bg-[#141210] p-10 text-center space-y-2">
            <p className="text-sm text-[#C4BCB0]">
              {isThai
                ? 'ยังไม่มีไฟล์ดาวน์โหลดที่เผยแพร่ในขณะนี้'
                : 'No client packages are currently published.'}
            </p>
            <p className="text-xs text-[#8E8578]">
              {isThai
                ? 'ผู้ดูแลระบบสามารถเพิ่มลิงก์ดาวน์โหลดไคลเอนต์ Windows หรือ Linux ได้จากหน้าจัดการหลังบ้าน (Admin)'
                : 'Administrators can publish Windows or Linux client download links from the Admin backoffice.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {downloads.map((pkg) => {
              const updatedLabel = formatPortalDate(pkg.updatedAt, lang);
              return (
                <div
                  key={pkg.id}
                  className="flex flex-col justify-between rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#C89B3C]">
                      <span>{pkg.platform}</span>
                      <span className="font-mono tabular-nums text-[#A89F91]">
                        {pkg.version}
                        {pkg.renderer ? ` · ${pkg.renderer}` : ''}
                        {pkg.size ? ` · ${pkg.size}` : ''}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#F5EFE6]">{pkg.title}</h3>
                    {pkg.highlights.length > 0 && (
                      <ul className="space-y-2 pt-2 text-sm text-[#C4BCB0]">
                        {pkg.highlights.map((line, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span
                              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#C89B3C]"
                              aria-hidden="true"
                            />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-[#24201B] pt-5">
                    <span className="text-xs text-[#9C9284] font-mono tabular-nums">
                      {isThai ? `อัปเดต ${updatedLabel}` : `Updated ${updatedLabel}`}
                    </span>
                    <a
                      href={pkg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-[#C89B3C] px-4 py-2 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] whitespace-nowrap"
                    >
                      <Download className="h-4 w-4" />
                      <span>{isThai ? 'ดาวน์โหลดไคลเอนต์' : 'Download Client'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* System Requirements */}
      <section className="rounded-lg border border-[#26221D] bg-[#141210] p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-[#F5EFE6]">
          {isThai ? 'ความต้องการของระบบ (ขั้นต่ำ / แนะนำ)' : 'System Requirements (Minimum / Recommended)'}
        </h2>
        <dl className="grid grid-cols-1 gap-x-10 divide-y divide-[#221E1A] text-sm md:grid-cols-2 md:divide-y-0">
          <div className="flex justify-between gap-4 border-b border-[#221E1A] py-3">
            <dt className="text-[#9C9284]">{isThai ? 'ระบบปฏิบัติการ' : 'Operating System'}</dt>
            <dd className="text-right text-[#E3DDD3]">
              {isThai
                ? 'Windows 10+ หรือ Linux (x86_64 / ARM64)'
                : 'Windows 10+ or Linux (x86_64 / ARM64)'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#221E1A] py-3">
            <dt className="text-[#9C9284]">{isThai ? 'การ์ดจอ (GPU)' : 'Graphics (GPU)'}</dt>
            <dd className="text-right text-[#E3DDD3]">
              {isThai ? 'รองรับ OpenGL 3.3 หรือ WebGPU' : 'OpenGL 3.3 or WebGPU capable'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#221E1A] py-3 md:border-b-0">
            <dt className="text-[#9C9284]">{isThai ? 'หน่วยความจำ (RAM)' : 'Memory (RAM)'}</dt>
            <dd className="text-right font-mono tabular-nums text-[#E3DDD3]">
              {isThai ? '2 GB ขึ้นไป' : '2 GB or higher'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-[#9C9284]">{isThai ? 'พื้นที่ว่าง / พอร์ตเกม' : 'Storage / Game Ports'}</dt>
            <dd className="text-right font-mono tabular-nums text-[#E0B85A]">
              1.5 GB · TCP {SERVER_CONFIG_SPECS.connectServerPort} / {SERVER_CONFIG_SPECS.gameServerPort}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
