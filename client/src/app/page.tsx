import { BlockRenderer } from "@/components/BlockRender";
import { ContentList } from "@/components/ContentList";
import { getGlobalData, getHomePage, getPageBySlug } from "@/data/loaders";
import { notFound } from "next/navigation";
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

async function loader() {
  const data = await getHomePage();
  if (!data) notFound();
  console.log(data);
  return {...data.data};
}

export default async function HomeRoute() {
  const data = await loader();
  const blocks = data?.blocks || [];
  return <div><BlockRenderer blocks={blocks} />
    <div className="container">
      <ContentList
        headline="Featured Articles"
        path="/api/articles"
        component={BlogCard}
        headlineAlignment="center"
        featured
      />
    </div>
  </div>;
}
