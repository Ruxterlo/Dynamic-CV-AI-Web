import './globals.css';
import '@/styles/narrative-global.css';
import { ReactNode } from 'react';
import ChatbaseBootstrap from '@/components/ChatbaseBootstrap';
import GlobalHomeButton from '@/components/GlobalHomeButton';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChatbaseBootstrap />
        <GlobalHomeButton />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
