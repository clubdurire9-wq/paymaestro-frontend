import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PayMaestro',
  description: 'PayPal vers Mobile Money en Afrique',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
