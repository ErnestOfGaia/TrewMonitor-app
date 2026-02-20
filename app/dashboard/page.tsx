'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { TerminalBox, LoadingSpinner, AsciiDivider } from '@/components/terminal-box';
import { TrendingUp, TrendingDown, Bot, Lightbulb, RefreshCw } from 'lucide-react';
import { getTipOfTheWeek, type RiskTip } from '@/lib/tips-data';
import type { BotData } from '@/lib/phemex-api';

interface Settings {
  tipLevel: number;
  refreshRate: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [bots, setBots] = useState<BotData[]>([]);
  const [settings, setSettings] = useState<Settings>({ tipLevel: 1, refreshRate: 60 });
  const [tip, setTip] = useState<RiskTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router?.replace?.('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    const weeklyTip = getTipOfTheWeek(settings?.tipLevel ?? 1);
    setTip(weeklyTip);
  }, [settings?.tipLevel]);

  const fetchData = async () => {
    try {
      const [botsRes, settingsRes] = await Promise.all([
        fetch('/api/bots'),
        fetch('/api/settings'),
      ]);

      const botsData = await botsRes?.json?.();
      const settingsData = await settingsRes?.json?.();

      setBots(botsData?.bots ?? []);
      setIsDemo(botsData?.demo === true);
      setSettings({
        tipLevel: settingsData?.tipLevel ?? 1,
        refreshRate: settingsData?.refreshRate ?? 60,
      });
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    if (status !== 'authenticated' || !settings?.refreshRate) return;

    const interval = setInterval(() => {
      fetchData();
    }, (settings?.refreshRate ?? 60) * 1000);

    return () => clearInterval(interval);
  }, [status, settings?.refreshRate]);

  // Calculate totals
  const totalRealizedPnl = (bots ?? [])?.reduce?.((sum, bot) => sum + (bot?.realizedPnl ?? 0), 0) ?? 0;
  const totalUnrealizedPnl = (bots ?? [])?.reduce?.((sum, bot) => sum + (bot?.unrealizedPnl ?? 0), 0) ?? 0;
  const totalPnl = totalRealizedPnl + totalUnrealizedPnl;
  const totalInvestment = (bots ?? [])?.reduce?.((sum, bot) => sum + (bot?.investment ?? 0), 0) ?? 0;
  const totalRoi = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;
  
  // Calculate weighted average APR
  const weightedApr = totalInvestment > 0
    ? (bots ?? [])?.reduce?.((sum, bot) => sum + ((bot?.apr ?? 0) * (bot?.investment ?? 0)), 0) / totalInvestment
    : 0;

  const activeBots = (bots ?? [])?.filter?.((b) => b?.status === 'active')?.length ?? 0;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-60px)]">
          <LoadingSpinner text="Loading dashboard data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-wider flex items-center gap-2">
              <span className="text-terminal-dim">[</span>
              DASHBOARD
              <span className="text-terminal-dim">]</span>
            </h1>
            {isDemo && (
              <span className="demo-badge">DEMO MODE</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-terminal-dim">
            {lastRefresh && (
              <span>Last update: {lastRefresh?.toLocaleTimeString?.() ?? ''}</span>
            )}
            <button
              onClick={fetchData}
              className="flex items-center gap-1 hover:text-terminal-green"
            >
              <RefreshCw className="w-3 h-3" />
              REFRESH
            </button>
          </div>
        </div>

        <AsciiDivider />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="stat-card">
            <div className={`stat-value flex items-center gap-2 ${totalRoi >= 0 ? 'text-positive' : 'text-negative'}`}>
              {totalRoi >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {totalRoi?.toFixed?.(2) ?? '0.00'}%
            </div>
            <div className="stat-label">TOTAL ROI</div>
            <div className="text-xs text-terminal-dim mt-1">
              ${totalPnl?.toFixed?.(2) ?? '0.00'} P&L
            </div>
          </div>

          <div className="stat-card">
            <div className={`stat-value ${weightedApr >= 0 ? 'text-positive' : 'text-negative'}`}>
              {weightedApr?.toFixed?.(1) ?? '0.0'}%
            </div>
            <div className="stat-label">AVERAGE APR</div>
            <div className="text-xs text-terminal-dim mt-1">
              Annualized return rate
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-value flex items-center gap-2">
              <Bot className="w-6 h-6" />
              {activeBots}
            </div>
            <div className="stat-label">ACTIVE BOTS</div>
            <div className="text-xs text-terminal-dim mt-1">
              ${totalInvestment?.toFixed?.(2) ?? '0.00'} deployed
            </div>
          </div>
        </div>

        <AsciiDivider />

        {/* Weekly Tip */}
        {tip && (
          <div className="my-6">
            <TerminalBox title={`WEEKLY RISK TIP - LEVEL ${tip?.level ?? 1}`}>
              <div className="flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-terminal-amber flex-shrink-0" />
                <div>
                  <h3 className="text-terminal-amber font-bold mb-2">
                    {tip?.title ?? 'Tip'}
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {tip?.content ?? ''}
                  </p>
                  <p className="text-xs text-terminal-dim mt-3">
                    Tip #{tip?.tipNumber ?? 1} of 21 • Level {tip?.level ?? 1}
                  </p>
                </div>
              </div>
            </TerminalBox>
          </div>
        )}

        {/* Quick Bot Summary */}
        <div className="my-6">
          <TerminalBox title="BOT SUMMARY">
            {(bots?.length ?? 0) === 0 ? (
              <p className="text-terminal-dim">No active bots found.</p>
            ) : (
              <div className="space-y-2">
                {(bots ?? [])?.slice?.(0, 5)?.map?.((bot) => (
                  <div
                    key={bot?.id ?? ''}
                    className="flex items-center justify-between p-2 border border-terminal-dim hover:border-terminal-green cursor-pointer"
                    onClick={() => router?.push?.(`/bots/${bot?.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`status-${bot?.status ?? 'active'}`}>●</span>
                      <span className="font-bold">{bot?.pair ?? ''}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-terminal-dim">${bot?.currentPrice?.toFixed?.(2) ?? ''}</span>
                      <span className={bot?.realizedPnl >= 0 ? 'text-positive' : 'text-negative'}>
                        {bot?.realizedPnl >= 0 ? '+' : ''}{bot?.realizedPnl?.toFixed?.(2) ?? ''}
                      </span>
                      <span className="text-terminal-dim">{bot?.roi?.toFixed?.(2) ?? ''}% ROI</span>
                    </div>
                  </div>
                ))}
                {(bots?.length ?? 0) > 5 && (
                  <p className="text-xs text-terminal-dim text-center mt-2">
                    + {(bots?.length ?? 0) - 5} more bots
                  </p>
                )}
              </div>
            )}
          </TerminalBox>
        </div>
      </main>
    </div>
  );
}
