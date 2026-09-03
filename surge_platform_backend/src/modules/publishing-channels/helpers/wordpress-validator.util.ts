import { BadRequestException, Logger } from "@nestjs/common";
import { validateUrlForSsrf } from "../../../common/helpers/ssrf-protection.util";

export interface ValidatedWordpress {
  isValid: true;
  siteUrl: string;
  siteName: string;
  siteDescription?: string;
  user: {
    id: number;
    name: string;
    slug: string;
    roles?: string[];
  };
  canPublish: boolean;
}

const logger = new Logger("WordpressValidator");

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

export async function validateWordpressConnection(
  rawSiteUrl: string,
  rawUsername: string,
  rawAppPassword: string,
): Promise<ValidatedWordpress> {
  const cleanUrl = rawSiteUrl?.trim().replace(/\/+$/, "");
  const username = rawUsername?.trim();
  const password = rawAppPassword?.trim();

  if (!cleanUrl) {
    throw new BadRequestException("WordPress site URL is required.");
  }
  if (!username) {
    throw new BadRequestException("WordPress username is required.");
  }
  if (!password) {
    throw new BadRequestException(
      "WordPress Application Password is required.",
    );
  }

  // 1. SSRF and protocol check
  validateUrlForSsrf(cleanUrl);

  const basicToken = Buffer.from(`${username}:${password}`).toString("base64");
  const headers = {
    Authorization: `Basic ${basicToken}`,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SurgePlatform/2.0 WordPress-Connector",
    Accept: "application/json",
  };

  // 2. Validate credentials via /wp-json/wp/v2/users/me
  let userResponse: Response;
  const userEndpoint = `${cleanUrl}/wp-json/wp/v2/users/me?context=edit`;

  try {
    userResponse = await fetch(userEndpoint, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(8000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    logger.warn(`Failed to reach WordPress at ${userEndpoint}: ${msg}`);
    if (msg.includes("timeout") || msg.includes("aborted")) {
      throw new BadRequestException(
        "Connection to WordPress timed out. Please check that the URL is live and responsive.",
      );
    }
    throw new BadRequestException(`Could not connect to WordPress: ${msg}`);
  }

  if (userResponse.status === 401 || userResponse.status === 403) {
    throw new BadRequestException(
      "Invalid WordPress username or Application Password. Please verify your credentials under WordPress Admin > Users > Profile > Application Passwords.",
    );
  }

  if (userResponse.status === 404) {
    throw new BadRequestException(
      "WordPress REST API was not found at this URL (HTTP 404). Please ensure the site is running WordPress 5.6+ with the REST API enabled.",
    );
  }

  if (!userResponse.ok) {
    throw new BadRequestException(
      `WordPress server returned HTTP error status ${userResponse.status} (${userResponse.statusText}).`,
    );
  }

  let userData: Record<string, unknown>;
  try {
    userData = (await userResponse.json()) as Record<string, unknown>;
  } catch {
    throw new BadRequestException(
      "WordPress response was not valid JSON. Ensure the URL points to a standard WordPress site.",
    );
  }

  const userId = typeof userData.id === "number" ? userData.id : 0;
  const userName =
    typeof userData.name === "string" ? userData.name.trim() : username;
  const userSlug =
    typeof userData.slug === "string" ? userData.slug.trim() : username;
  const userRoles = Array.isArray(userData.roles)
    ? userData.roles.filter((r): r is string => typeof r === "string")
    : [];

  const rawCaps = userData.capabilities;
  const capabilities: Record<string, unknown> = isRecord(rawCaps)
    ? rawCaps
    : {};

  const canPublish =
    Boolean(capabilities.publish_posts) ||
    Boolean(capabilities.edit_posts) ||
    userRoles.some((r) =>
      ["administrator", "editor", "author"].includes(r.toLowerCase()),
    );

  // 3. Fetch site details from root /wp-json
  let siteName = cleanUrl.replace(/^https?:\/\//, "");
  let siteDescription = "";

  try {
    const siteResponse = await fetch(`${cleanUrl}/wp-json`, {
      method: "GET",
      headers: {
        "User-Agent": headers["User-Agent"],
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (siteResponse.ok) {
      const siteData = (await siteResponse.json()) as Record<string, unknown>;
      if (typeof siteData.name === "string" && siteData.name.trim()) {
        siteName = siteData.name.trim();
      }
      if (typeof siteData.description === "string") {
        siteDescription = siteData.description.trim();
      }
    }
  } catch {
    // Fall back to hostname if root discovery fails
  }

  return {
    isValid: true,
    siteUrl: cleanUrl,
    siteName,
    siteDescription: siteDescription || undefined,
    user: {
      id: userId,
      name: userName,
      slug: userSlug,
      roles: userRoles.length > 0 ? userRoles : undefined,
    },
    canPublish,
  };
}
