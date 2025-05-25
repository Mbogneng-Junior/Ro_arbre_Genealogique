import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-100">
      <body className={`${inter.className} d-flex flex-column h-100`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
