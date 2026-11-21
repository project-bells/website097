import { useCallback, useEffect, useState } from 'react';
import { AccountView } from './components/AccountView';
import { AdminView } from './components/AdminView';
import { DownloadView } from './components/DownloadView';
import { EventsGuideView } from './components/EventsGuideView';
import { HomeView } from './components/HomeView';
import { Navbar, type PortalPage } from './components/Navbar';
import { RankingsView } from './components/RankingsView';
import { api } from './lib/api';
import { useLanguage } from './lib/i18n';
import { SERVER_CONFIG_SPECS, type AccountProfile, type ServerOverview } from './shared/muData';

function resolveInitialPage(): PortalPage {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return 'admin';
  }
  return 'home';
}

export default function App() {
  const { isThai } = useLanguage();
  const [page, setPageState] = useState<PortalPage>(resolveInitialPage);
  const [overview, setOverview] = useState<ServerOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<AccountProfile | null>(null);

  const navigate = useCallback((nextPage: PortalPage) => {
    setPageState(nextPage);
    if (typeof window !== 'undefined') {
      const targetPath = nextPage === 'admin' ? '/admin' : '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page: nextPage }, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPop = () => {
      setPageState(resolveInitialPage());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

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
        onNavigate={navigate}
        accountId={profile?.memb___id ?? null}
      />

      <main className="flex-1">
        {page === 'home' && (
          <HomeView
            overview={overview}
            loading={overviewLoading}
            onNavigate={navigate}
            accountId={profile?.memb___id ?? null}
          />
        )}
        {page === 'rankings' && <RankingsView />}
        {page === 'guide' && <EventsGuideView />}
        {page === 'download' && <DownloadView />}
        {page === 'account' && (
          <AccountView
            profile={profile}
            onProfileChange={setProfile}
            onRefreshOverview={loadOverview}
          />
        )}
        {page === 'admin' && <AdminView onContentChanged={loadOverview} />}
      </main>

      <footer className="border-t border-[#221E1A] bg-[#0E0D0B]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-[#8E8578] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="space-y-1">
            <div className="font-display text-sm font-semibold text-[#D7CFC2]">
              {SERVER_CONFIG_SPECS.brandName}
            </div>
            <p>
              {isThai
                ? 'พอร์ทัลผู้เล่น MU Online 0.97k · MuOrigins'
                : 'MU Online 0.97k Player Portal · MuOrigins'}
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
            <button type="button" onClick={() => navigate('rankings')} className="hover:text-[#EDE8E0]">
              {isThai ? 'อันดับผู้เล่น' : 'Rankings'}
            </button>
            <button type="button" onClick={() => navigate('guide')} className="hover:text-[#EDE8E0]">
              {isThai ? 'ตารางกิจกรรม' : 'Events'}
            </button>
            <button type="button" onClick={() => navigate('download')} className="hover:text-[#EDE8E0]">
              {isThai ? 'ดาวน์โหลด' : 'Download'}
            </button>
            <button type="button" onClick={() => navigate('account')} className="hover:text-[#EDE8E0]">
              {isThai ? 'จัดการบัญชี' : 'Account'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
