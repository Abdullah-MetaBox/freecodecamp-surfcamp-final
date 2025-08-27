import { getPageBySlug, getGlobalData } from "@/data/loaders";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/BlockRender";
import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

async function loader(slug: string) {
    const {data} = await getPageBySlug(slug);
    if (data.length === 0) notFound();
    return { blocks: data[0]?.blocks };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [pageRes, global] = await Promise.all([
    getPageBySlug(params.slug),
    getGlobalData(),
  ]);
  const seo = pageRes?.data?.[0]?.attributes?.seo;
  return getSeoMetadata({
    pageSeo: seo,
    globalSeo: global.seo,
    favicon: global.favicon,
  });
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function DynamicPageRoute({ params }: PageProps) {
    const slug = (await params).slug;
    const { blocks } = await loader(slug);
    return <BlockRenderer blocks={blocks} />;
}