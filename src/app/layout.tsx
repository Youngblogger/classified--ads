import './globals.css';
import ClientLayout from './ClientLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans antialiased" style={{ margin: 0, padding: 0 }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
