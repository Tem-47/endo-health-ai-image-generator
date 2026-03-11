import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Endo Health AI Generator',
  description: 'KI Bildgenerator für Endo Health Blogbeiträge',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="de">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
