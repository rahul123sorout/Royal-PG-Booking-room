import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ClientWrapper } from '../components/ClientWrapper';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Royal PG | Luxury Room Booking & Co-Living in Noida, India',
  description: 'Experience premium co-living at Royal PG in Noida. We offer fully-furnished luxury single, double, and triple sharing rooms in Sector 62, 126, and 135. Fully managed with meals, high-speed Wi-Fi, AC, security, and laundry.',
  keywords: 'PG in Noida, Royal PG, Luxury co-living Noida, PG Noida Sector 62, PG Noida Sector 126, Room Booking Noida, Girls PG Noida, Boys PG Noida, Single Room PG Noida, Double Sharing PG Noida, Amity Noida PG',
  authors: [{ name: 'Royal PG Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Royal PG | Luxury Room Booking & Co-Living in Noida',
    description: 'Ultra-luxury PG suites in Noida, India. Experience the best co-living space with premium amenities.',
    url: 'https://royalpg.com',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Royal PG Luxury Suite',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased text-foreground bg-background">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
