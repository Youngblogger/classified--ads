import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'], display: 'swap', weight: ['400', '500', '600', '700', '800'] });
const poppins = Poppins({ subsets: ['latin'], display: 'swap', weight: ['400', '500', '600', '700', '800'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body style={{ fontFamily: inter.style.fontFamily, margin: 0, padding: 0 }}>
        <ClientLayout fontFamily={inter.style.fontFamily}>{children}</ClientLayout>
      </body>
    </html>
  );
}
