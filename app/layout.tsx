import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: 'TrewMonitor',
  description: 'Monitor your Phemex grid trading bots in real-time with a retro terminal aesthetic',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'TrewMonitor',
    description: 'Monitor your Phemex grid trading bots in real-time',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className="min-h-screen bg-black text-terminal-green">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
