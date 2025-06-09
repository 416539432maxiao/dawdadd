import { defineEventHandler } from "h3";
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";
import { serverQueryContent } from "#content/server";
import { asSitemapUrl, defineSitemapEventHandler } from "#imports";

export default defineSitemapEventHandler(async (e) => {
  const contentList = (await serverQueryContent(e).find()) as ParsedContent[];

  const blogUrls = contentList
    .filter((c) => c._path.startsWith("/blog/"))
    .map((c) => {
      return asSitemapUrl({
        loc: c._path,
        lastmod: c.updatedAt || new Date().toISOString(),
      });
    });

  const docsUrls = contentList
    .filter((c) => c._path.startsWith("/docs/"))
    .map((c) => {
      return asSitemapUrl({
        loc: c._path,
        lastmod: c.updatedAt || new Date().toISOString(),
      });
    });

  return [...blogUrls, ...docsUrls];
});
