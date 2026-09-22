import { Metadata } from "next";

interface SeoProps {
    title: string;
    description?: string;
    image?: string;
    path: string;
}

export function constructMetadata({
    title,
    description = "متجر MJM - وجهتك الأولى للمنظفات، المياه، الكراتين، ومستلزمات الضيافة بجودة عالية وأسعار منافسة.",
    image = "/og-image.jpg",
    path,
}: SeoProps): Metadata {
    const url = `https://mjm-store.com${path}`;

    return {
        title: {
            default: `${title} | متجر MJM`,
            template: `%s | متجر MJM`,
        },
        description,
        openGraph: {
            title: `${title} | متجر MJM`,
            description,
            url,
            siteName: "متجر MJM",
            images: [{ url: image }],
            locale: "ar_SA",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | متجر MJM`,
            description,
            images: [image],
            creator: "@mjm_store",
        },
        alternates: {
            canonical: url,
        },
        category: "ecommerce",
    };
}

export function generateSchema(type: "Product" | "Organization" | "WebSite", data: Record<string, unknown>) {
    return {
        __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": type,
            ...data,
        }),
    };
}
