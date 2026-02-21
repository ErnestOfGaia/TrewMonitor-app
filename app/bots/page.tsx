'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { TerminalBox, LoadingSpinner, AsciiDivider } from '@/components/terminal-box';
import { Activity, DollarSign, Grid, Clock, RefreshCw, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import type { BotData } from '@/lib/phemex-api';

interface BotFormData {
  pair: string;
  upperLimit: string;
  lowerLimit: string;
  gridCount: string;
  gridType: string;
  investment: string;
  startedAt: string;
  notes: string;
  status: string;
}

const emptyForm: BotFormData = {
  pair: '',
  upperLimit: '',
  lowerLimit: '',
  gridCount: '',
  gridType: 'arithmetic',
  investment: '',
  startedAt: '',
  notes: '',
  status: 'active',
};

export default function BotsListPage() {
  const { status } = useSession() || {};
  const router = useRouter();
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BotFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
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
      const data = await response.json();
      setBots(data?.bots ?? []);
      setIsDemo(data?.demo === true);
      if (data?.message) setMessage(data.message);
    } catch (err) {
      console.error('Failed to fetch bots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bot: BotData) => {
    setEditingId(bot.id);
    setForm({
      pair: bot.displayPair ?? bot.pair,
      upperLimit: String(bot.upperLimit),
      lowerLimit: String(bot.lowerLimit),
      gridCount: String(bot.gridCount),
      gridType: bot.gridType ?? 'arithmetic',
      investment: String(bot.investment),
      startedAt: bot.startedAt
        ? new Date(bot.startedAt).toISOString().slice(0, 16)
        : '',
      notes: (bot as unknown as { notes?: string }).notes ?? '',
      status: bot.status ?? 'active',
    });
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.pair || !form.upperLimit || !form.lowerLimit || !form.gridCount || !form.investment || !form.startedAt) {
      setError('All fields except notes are required.');
      return;
    }
    if (parseFloat(form.upperLimit) <= parseFloat(form.lowerLimit)) {
      setError('Upper limit must be greater than lower limit.');
      return;
    }

    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...form } : form;

      const response = await fetch('/api/bots/manage', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.error ?? 'Failed to save bot.');
        return;
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchBots();
    } catch {
      setError('Failed to save bot. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this bot?')) return;
    setDeleting(id);
    try {
      const response = await fetch('/api/bots/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchBots();
      }
    } catch {
      console.error('Failed to delete bot');
    } finally {
      setDeleting(null);
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
              {isDemo ? 'Demo mode' : `${bots.length} grid bot${bots.length !== 1 ? 's' : ''} configured`}
              {isDemo && <span className="demo-badge ml-2">DEMO</span>}
            </p>
            {message && !isDemo && (
              <p className="text-xs text-terminal-amber mt-1">{message}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchBots} className="flex items-center gap-2 terminal-button">
              <RefreshCw className="w-4 h-4" />
              REFRESH
            </button>
            {!isDemo && (
              <button
                onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setError(''); }}
                className="flex items-center gap-2 terminal-button"
              >
                <Plus className="w-4 h-4" />
                ADD BOT
              </button>
            )}
          </div>
        </div>

        <AsciiDivider />

        {/* Add / Edit Bot Form */}
        {showForm && (
          <div className="my-6">
            <TerminalBox title={editingId ? 'EDIT BOT' : 'ADD NEW BOT'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-terminal-dim block mb-1">TRADING PAIR (e.g. BTC/USDT)</label>
                  <input
                    className="terminal-input"
                    placeholder="BTC/USDT"
                    value={form.pair}
                    onChange={(e) => setForm({ ...form, pair: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="text-xs text-terminal-dim block mb-1">STATUS</label>
                  <select
                    className="terminal-select w-full"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="stopped">Stopped</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-terminal-dim block mb-1">UPPER LIMIT</label>
                  <input
                    className="terminal-input"
                    type="number"
                    placeholder="72000"
                    value={form.upperLimit}
                    onChange={(e) => setForm({ ...form, upperLimit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-terminal-dim block mb-1">LOWER LIMIT</label>
                  <input
                    className="terminal-input"
                    type="number"
                    placeholder="62000"
                    value={form.lowerLimit}
                    onChange={(e) => setForm({ ...form, lowerLimit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-terminal-dim block mb-1">GRID COUNT</label>
                  <input
                    className="terminal-input"
                    type="number"
                    placeholder="20"
                    value={form.gridCount}
                    onChange={(e) => setForm({ ...form, gridCount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-terminal-dim block mb-1">GRID TYPE</label>
                  <select
                    className="terminal-select w-full"
                    value={form.gridType}
                    onChange={(e) => setForm({ ...form, gridType: e.target.value })}
                  >
                    <option value="arithmetic">Arithmetic</option>
                    <option value="geometric">Geometric</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-terminal-dim block mb-1">INVESTMENT (USDT)</label>
                  <input
                    className="terminal-input"
                    type="number"
                    placeholder="5000"
                    value={form.investment}
                    onChange={(e) => setForm({ ...form, investment: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-terminal-dim block mb-1">BOT STARTED AT</label>
                  <input
                    className="terminal-input"
                    type="datetime-local"
                    value={form.startedAt}
                    onChange={(e) => setForm({ ...form, startedAt: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-terminal-dim block mb-1">NOTES (optional)</label>
                  <input
                    className="terminal-input"
                    placeholder="Any notes about this bot..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <p className="text-negative text-sm mt-4">{error}</p>
              )}

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="terminal-button flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'SAVING...' : editingId ? 'UPDATE BOT' : 'ADD BOT'}
                </button>
                <button
                  onClick={handleCancel}
                  className="terminal-button flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  CANCEL
                </button>
              </div>
            </TerminalBox>
          </div>
        )}

        {/* Table Header */}
        {!isDemo && bots.length > 0 && (
          <div className="hidden md:grid grid-cols-7 gap-4 p-3 mt-4 text-xs text-terminal-dim border-b border-terminal-dim">
            <div className="flex items-center gap-1"><Activity className="w-3 h-3" />PAIR</div>
            <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" />PRICE</div>
            <div className="flex items-center gap-1"><Grid className="w-3 h-3" />RANGE</div>
            <div>P&L</div>
            <div>ROI / APR</div>
            <div className="flex items-center gap-1"><Clock className="w-3 h-3" />RUNTIME</div>
            <div>ACTIONS</div>
          </div>
        )}

        {/* Bot List */}
        <div className="space-y-2 mt-2">
          {isDemo ? (
            // Demo mode — show demo bots without edit/delete
            bots.map((bot) => (
              <div
                key={bot.id}
                onClick={() => router.push(`/bots/${bot.id}`)}
                className="bot-row cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`status-${bot.status ?? 'active'}`}>●</span>
                    <span className="font-bold">{bot.displayPair ?? bot.pair}</span>
                  </div>
                </div>
                <div>${bot.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-xs">${bot.lowerLimit?.toLocaleString()} - ${bot.upperLimit?.toLocaleString()}</div>
                <div>
                  <div className={bot.realizedPnl >= 0 ? 'text-positive' : 'text-negative'}>
                    {bot.realizedPnl >= 0 ? '+' : ''}${bot.realizedPnl?.toFixed(2)}
                  </div>
                  <div className="text-xs text-terminal-dim">
                    Unreal: {bot.unrealizedPnl >= 0 ? '+' : ''}${bot.unrealizedPnl?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={bot.roi >= 0 ? 'text-positive' : 'text-negative'}>{bot.roi?.toFixed(2)}%</div>
                  <div className="text-xs text-terminal-dim">APR: {bot.apr?.toFixed(1)}%</div>
                </div>
                <div className="text-sm">{bot.runtime}</div>
              </div>
            ))
          ) : bots.length === 0 ? (
            <TerminalBox>
              <div className="text-center py-8">
                <p className="text-terminal-dim mb-4">No bots configured yet.</p>
                <button
                  onClick={() => { setShowForm(true); setError(''); }}
                  className="terminal-button flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  ADD YOUR FIRST BOT
                </button>
              </div>
            </TerminalBox>
          ) : (
            // Live mode — show real bots with edit/delete
            bots.map((bot) => (
              <div key={bot.id} className="grid grid-cols-7 gap-4 p-4 border border-terminal-dim hover:border-terminal-green transition-colors">
                <div
                  className="cursor-pointer"
                  onClick={() => router.push(`/bots/${bot.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`status-${bot.status ?? 'active'}`}>●</span>
                    <span className="font-bold">{bot.displayPair ?? bot.pair}</span>
                  </div>
                  <span className="text-xs text-terminal-dim capitalize">{bot.status}</span>
                </div>
                <div onClick={() => router.push(`/bots/${bot.id}`)} className="cursor-pointer">
                  ${bot.currentPrice > 0
                    ? bot.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '—'}
                </div>
                <div className="text-xs" onClick={() => router.push(`/bots/${bot.id}`)} style={{ cursor: 'pointer' }}>
                  ${bot.lowerLimit?.toLocaleString()} - ${bot.upperLimit?.toLocaleString()}
                </div>
                <div onClick={() => router.push(`/bots/${bot.id}`)} className="cursor-pointer">
                  <div className={bot.realizedPnl >= 0 ? 'text-positive' : 'text-negative'}>
                    {bot.realizedPnl >= 0 ? '+' : ''}${bot.realizedPnl?.toFixed(2)}
                  </div>
                  <div className="text-xs text-terminal-dim">
                    Unreal: {bot.unrealizedPnl >= 0 ? '+' : ''}${bot.unrealizedPnl?.toFixed(2)}
                  </div>
                </div>
                <div onClick={() => router.push(`/bots/${bot.id}`)} className="cursor-pointer">
                  <div className={bot.roi >= 0 ? 'text-positive' : 'text-negative'}>{bot.roi?.toFixed(2)}%</div>
                  <div className="text-xs text-terminal-dim">APR: {bot.apr?.toFixed(1)}%</div>
                </div>
                <div className="text-sm" onClick={() => router.push(`/bots/${bot.id}`)} style={{ cursor: 'pointer' }}>
                  {bot.runtime}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(bot)}
                    className="p-1 hover:text-terminal-bright"
                    title="Edit bot"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bot.id)}
                    disabled={deleting === bot.id}
                    className="p-1 hover:text-negative"
                    title="Remove bot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
