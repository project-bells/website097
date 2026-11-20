import { useCallback, useEffect, useState } from 'react';
import { AccountView } from './components/AccountView';
import { DownloadView } from './components/DownloadView';
import { EventsGuideView } from './components/EventsGuideView';
import { HomeView } from './components/HomeView';
import { Navbar, type PortalPage } from './components/Navbar';
import { RankingsView } from './components/RankingsView';
import { api } from './lib/api';
import { SERVER_CONFIG_SPECS, type AccountProfile, type ServerOverview } from './shared/muData';

export default function App() {
  const [page, setPage] = useState<PortalPage>('home');
  const [overview, setOverview] = useState<ServerOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<AccountProfile | null>(null);

  const loadOverview = useCallback(async () => {
    try {
      const data = await api.getOverview();
      setOverview(data);
    } catch {
      // Keep previous overview state on transient errors
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    api
      .getMe()
      .then((res) => {
        if (res.authenticated && res.profile) {
          setProfile(res.profile);
        }
      })
      .catch(() => {
        // Unauthenticated
      });
  }, [loadOverview]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0A09] text-[#EDE8E0]">
      <Navbar
        currentPage={page}
        onNavigate={setPage}
        accountId={profile?.memb___id ?? null}
      />

      <main className="flex-1">
        {page === 'home' && (
          <HomeView
            overview={overview}
            loading={overviewLoading}
            onNavigate={setPage}
            accountId={profile?.memb___id ?? null}
          />
        )}
        {page === 'rankings' && <RankingsView />}
        {page === 'guide' && <EventsGuideView />}
        {page === 'download' && <DownloadView overview={overview} />}
        {page === 'account' && (
          <AccountView
            profile={profile}
            onProfileChange={setProfile}
            onRefreshOverview={loadOverview}
          />
        )}
      </main>

      <footer className="border-t border-[#221E1A] bg-[#0E0D0B]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-[#8E8578] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="space-y-1">
            <div className="font-display text-sm font-semibold text-[#D7CFC2]">
              {SERVER_CONFIG_SPECS.brandName}
            </div>
            <p>
              พอร์ทัลผู้เล่นที่เชื่อมต่อกับสถาปัตยกรรมฐานข้อมูล MuOnline97 ของ{' '}
              <a
                href={SERVER_CONFIG_SPECS.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C89B3C] hover:underline"
              >
                EmanuelCatania/Mu-Linux
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href={SERVER_CONFIG_SPECS.playOnlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C89B3C] hover:text-[#E0B85A]"
            >
              PlayOnline
            </a>
            <button type="button" onClick={() => setPage('rankings')} className="hover:text-[#EDE8E0]">
              อันดับผู้เล่น
            </button>
            <button type="button" onClick={() => setPage('guide')} className="hover:text-[#EDE8E0]">
              ตารางกิจกรรม
            </button>
            <button type="button" onClick={() => setPage('download')} className="hover:text-[#EDE8E0]">
              ดาวน์โหลด
            </button>
            <button type="button" onClick={() => setPage('account')} className="hover:text-[#EDE8E0]">
              จัดการบัญชี
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
