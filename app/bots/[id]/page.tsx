'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { TerminalBox, TerminalButton, LoadingSpinner, AsciiDivider } from '@/components/terminal-box';
import { BotChart } from '@/components/bot-chart';
import {
  ArrowLeft,
  BarChart3,
  Hash,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Grid,
  Percent,
  Activity,
  Coins,
  Share2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { BotData } from '@/lib/phemex-api';

type ViewMode = 'numbers' | 'graphics';

export default function BotDetailPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const botId = params?.id as string;

  const [bot, setBot] = useState<BotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('numbers');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router?.replace?.('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && botId) {
      fetchBot();
    }
  }, [status, botId]);

  const fetchBot = async () => {
    try {
      const response = await fetch('/api/bots');
      const data = await response?.json?.();
      const foundBot = (data?.bots ?? [])?.find?.((b: BotData) => b?.id === botId);
      setBot(foundBot ?? null);
    } catch (error) {
      console.error('Failed to fetch bot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBot();
    setRefreshing(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
    setCopied(false);
  };

  const copyShareLink = () => {
    const link = bot?.shareLink ?? `https://phemex.com/trading-bots/share?id=${botId}`;
    navigator?.clipboard?.writeText?.(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-60px)]">
          <LoadingSpinner text="Loading bot details..." />
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="max-w-6xl mx-auto p-4">
          <TerminalBox title="ERROR">
            <p className="text-red-500">Bot not found.</p>
            <TerminalButton onClick={() => router?.push?.('/bots')} className="mt-4">
              <ArrowLeft className="w-4 h-4" /> BACK TO LIST
            </TerminalButton>
          </TerminalBox>
        </main>
      </div>
    );
  }

  const totalPnl = (bot?.realizedPnl ?? 0) + (bot?.unrealizedPnl ?? 0);

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="max-w-6xl mx-auto p-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-terminal-dim mb-4">
          <button
            onClick={() => router?.push?.('/bots')}
            className="flex items-center gap-1 hover:text-terminal-green"
          >
            <ArrowLeft className="w-4 h-4" />
            BOT LIST
          </button>
          <span>/</span>
          <span className="text-terminal-green">{bot?.pair ?? ''}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-wider flex items-center gap-3">
              <span className={`status-${bot?.status ?? 'active'}`}>●</span>
              {bot?.pair ?? ''}
            </h1>
            <p className="text-sm text-terminal-dim capitalize">
              {bot?.gridType ?? 'arithmetic'} grid • {bot?.gridCount ?? 0} levels • {bot?.status ?? 'active'}
            </p>
          </div>
          
          {/* View Toggle and Share */}
          <div className="flex gap-2 flex-wrap">
            <TerminalButton
              onClick={() => setViewMode('numbers')}
              className={viewMode === 'numbers' ? 'bg-terminal-green !text-black hover:bg-terminal-green' : ''}
            >
              <Hash className="w-4 h-4" />
              NUMBERS
            </TerminalButton>
            <TerminalButton
              onClick={() => setViewMode('graphics')}
              className={viewMode === 'graphics' ? 'bg-terminal-green !text-black hover:bg-terminal-green' : ''}
            >
              <BarChart3 className="w-4 h-4" />
              GRAPHICS
            </TerminalButton>
            <TerminalButton
              onClick={handleShare}
              className="border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:!text-black"
            >
              <Share2 className="w-4 h-4" />
              SHARE
            </TerminalButton>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="border-2 border-terminal-amber bg-black p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-terminal-amber flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  SHARE BOT
                </h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-terminal-dim hover:text-terminal-green text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-terminal-dim block mb-2">Bot: {bot?.pair ?? ''}</label>
                  <div className="p-3 border border-terminal-dim bg-black/50 text-sm break-all font-mono">
                    {bot?.shareLink ?? `https://phemex.com/trading-bots/share?id=${botId}`}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <TerminalButton onClick={copyShareLink} className="flex-1">
                    {copied ? '✓ COPIED!' : 'COPY LINK'}
                  </TerminalButton>
                  <TerminalButton
                    onClick={() => window?.open?.(bot?.shareLink ?? `https://phemex.com/trading-bots/share?id=${botId}`, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    OPEN
                  </TerminalButton>
                </div>
                
                <p className="text-xs text-terminal-dim">
                  Share this link to let others copy your grid bot strategy on Phemex.
                  You earn a small referral revenue when they copy your bot!
                </p>
              </div>
            </div>
          </div>
        )}

        <AsciiDivider />

        {viewMode === 'numbers' ? (
          /* NUMBERS VIEW */
          <div className="mt-6 space-y-6">
            {/* Price & Range Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TerminalBox title="CURRENT PRICE">
                <div className="text-3xl font-bold text-terminal-bright">
                  ${bot?.currentPrice?.toLocaleString?.(undefined, { minimumFractionDigits: 2 }) ?? ''}
                </div>
              </TerminalBox>
              <TerminalBox title="GRID RANGE">
                <div className="flex items-center gap-2">
                  <Grid className="w-5 h-5 text-terminal-dim" />
                  <div className="space-y-1">
                    <div className="text-sm"><span className="text-terminal-dim">Upper:</span> <span className="text-red-400">${bot?.upperLimit?.toLocaleString?.() ?? ''}</span></div>
                    <div className="text-sm"><span className="text-terminal-dim">Entry:</span> <span className="text-terminal-amber">${(bot as any)?.entryPrice?.toLocaleString?.() ?? 'N/A'}</span></div>
                    <div className="text-sm"><span className="text-terminal-dim">Lower:</span> <span className="text-green-400">${bot?.lowerLimit?.toLocaleString?.() ?? ''}</span></div>
                  </div>
                </div>
              </TerminalBox>
              <TerminalBox title="GRID CONFIG">
                <div className="space-y-1 text-sm">
                  <div><span className="text-terminal-dim">Type:</span> {bot?.gridType ?? ''}</div>
                  <div><span className="text-terminal-dim">Grids:</span> {bot?.gridCount ?? 0}</div>
                </div>
              </TerminalBox>
            </div>

            {/* P&L Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TerminalBox title="TOTAL P&L">
                <div className={`text-2xl font-bold flex items-center gap-2 ${totalPnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  ${totalPnl?.toFixed?.(2) ?? ''}
                </div>
              </TerminalBox>
              <TerminalBox title="REALIZED P&L">
                <div className={`text-xl font-bold ${(bot?.realizedPnl ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                  ${bot?.realizedPnl?.toFixed?.(2) ?? ''}
                </div>
                <div className="text-xs text-terminal-dim">Completed trades</div>
              </TerminalBox>
              <TerminalBox title="UNREALIZED P&L">
                <div className={`text-xl font-bold ${(bot?.unrealizedPnl ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                  ${bot?.unrealizedPnl?.toFixed?.(2) ?? ''}
                </div>
                <div className="text-xs text-terminal-dim">Open positions</div>
              </TerminalBox>
              <TerminalBox title="TOTAL FEES">
                <div className="text-xl font-bold text-terminal-amber">
                  ${bot?.totalFees?.toFixed?.(2) ?? ''}
                </div>
                <div className="text-xs text-terminal-dim">Trading fees paid</div>
              </TerminalBox>
            </div>

            {/* Performance Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TerminalBox title="ROI">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-terminal-dim" />
                  <span className={`text-2xl font-bold ${(bot?.roi ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {bot?.roi?.toFixed?.(2) ?? ''}%
                  </span>
                </div>
              </TerminalBox>
              <TerminalBox title="APR">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-terminal-dim" />
                  <span className={`text-2xl font-bold ${(bot?.apr ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {bot?.apr?.toFixed?.(1) ?? ''}%
                  </span>
                </div>
              </TerminalBox>
              <TerminalBox title="ARBITRAGES">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-terminal-amber" />
                  <span className="text-2xl font-bold">{bot?.totalArbitrages ?? 0}</span>
                </div>
                <div className="text-xs text-terminal-dim">Filled grid orders</div>
              </TerminalBox>
              <TerminalBox title="RUNTIME">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-terminal-dim" />
                  <span className="text-lg font-bold">{bot?.runtime ?? ''}</span>
                </div>
              </TerminalBox>
            </div>

            {/* Investment Section */}
            <TerminalBox title="INVESTMENT DETAILS">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <DollarSign className="w-5 h-5 text-terminal-dim mb-1" />
                  <div className="text-xl font-bold">${bot?.investment?.toLocaleString?.() ?? ''}</div>
                  <div className="text-xs text-terminal-dim">Investment Amount</div>
                </div>
                <div>
                  <div className="text-xl font-bold">${((bot?.investment ?? 0) / (bot?.gridCount ?? 1))?.toFixed?.(2) ?? ''}</div>
                  <div className="text-xs text-terminal-dim">Per Grid</div>
                </div>
                <div>
                  <div className="text-xl font-bold">${(((bot?.upperLimit ?? 0) - (bot?.lowerLimit ?? 0)) / (bot?.gridCount ?? 1))?.toFixed?.(2) ?? ''}</div>
                  <div className="text-xs text-terminal-dim">Grid Spacing</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{((bot?.realizedPnl ?? 0) / (bot?.totalArbitrages ?? 1))?.toFixed?.(2) ?? ''}$</div>
                  <div className="text-xs text-terminal-dim">Avg Profit/Arb</div>
                </div>
              </div>
            </TerminalBox>
          </div>
        ) : (
          /* GRAPHICS VIEW */
          <div className="mt-6 space-y-6">
            {/* Price Chart */}
            <TerminalBox title="PRICE MOVEMENT & GRID LEVELS">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="text-sm text-terminal-dim space-y-1">
                  <p>▸ <span className="text-green-400">Green solid line</span> = Historical price movement</p>
                  <p>▸ <span className="text-green-400">Green dashed</span> = BUY levels (below current) | <span className="text-red-400">Red dashed</span> = SELL levels (above current)</p>
                  <p>▸ <span className="text-yellow-400">$</span> symbols at top = Arbitrage events (check time axis for when)</p>
                  <p>▸ <span className="text-yellow-400">► Yellow label</span> on Y-axis = Current price</p>
                </div>
                <TerminalButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="shrink-0 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'REFRESHING...' : 'REFRESH'}
                </TerminalButton>
              </div>
              <BotChart bot={bot} />
            </TerminalBox>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="text-2xl font-bold text-terminal-bright">
                  ${bot?.currentPrice?.toFixed?.(2) ?? ''}
                </div>
                <div className="stat-label">Current Price</div>
              </div>
              <div className="stat-card">
                <div className={`text-2xl font-bold ${(bot?.realizedPnl ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                  ${bot?.realizedPnl?.toFixed?.(2) ?? ''}
                </div>
                <div className="stat-label">Realized P&L</div>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold text-terminal-amber">
                  {bot?.totalArbitrages ?? 0}
                </div>
                <div className="stat-label">Arbitrages</div>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold">
                  {bot?.runtime ?? ''}
                </div>
                <div className="stat-label">Runtime</div>
              </div>
            </div>

            {/* Recent Arbitrages */}
            <TerminalBox title="RECENT ARBITRAGES">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(bot?.arbitrages ?? [])?.slice?.(-10)?.reverse?.()?.map?.((arb, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border border-terminal-dim text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">$</span>
                      <span className="text-terminal-dim">
                        {new Date(arb?.timestamp ?? 0)?.toLocaleString?.() ?? ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>@ ${arb?.price?.toFixed?.(2) ?? ''}</span>
                      <span className="text-positive">+${arb?.profit?.toFixed?.(2) ?? ''}</span>
                    </div>
                  </div>
                ))}
                {(bot?.arbitrages?.length ?? 0) === 0 && (
                  <p className="text-terminal-dim text-center py-4">No arbitrages recorded yet.</p>
                )}
              </div>
            </TerminalBox>
          </div>
        )}
      </main>
    </div>
  );
}
