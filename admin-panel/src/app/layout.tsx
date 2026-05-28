import type { Metadata } from 'next';
import './globals.css';
import RootLayoutShell from './RootLayoutShell';

export const metadata: Metadata = {
  title: 'LVPrimeX Admin Terminal',
  description: 'Institutional AI Fintech Operations Control Center',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="h-full bg-[#03050C] text-[#F4F4F6] overflow-hidden">
        <RootLayoutShell>{children}</RootLayoutShell>
      </body>
    </html>
  );
}
