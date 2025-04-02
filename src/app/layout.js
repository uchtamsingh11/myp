import { Toaster } from 'react-hot-toast';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import SupabaseListener from '../components/auth/SupabaseListener';

// Define viewport for the application
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

// Define metadata for the application
export const metadata = {
  title: 'Algoz Trading | Automated Trading Tools',
  description: 'Professional automated trading tools and algorithms for traders',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Algoz Trading | Automated Trading Tools',
    description: 'Professional automated trading tools and algorithms for traders',
    siteName: 'Algoz Trading',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 1200,
        alt: 'Algoz Trading',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Algoz Trading | Automated Trading Tools',
    description: 'Professional automated trading tools and algorithms for traders',
    images: ['/images/logo.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <SupabaseListener />
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
