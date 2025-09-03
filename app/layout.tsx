import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Finance Tracker Pro - Advanced Personal Finance Management',
  description: 'Professional-grade personal finance tracker with AI insights, recurring transactions, financial goals, and comprehensive analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
