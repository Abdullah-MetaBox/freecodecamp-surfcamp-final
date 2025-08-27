import type { EventProps } from "@/types";
import { ContentList } from "@/components/ContentList";
import { Card, type CardProps } from "@/components/Card";
import { getContentBySlug, getGlobalData, getPageBySlug } from "@/data/loaders";
import { notFound } from "next/navigation";
import { EventSignupForm } from "@/components/EventsSignupForm";
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
    const { data } = await getContentBySlug(slug, "/api/events");
    const event = data[0];
    if (!event) throw notFound();
    return { event: event as EventProps, blocks: event?.blocks };
}

interface ParamsProps {
    params: Promise<{ slug: string }>
}

const EventCard = (props: Readonly<CardProps>) => (
    <Card {...props} basePath="events" />
);

export default async function SingleEventRoute({ params }: ParamsProps) {
    const slug = (await params).slug;
    const { event, blocks} = await loader(slug);

    return (
        <div className="container">
            <div className="event-page">
                <EventSignupForm 
                    blocks={blocks}
                    eventId={event.documentId}
                    startDate={event.startDate}
                    price={event.price}
                    image={{ url: event?.image?.url, alt: event?.image?.alternativeText || "Event Image" }}
                />
            </div>
            <ContentList
                headline="Featured Events"
                path="/api/events"
                component={EventCard}
                featured={true}
            />
        </div>
    );
}