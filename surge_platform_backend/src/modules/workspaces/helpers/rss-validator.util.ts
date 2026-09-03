import { BadRequestException, Logger } from "@nestjs/common";
import Parser from "rss-parser";
import { validateUrlForSsrf } from "../../../common/helpers/ssrf-protection.util";

export interface ValidatedRssFeed {
  isValid: true;
  feedUrl: string;
  title: string;
  description: string;
  link: string;
  itemCount: number;
  latestItem: {
    title: string;
    link: string;
    pubDate?: string;
  } | null;
}

const logger = new Logger("RssValidatorUtil");

export async function validateRssFeed(
  rawUrl: string,
): Promise<ValidatedRssFeed> {
  const trimmed = rawUrl?.trim();
  if (!trimmed) {
    throw new BadRequestException("Feed URL must not be empty.");
  }

  // 1. SSRF and Protocol verification
  validateUrlForSsrf(trimmed);

  // 2. Network fetch with safe timeout
  let response: Response;
  try {
    response = await fetch(trimmed, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(7000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown network error";
    logger.warn(`Failed to fetch feed ${trimmed}: ${msg}`);
    if (msg.includes("timeout") || msg.includes("aborted")) {
      throw new BadRequestException("Connection to RSS feed URL timed out.");
    }
    throw new BadRequestException(`Could not reach RSS feed: ${msg}`);
  }

  if (!response.ok) {
    throw new BadRequestException(
      `Feed URL returned HTTP error status ${response.status} (${response.statusText}).`,
    );
  }

  const rawXml = await response.text();

  if (!rawXml.trim()) {
    throw new BadRequestException("The feed URL returned an empty response.");
  }

  // Early guard against standard HTML landing pages
  const lowerXml = rawXml.slice(0, 500).toLowerCase();
  if (
    lowerXml.includes("<!doctype html") &&
    !rawXml.includes("<rss") &&
    !rawXml.includes("<feed")
  ) {
    throw new BadRequestException(
      "The URL points to a standard HTML web page, not an RSS or Atom feed.",
    );
  }

  // 3. RSS / Atom Parsing
  const parser = new Parser({ timeout: 5000 });
  let parsed: Parser.Output<{ [key: string]: unknown }>;
  try {
    parsed = await parser.parseString(rawXml);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid XML format";
    logger.warn(`RSS XML parse failed for ${trimmed}: ${msg}`);
    throw new BadRequestException(
      "The provided URL does not contain a valid XML or RSS/Atom feed structure.",
    );
  }

  const title = (parsed.title || "").trim();
  const description = (parsed.description || "").trim();
  const items = parsed.items || [];

  if (!title && items.length === 0) {
    throw new BadRequestException(
      "The feed was parsed, but contains no channel title or feed items.",
    );
  }

  const latest = items[0];
  const latestTitle = latest?.title?.trim() || "";
  const latestLink = (
    typeof latest?.link === "string" ? latest.link : ""
  ).trim();

  return {
    isValid: true,
    feedUrl: trimmed,
    title: title || "RSS Feed",
    description,
    link: typeof parsed.link === "string" ? parsed.link : trimmed,
    itemCount: items.length,
    latestItem: latestTitle
      ? {
          title: latestTitle,
          link: latestLink,
          pubDate: latest.pubDate,
        }
      : null,
  };
}
