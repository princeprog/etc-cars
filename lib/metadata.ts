import type { Metadata } from "next";

export const APP_NAME = "ETC Cars";
export const APP_URL = "https://etc-cars.vercel.app";
export const APP_DESCRIPTION =
  "Dealership workspace for managing vehicles, leads, follow-ups, sales, expenses, reports, and team activity.";

type PageMetadataInput = {
  title: string;
  description: string;
};

export function createPageMetadata({
  title,
  description,
}: PageMetadataInput): Metadata {
  const fullTitle = `${title} | ${APP_NAME}`;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      siteName: APP_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}
