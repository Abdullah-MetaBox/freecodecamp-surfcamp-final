import type { ArticleProps, Block } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/utils/format-date";
import { getContentBySlug, getGlobalData, getPageBySlug } from "@/data/loaders";

import { HeroSection } from "@/components/blocks/HeroSection";
import { th } from "zod/locales";
import { BlockRenderer } from "@/components/BlockRender";
import { Card, type CardProps } from "@/components/Card";
import { ContentList } from "@/components/ContentList";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

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

async function loader(slug: string) {
    const { data } = await getContentBySlug(slug, "/api/articles");
    const article = data[0];
    if (!article) throw notFound();
    return { article: article as ArticleProps, blocks: article?.blocks };
}

interface ArticleOverviewProps {
    headline: string;
    description: string;
    tableOfContent?: { heading: string; linkId: string }[];
}

function ArticleOverview({
    headline,
    description,
    tableOfContent,
}: Readonly<ArticleOverviewProps>) {
    return (
        <div className="article-overview">
            <div className="article-overview__info">
                <h3 className="article-overview__headline">{headline}</h3>
                <p className="article-overview__description">{description}</p>
            </div>
            {tableOfContent && (
                <ul className="article-overview__contents">
                    {tableOfContent.map((item, index) => (
                        <li key={index}>
                            <Link href={`#${item.linkId}`} className="article-overview__link">
                                {index + 1}. {item.heading}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const BlogCard = (props: Readonly<CardProps>) => <Card {...props} basePath="blog" />;

export default async function SingleBlogRoute({ params }: PageProps) {
    const slug = (await params).slug;
    const { article, blocks } = await loader(slug);
    const { title, author, publishedAt, description, image } = article;

    console.dir(blocks, { depth: null });

    const tableOfContent = blocks?.filter(
        (block: Block) => block.__component === "blocks.heading"
    );

    return (
        <div>
            <HeroSection
                id={article.id}
                heading={title}
                theme="orange"
                image={image}
                author={author}
                publishedAt={formatDate(publishedAt)}
                darken={true}
            />

            <div className="container">
                <ArticleOverview headline={title} description={description} tableOfContent={tableOfContent} />
                <BlockRenderer blocks={blocks} />
                <ContentList
                    headline=" Our Featured Articles"
                    path="/api/articles"
                    component={BlogCard}
                    featured={true}
                />
            </div>
        </div>
    );
}