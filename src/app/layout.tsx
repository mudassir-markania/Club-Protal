import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'APL Season 9 | House Championship Portal',
  description: 'Centralized management portal for APL Season 9 House Championship: clubs, cricket teams, sports, referees, and leaderboards.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
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
