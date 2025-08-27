// lib/seo.ts
import type { Metadata } from "next";
import type { StrapiSeo, GlobalData } from "@/types";
import { getStrapiURL } from "@/utils/get-strapi-url";

function getMediaUrl(media?: { data?: { attributes?: { url?: string } } }): string {
  const url = media?.data?.attributes?.url;
  if (!url) return "";
  return url.startsWith("/") ? getStrapiURL() + url : url;
}

export function getSeoMetadata({
  pageSeo,
  globalSeo,
  favicon,
}: {
  pageSeo?: StrapiSeo;
  globalSeo: StrapiSeo;
  favicon: string;
}): Metadata {
  const s = { ...globalSeo, ...pageSeo };

  return {
    title: s.metaTitle,
    description: s.metaDescription,
    keywords: s.keywords?.split(",").map((k) => k.trim()),
    robots: s.metaRobots,
    alternates: s.canonicalURL ? { canonical: s.canonicalURL } : undefined,
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      images: s.metaImage ? [getMediaUrl(s.metaImage)] : undefined,
      siteName: "",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: s.metaTitle,
      description: s.metaDescription,
      images: s.metaImage ? [getMediaUrl(s.metaImage)] : undefined,
    },
    icons: favicon ? { icon: favicon.startsWith("/") ? getStrapiURL() + favicon : favicon } : undefined,
  };
}