import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NewlyNest - Smart Home Setup & Budget Tracker',
  description:
    'Interactive NewlyNest Home Budget Planner with real-time partner sync, dynamic variance calculations, inline editing, and cloud persistence.',
  keywords: [
    'NewlyNest',
    'NewlyNest Budget',
    'Home Appliance Planner',
    'Room Checklist',
    'Budget Tracker',
    'Couple Budgeting App',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
