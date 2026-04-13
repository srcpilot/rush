import type { Metadata } from 'vinext';
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rush — Fast File Sharing",
  description: "Share files instantly with Rush",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0a] text-[#fafaf5] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
