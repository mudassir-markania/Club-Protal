import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApexArena | Sports Tournament Management Portal',
  description: 'Centralized management portal for sports tournaments, clubs, referees, and leaderboards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

