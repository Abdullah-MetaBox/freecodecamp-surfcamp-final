import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../sass/main.scss";

import { getGlobalData, getGlobalSettings } from "@/data/loaders";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSeoMetadata } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function loader() {
  const { data } = await getGlobalSettings();
  if (!data) throw new Error("Failed to fetch global settings");
  return { header: data?.header, footer: data?.footer };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { header, footer } = await loader();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header data={header}/>
        {children}
        <Footer data={footer}/>
      </body>
    </html>
  );
}

// SEO: Dynamic metadata for the whole site (homepage/fallback)
export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalData();
  return getSeoMetadata({
    globalSeo: global.seo,
    favicon: global.favicon,
  });
}
