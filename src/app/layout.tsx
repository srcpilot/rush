import "@/app/globals.css";
import { Providers } from "@/components/providers";

interface Metadata {
  title: string;
  description?: string;
}

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
      <body className="bg-[#0a0a0a] text-[#fafaf5] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
