'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { TerminalBox, LoadingSpinner, AsciiDivider } from '@/components/terminal-box';
import { Activity, DollarSign, Grid, Clock, RefreshCw } from 'lucide-react';
import type { BotData } from '@/lib/phemex-api';

export default function BotsListPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router?.replace?.('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBots();
    }
  }, [status]);

  const fetchBots = async () => {
    try {
      const response = await fetch('/api/bots');
      const data = await response?.json?.();
      setBots(data?.bots ?? []);
      setIsDemo(data?.demo === true);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-60px)]">
          <LoadingSpinner text="Loading bot list..." />
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
              BOT LIST
              <span className="text-terminal-dim">]</span>
            </h1>
            <p className="text-sm text-terminal-dim">
              {bots?.length ?? 0} active grid bots
              {isDemo && <span className="demo-badge ml-2">DEMO</span>}
            </p>
          </div>
          <button
            onClick={fetchBots}
            className="flex items-center gap-2 terminal-button"
          >
            <RefreshCw className="w-4 h-4" />
            REFRESH
          </button>
        </div>

        <AsciiDivider />

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-6 gap-4 p-3 mt-4 text-xs text-terminal-dim border-b border-terminal-dim">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            PAIR
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            CURRENT PRICE
          </div>
          <div className="flex items-center gap-1">
            <Grid className="w-3 h-3" />
            GRID RANGE
          </div>
          <div>P&L</div>
          <div>ROI / APR</div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            RUNTIME
          </div>
        </div>

        {/* Bot List */}
        <div className="space-y-2 mt-2">
          {(bots?.length ?? 0) === 0 ? (
            <TerminalBox>
              <p className="text-center text-terminal-dim py-8">
                No active grid bots found.<br />
                Configure your API keys in Settings to view live data.
              </p>
            </TerminalBox>
          ) : (
            (bots ?? [])?.map?.((bot) => (
              <div
                key={bot?.id ?? ''}
                onClick={() => router?.push?.(`/bots/${bot?.id}`)}
                className="bot-row cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`status-${bot?.status ?? 'active'}`}>●</span>
                    <span className="font-bold">{bot?.pair ?? ''}</span>
                  </div>
                  <span className="text-xs text-terminal-dim capitalize md:hidden">
                    {bot?.status ?? 'active'}
                  </span>
                </div>
                <div>
                  <span className="md:hidden text-xs text-terminal-dim">Price: </span>
                  ${bot?.currentPrice?.toLocaleString?.(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? ''}
                </div>
                <div className="text-xs">
                  <span className="md:hidden text-terminal-dim">Range: </span>
                  ${bot?.lowerLimit?.toLocaleString?.() ?? ''} - ${bot?.upperLimit?.toLocaleString?.() ?? ''}
                </div>
                <div>
                  <div className={bot?.realizedPnl >= 0 ? 'text-positive' : 'text-negative'}>
                    {bot?.realizedPnl >= 0 ? '+' : ''}${bot?.realizedPnl?.toFixed?.(2) ?? ''}
                  </div>
                  <div className="text-xs text-terminal-dim">
                    Unreal: {bot?.unrealizedPnl >= 0 ? '+' : ''}${bot?.unrealizedPnl?.toFixed?.(2) ?? ''}
                  </div>
                </div>
                <div>
                  <div className={bot?.roi >= 0 ? 'text-positive' : 'text-negative'}>
                    {bot?.roi?.toFixed?.(2) ?? ''}%
                  </div>
                  <div className="text-xs text-terminal-dim">
                    APR: {bot?.apr?.toFixed?.(1) ?? ''}%
                  </div>
                </div>
                <div className="text-sm">
                  {bot?.runtime ?? ''}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
