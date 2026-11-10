import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "SHS DePIN Network",
  description: "Decentralized Energy Infrastructure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-950 text-gray-100">
        <Providers>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
