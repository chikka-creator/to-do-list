import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taskly — Your Personal To-Do List',
  description: 'Manage your tasks efficiently with Taskly. A beautiful, minimal to-do list app with priorities, due dates, and smart filtering.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
