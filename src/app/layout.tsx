import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Minimal root layout required by Next.js for the root redirect page
export default function RootLayout({ children }: Props) {
  return children;
}
