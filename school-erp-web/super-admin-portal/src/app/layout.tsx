import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { AuthProvider } from "@/components/AuthProvider";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Super Admin | Lmno Campus",
  description: "Platform management for school administrators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
