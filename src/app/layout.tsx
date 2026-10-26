import type { Metadata } from "next";
import "./globals.css";
import "@/styles/webengine.css";
import SecurityGuard from "@/components/SecurityGuard";
import Header from "@/components/Header";
import { LanguageProvider } from "@/lib/i18n";
import { fontBody, fontDisplay } from "./fonts";

import { getSiteConfig } from '@/lib/config';

const config = getSiteConfig();

export const metadata: Metadata = {
  title: `MU Việt Nam SS1 | MU Online - ${config.nameGame}`,
  description: config.metaDescription,
  keywords: config.metaKeywords,
  authors: [{ name: `${config.nameGame} Team` }],
  creator: config.nameGame,
  publisher: config.nameGame,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(config.websiteUrl),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: `MU Việt Nam SS1 | MU Online - ${config.nameGame}`,
    description: config.metaDescription,
    url: config.websiteUrl,
    siteName: config.websiteName,
    images: [
      {
        url: '/MUHANOI1.PNG',
        width: 3280,
        height: 1844,
        alt: `${config.nameGame} - ${config.gameTitle} - Hệ thống PvP và chiến đấu`,
      },
      {
        url: '/NAME.PNG',
        width: 1200,
        height: 630,
        alt: `${config.nameGame} - ${config.gameTitle} - Logo chính thức`,
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `MU Việt Nam SS1 | MU Online - ${config.nameGame}`,
    description: config.metaDescription,
    images: ['/MUHANOI1.PNG', '/NAME.PNG'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  appleWebApp: {
    title: 'MU',
    statusBarStyle: 'default',
    capable: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#cc0000',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#cc0000" />
        <meta name="msapplication-TileColor" content="#cc0000" />
        <meta name="msapplication-TileImage" content="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={config.nameGame} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: config.websiteName,
              url: config.websiteUrl,
              description: config.metaDescription,
              inLanguage: 'vi-VN',
              keywords: config.metaKeywords.join(', '),
              alternateName: [
                'MU Việt Nam',
                'MU Online',
                'MU SS1',
                'MU Hà Nội SS1',
                'MU mới ra',
                'MU test',
                'MU đông người chơi',
                config.websiteName,
              ],
            }),
          }}
        />

        {/* Không dùng Service Worker — gỡ hết SW cũ để tránh cache gây giao diện cũ */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(s){s.unregister();});});}`,
          }}
        />
      </head>
      <body
        className={`${fontBody.variable} ${fontDisplay.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <SecurityGuard />
          <Header />
          <main className="we-site-canvas">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
