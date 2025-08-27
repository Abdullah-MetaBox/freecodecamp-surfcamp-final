import { getGlobalData, getPageBySlug } from "@/data/loaders";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/BlockRender";
import { ContentList } from "@/components/ContentList";
import { BlogCard } from "@/components/BlogCard";
import { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

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

async function loader(slug: string) {
    const {data} = await getPageBySlug(slug);
    if (data.length === 0) notFound();
    return { blocks: data[0]?.blocks };
}

interface PageProps {
    searchParams: Promise<{ page?: string; query?: string }>;
}

export default async function BlogRoute({ searchParams }: PageProps) {
    const { page, query } = await searchParams;
    const { blocks } = await loader("blog");
    return <div className="blog-page">
        <BlockRenderer blocks={blocks} />
        <ContentList
            headline="Check Out Our Latest Articles"
            path="/api/articles"
            component={BlogCard}
            headlineAlignment="center"
            showSearch
            query={query}
            showPagination
            page={page}
        />
        </div>;
}