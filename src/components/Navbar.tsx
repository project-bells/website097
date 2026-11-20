import { ExternalLink, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SERVER_CONFIG_SPECS } from '../shared/muData';

export type PortalPage = 'home' | 'rankings' | 'guide' | 'download' | 'account';

interface NavbarProps {
  currentPage: PortalPage;
  onNavigate: (page: PortalPage) => void;
  accountId: string | null;
}

export function Navbar({ currentPage, onNavigate, accountId }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ id: PortalPage; label: string }> = [
    { id: 'home', label: 'หน้าหลัก' },
    { id: 'rankings', label: 'อันดับผู้เล่น' },
    { id: 'guide', label: 'กิจกรรมและคู่มือ' },
    { id: 'download', label: 'ดาวน์โหลด' },
    { id: 'account', label: accountId ? `บัญชี: ${accountId}` : 'บัญชีของฉัน' },
  ];

  const handleNav = (page: PortalPage) => {
    onNavigate(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#24201B] bg-[#0B0A09]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-display text-lg font-bold tracking-tight text-[#F5E7C6] transition-colors hover:text-[#E0B85A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C] rounded"
        >
          {SERVER_CONFIG_SPECS.brandName}
        </button>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav aria-label="เมนูหลัก" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C] rounded ${
                  active ? 'text-[#F5E7C6]' : 'text-[#A89F91] hover:text-[#EDE8E0]'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-[#C89B3C]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action — PlayOnline */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={SERVER_CONFIG_SPECS.playOnlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-md bg-[#C89B3C] px-4 py-2 text-sm font-semibold text-[#120F0A] transition-colors hover:bg-[#D9AE50] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0B85A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0A09]"
          >
            <span>PlayOnline</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#2A2520] text-[#D7CFC2] hover:bg-[#171411] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#24201B] bg-[#110F0D] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active ? 'bg-[#1D1915] text-[#E0B85A]' : 'text-[#C4BCB0] hover:bg-[#181512]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            <a
              href={SERVER_CONFIG_SPECS.playOnlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#C89B3C] px-4 py-2.5 text-center text-sm font-semibold text-[#120F0A]"
            >
              <span>PlayOnline</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
