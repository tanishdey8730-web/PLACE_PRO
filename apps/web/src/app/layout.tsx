import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PlacePro AI — Crack Your Dream Job",
  description:
    "AI-powered placement preparation: coding, aptitude, interviews, resume building, and career development.",
  keywords: ["placement", "coding", "aptitude", "interviews", "DSA", "campus hiring"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
