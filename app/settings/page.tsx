'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import {
  TerminalBox,
  TerminalButton,
  TerminalInput,
  TerminalSelect,
  LoadingSpinner,
  AsciiDivider,
} from '@/components/terminal-box';
import {
  Key,
  Shield,
  Settings,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Lightbulb,
  RefreshCw,
  User,
  Monitor,
  Twitter,
  Youtube,
  Send,
} from 'lucide-react';

interface SettingsData {
  tipLevel: number;
  refreshRate: number;
  theme: string;
  hasApiKeys: boolean;
  maskedApiKey: string;
  demoMode: boolean;
  displayName: string;
  bio: string;
  socialTwitter: string;
  socialYoutube: string;
  socialTelegram: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  const [settings, setSettings] = useState<SettingsData>({
    tipLevel: 1,
    refreshRate: 60,
    theme: 'green',
    hasApiKeys: false,
    maskedApiKey: '',
    demoMode: true,
    displayName: '',
    bio: '',
    socialTwitter: '',
    socialYoutube: '',
    socialTelegram: '',
  });
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showApiSetup, setShowApiSetup] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router?.replace?.('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response?.json?.();
      setSettings(data ?? {});
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipLevel: settings?.tipLevel,
          refreshRate: settings?.refreshRate,
          theme: settings?.theme,
          demoMode: settings?.demoMode,
        }),
      });

      if (response?.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setMessage(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: settings?.displayName,
          bio: settings?.bio,
          socialTwitter: settings?.socialTwitter,
          socialYoutube: settings?.socialYoutube,
          socialTelegram: settings?.socialTelegram,
        }),
      });

      if (response?.ok) {
        setMessage({ type: 'success', text: 'Profile saved successfully.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save profile.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveApiKeys = async () => {
    if (!apiKey || !apiSecret) {
      setMessage({ type: 'error', text: 'Both API Key and Secret are required.' });
      return;
    }
    
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret }),
      });

      if (response?.ok) {
        setMessage({ type: 'success', text: 'API keys saved and encrypted.' });
        setApiKey('');
        setApiSecret('');
        fetchSettings();
      } else {
        setMessage({ type: 'error', text: 'Failed to save API keys.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKeys = async () => {
    if (!confirm('Are you sure you want to delete your API keys?')) return;
    
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/settings', { method: 'DELETE' });

      if (response?.ok) {
        setMessage({ type: 'success', text: 'API keys deleted.' });
        fetchSettings();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete API keys.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-60px)]">
          <LoadingSpinner text="Loading settings..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span className="text-terminal-dim">[</span>
            SETTINGS
            <span className="text-terminal-dim">]</span>
          </h1>
          <p className="text-sm text-terminal-dim">
            Configure API keys, preferences, and display options
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 mb-6 border ${
            message?.type === 'success'
              ? 'border-green-500 text-green-500'
              : 'border-red-500 text-red-500'
          }`}>
            {message?.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{message?.text ?? ''}</span>
          </div>
        )}

        <AsciiDivider />

        {/* API Key Section */}
        <div className="my-6">
          <TerminalBox title="PHEMEX API CONFIGURATION">
            {settings?.hasApiKeys ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-500">
                  <Shield className="w-5 h-5" />
                  <span>API Keys Configured</span>
                </div>
                <div className="text-sm">
                  <span className="text-terminal-dim">API Key: </span>
                  <span className="font-mono">{settings?.maskedApiKey ?? '********'}</span>
                </div>
                <div className="flex gap-4">
                  <TerminalButton
                    onClick={() => setShowApiSetup(true)}
                    className="flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    UPDATE KEYS
                  </TerminalButton>
                  <TerminalButton
                    onClick={handleDeleteApiKeys}
                    variant="danger"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    DELETE KEYS
                  </TerminalButton>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-terminal-amber">
                  <AlertTriangle className="w-5 h-5" />
                  <span>No API Keys Configured - Running in Demo Mode</span>
                </div>
                <TerminalButton
                  onClick={() => setShowApiSetup(true)}
                  className="flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  SETUP API KEYS
                </TerminalButton>
              </div>
            )}
          </TerminalBox>
        </div>

        {/* API Setup Guide */}
        {showApiSetup && (
          <div className="my-6">
            <TerminalBox title="API KEY SETUP GUIDE">
              <div className="space-y-6">
                {/* What are API keys */}
                <div>
                  <h3 className="text-terminal-amber font-bold mb-2">What are API keys?</h3>
                  <p className="text-sm text-terminal-dim">
                    API keys are credentials that allow this application to securely access your Phemex account data.
                    They act like a password but can be limited to read-only access.
                  </p>
                </div>

                {/* Why we need them */}
                <div>
                  <h3 className="text-terminal-amber font-bold mb-2">Why do we need them?</h3>
                  <p className="text-sm text-terminal-dim">
                    To display your grid bot data, we need read-only access to view your positions, orders, and trade history.
                    We never request trading or withdrawal permissions.
                  </p>
                </div>

                {/* Setup steps */}
                <div>
                  <h3 className="text-terminal-amber font-bold mb-2">How to create a Phemex API key:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Log in to Phemex at <a href="https://phemex.com" target="_blank" rel="noopener noreferrer" className="text-terminal-green underline inline-flex items-center gap-1">phemex.com <ExternalLink className="w-3 h-3" /></a></li>
                    <li>Click your profile icon (top right) → <strong>"API Management"</strong></li>
                    <li>Click <strong>"Create New API Key"</strong></li>
                    <li>Select <strong>"Default API entry"</strong> → Click <strong>"Next"</strong></li>
                    <li>Name: <span className="text-terminal-green">"TrewMonitor"</span></li>
                    <li>IP Address: <span className="text-terminal-dim">Leave blank</span></li>
                    <li>Permissions: Select <strong className="text-terminal-green">"Read-only" ONLY</strong></li>
                    <li>Click <strong>"Confirm"</strong> and complete verification</li>
                    <li>Copy API Key and Secret immediately (shown only once!)</li>
                  </ol>
                </div>

                {/* Security principles */}
                <div className="p-4 border border-terminal-amber">
                  <h3 className="text-terminal-amber font-bold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Principles
                  </h3>
                  <ul className="text-sm space-y-1 text-terminal-dim">
                    <li>• Never share your secret key with anyone</li>
                    <li>• Read-only means NO trading or withdrawal access</li>
                    <li>• You can revoke access anytime in Phemex API Management</li>
                    <li>• Your keys are AES-256 encrypted before storage</li>
                  </ul>
                </div>

                {/* Input fields */}
                <div className="space-y-4 pt-4 border-t border-terminal-dim">
                  <div>
                    <label className="text-sm text-terminal-dim block mb-2">API KEY</label>
                    <TerminalInput
                      type="text"
                      value={apiKey}
                      onChange={setApiKey}
                      placeholder="Enter your Phemex API Key"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-terminal-dim block mb-2">API SECRET</label>
                    <TerminalInput
                      type="password"
                      value={apiSecret}
                      onChange={setApiSecret}
                      placeholder="Enter your Phemex API Secret"
                    />
                  </div>
                  <div className="flex gap-4">
                    <TerminalButton
                      onClick={handleSaveApiKeys}
                      disabled={saving || !apiKey || !apiSecret}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'SAVING...' : 'SAVE API KEYS'}
                    </TerminalButton>
                    <TerminalButton
                      onClick={() => setShowApiSetup(false)}
                      variant="danger"
                    >
                      CANCEL
                    </TerminalButton>
                  </div>
                </div>
              </div>
            </TerminalBox>
          </div>
        )}

        <AsciiDivider />

        {/* Preferences */}
        <div className="my-6">
          <TerminalBox title="PREFERENCES">
            <div className="space-y-6">
              {/* Demo Mode Toggle */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="w-4 h-4 text-terminal-amber" />
                    <span className="font-bold">Demo Mode</span>
                  </div>
                  <p className="text-xs text-terminal-dim">
                    When enabled, shows sample bot data for testing. Disable to use live API data.
                  </p>
                </div>
                <button
                  onClick={() => setSettings((s) => ({ ...(s ?? {}), demoMode: !s?.demoMode }))}
                  className={`px-4 py-2 border font-mono text-sm font-bold transition-colors ${
                    settings?.demoMode
                      ? 'border-terminal-green bg-terminal-green text-black'
                      : 'border-terminal-dim text-terminal-dim hover:border-terminal-green hover:text-terminal-green'
                  }`}
                  style={settings?.demoMode ? { color: '#000000', backgroundColor: '#00FF00' } : {}}
                >
                  {settings?.demoMode ? '[ ON ]' : '[ OFF ]'}
                </button>
              </div>

              {/* Tip Level */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-terminal-amber" />
                    <span className="font-bold">Risk Tip Level</span>
                  </div>
                  <p className="text-xs text-terminal-dim">Select difficulty level for weekly tips on Dashboard</p>
                </div>
                <TerminalSelect
                  value={settings?.tipLevel ?? 1}
                  onChange={(val) => setSettings((s) => ({ ...(s ?? {}), tipLevel: parseInt(val, 10) }))}
                  options={[
                    { value: 1, label: 'Level 1 - Beginner' },
                    { value: 2, label: 'Level 2 - Intermediate' },
                    { value: 3, label: 'Level 3 - Advanced' },
                  ]}
                />
              </div>

              {/* Refresh Rate */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshCw className="w-4 h-4" />
                    <span className="font-bold">Auto-Refresh Rate</span>
                  </div>
                  <p className="text-xs text-terminal-dim">How often to fetch updated bot data</p>
                </div>
                <TerminalSelect
                  value={settings?.refreshRate ?? 60}
                  onChange={(val) => setSettings((s) => ({ ...(s ?? {}), refreshRate: parseInt(val, 10) }))}
                  options={[
                    { value: 30, label: '30 seconds' },
                    { value: 60, label: '60 seconds' },
                    { value: 120, label: '2 minutes' },
                    { value: 300, label: '5 minutes' },
                  ]}
                />
              </div>

              {/* Save Button */}
              <TerminalButton
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
              </TerminalButton>
            </div>
          </TerminalBox>
        </div>

        <AsciiDivider />

        {/* Profile Section */}
        <div className="my-6">
          <TerminalBox title="PROFILE">
            <div className="space-y-6">
              <p className="text-sm text-terminal-dim">
                Your profile information will be displayed on shareable bot links in future updates.
              </p>

              {/* Display Name */}
              <div>
                <label className="text-sm text-terminal-dim flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Display Name
                </label>
                <TerminalInput
                  type="text"
                  value={settings?.displayName ?? ''}
                  onChange={(val) => setSettings((s) => ({ ...(s ?? {}), displayName: val }))}
                  placeholder="Your trading alias or name"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm text-terminal-dim mb-2 block">Bio / Description</label>
                <textarea
                  value={settings?.bio ?? ''}
                  onChange={(e) => setSettings((s) => ({ ...(s ?? {}), bio: e?.target?.value ?? '' }))}
                  placeholder="Tell others about your trading style, experience, or philosophy..."
                  className="w-full p-3 bg-black border border-terminal-dim text-terminal-green font-mono text-sm focus:border-terminal-green focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <label className="text-sm text-terminal-dim block">Social Links (optional)</label>
                
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-terminal-dim shrink-0" />
                  <TerminalInput
                    type="text"
                    value={settings?.socialTwitter ?? ''}
                    onChange={(val) => setSettings((s) => ({ ...(s ?? {}), socialTwitter: val }))}
                    placeholder="Twitter/X username (e.g., @yourusername)"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-terminal-dim shrink-0" />
                  <TerminalInput
                    type="text"
                    value={settings?.socialYoutube ?? ''}
                    onChange={(val) => setSettings((s) => ({ ...(s ?? {}), socialYoutube: val }))}
                    placeholder="YouTube channel URL"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-terminal-dim shrink-0" />
                  <TerminalInput
                    type="text"
                    value={settings?.socialTelegram ?? ''}
                    onChange={(val) => setSettings((s) => ({ ...(s ?? {}), socialTelegram: val }))}
                    placeholder="Telegram username (e.g., @yourusername)"
                  />
                </div>
              </div>

              {/* Save Profile Button */}
              <TerminalButton
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? 'SAVING...' : 'SAVE PROFILE'}
              </TerminalButton>
            </div>
          </TerminalBox>
        </div>
      </main>
    </div>
  );
}
