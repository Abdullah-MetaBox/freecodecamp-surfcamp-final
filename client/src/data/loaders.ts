import qs from "qs";
import { fetchAPI } from "@/utils/fetch-api";
import { getStrapiURL } from "@/utils/get-strapi-url";

const BASE_URL = getStrapiURL();
const BLOG_PAGE_SIZE = 3;
const homePageQuery = qs.stringify(
    {
        populate: {
            blocks: {
                on: {
                    "blocks.hero-section": {
                        populate: {
                            image: {
                                fields: ["url", "alternativeText"],
                            },
                            logo: {
                                populate: {
                                    image: {
                                        fields: ["url", "alternativeText"],
                                    },
                                },
                            },
                            cta: true,
                        },
                    },
                    "blocks.info-block": {
                        populate: {
                            image: {
                                fields: ["url", "alternativeText"],
                            },
                            cta: true,
                        },
                    },
                },
            },
        },
    },
);

export async function getHomePage() {
    const path = "/api/home-page";
    const BASE_URL = getStrapiURL();

    const url = new URL(path, BASE_URL);

    url.search = homePageQuery;

    return await fetchAPI(url.href, { method: "GET" });
}

const pageBySlugQuery = (slug: string) => qs.stringify(
    {
        filters: {
            slug: {
                $eq: slug,
            },
        },
        populate: {
            blocks: {
                on: {
                    "blocks.hero-section": {
                        populate: {
                            image: {
                                fields: ["url", "alternativeText"],
                            },
                            logo: {
                                populate: {
                                    image: {
                                        fields: ["url", "alternativeText"],
                                    },
                                },
                            },
                            cta: true,
                        },
                    },
                    "blocks.info-block": {
                        populate: {
                            image: {
                                fields: ["url", "alternativeText"],
                            },
                            cta: true,
                        },
                    },
                    "blocks.featured-article": {
                        populate: {
                            image: {
                                fields: ["url", "alternativeText"],
                            },
                            link: true,
                        },
                    },
                    "blocks.subscribe": {
                        populate: true,
                    },
                },
            },
        },
    },
);

export async function getPageBySlug(slug: string) {
    const path = "/api/pages";
    const BASE_URL = getStrapiURL();

    const url = new URL(path, BASE_URL);

    url.search = pageBySlugQuery(slug);

    return await fetchAPI(url.href, { method: "GET" });
}

const globalSettingQuery = qs.stringify({
    populate: {
        header: {
            populate: {
                logo: {
                    populate: {
                        image: {
                            fields: ["url", "alternativeText"],
                        },
                    },
                },
                navigation: true,
                cta: true,
            },
        },

        footer: {
            populate: {
                logo: {
                    populate: {
                        image: {
                            fields: ["url", "alternativeText"],
                        },
                    },
                },
                navigation: true,
                policies: true,
            },
        },
    },
});

export async function getGlobalSettings() {
    const path = "/api/global";
    const BASE_URL = getStrapiURL();

    const url = new URL(path, BASE_URL);

    url.search = globalSettingQuery;

    return await fetchAPI(url.href, { method: "GET" });
}

export async function getContent(path: string, featured?: boolean, query?: string, page?: string) {
    const url = new URL(path, BASE_URL);

    url.search = qs.stringify({
        sort: ["createdAt:desc"],
        filters: {
            $or: [
                {title: { $containsi: query } },
                {description: { $containsi: query } },
            ],
            ...(featured && { featured: { $eq: true } }),
        },
        pagination: {
            pageSize: BLOG_PAGE_SIZE,
            page: parseInt(page || "1"),
        },
        populate: {
            image: {
                fields: ["url", "alternativeText"],
            },
        },
    });

    return await fetchAPI(url.href, { method: "GET" });
}

const blogPopulate = {
    blocks: {
        on: {
            "blocks.hero-section": {
                populate: {
                    image: {
                        fields: ["url", "alternativeText"],
                    },
                    logo: {
                        populate: {
                            image: {
                                fields: ["url", "alternativeText"],
                            },
                        },
                    },
                    cta: true,
                },
            },
            "blocks.info-block": {
                populate: {
                    image: {
                        fields: ["url", "alternativeText"],
                    },
                    cta: true,
                },
            },
            "blocks.featured-article": {
                populate: {
                    image: {
                        fields: ["url", "alternativeText"],
                    },
                    link: true,
                },
            },
            "blocks.subscribe": {
                populate: true,
            },
            "blocks.heading": {
                populate: true,
            },
            "blocks.paragraph-with-image": {
                populate: {
                    image: {
                        fields: ["url", "alternativeText"],
                    },
                },
            },
            "blocks.paragraph": {
                populate: true,
            },
            "blocks.full-image": {
                populate: {
                    image: {
                        fields: ["url", "alternativeText"],
                    },
                },
            },
        },
    },
};

export async function getContentBySlug(slug: string, path: string) {
    const url = new URL(path, BASE_URL);
    url.search = qs.stringify({
        filters: {
            slug: {
                $eq: slug,
            },
        },
        populate: {
            image: {
                fields: ["url", "alternativeText"],
            },
            ...blogPopulate,
        },
    });
    return fetchAPI(url.href, { method: "GET" });
}

// SEO

export async function getGlobalData() {
  const query = qs.stringify(
    {
      populate: {
        favicon: { fields: ["url"] },
        defaultSeo: {
          populate: {
            metaImage: { fields: ["url"] },
          },
        },
      },
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${getStrapiURL()}/api/global?${query}`, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    next: { revalidate: 60 }, // ISR caching
  });

  const json = await res.json();
  const attributes = json.data?.attributes;

  return {
    siteName: attributes?.siteName || "My Website",
    favicon: attributes?.favicon?.data?.attributes?.url || "",
    seo: {
      metaTitle: attributes?.defaultSeo?.metaTitle || "",
      metaDescription: attributes?.defaultSeo?.metaDescription || "",
      metaImage: attributes?.defaultSeo?.metaImage?.data?.attributes?.url || "",
    },
  };
}