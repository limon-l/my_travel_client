import { loadTours } from "@/lib/catalogue";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const revalidate = 3600;

export default async function sitemap() {
  const staticEntries = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/tours`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/register`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const { data: tours } = await loadTours();
  const tourEntries = tours
    .filter((tour) => tour?._id)
    .map((tour) => ({
      url: `${siteUrl}/tours/${tour._id}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticEntries, ...tourEntries];
}
