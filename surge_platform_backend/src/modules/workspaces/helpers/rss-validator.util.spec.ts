import { BadRequestException } from "@nestjs/common";
import { validateRssFeed } from "./rss-validator.util";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("rss-validator.util", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw BadRequestException for empty or invalid URL strings", async () => {
    await expect(validateRssFeed("")).rejects.toThrow(BadRequestException);
    await expect(validateRssFeed("   ")).rejects.toThrow(BadRequestException);
    await expect(validateRssFeed("not-a-valid-url")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should block private network and SSRF target URLs", async () => {
    await expect(validateRssFeed("http://localhost:3030/rss")).rejects.toThrow(
      BadRequestException,
    );
    await expect(validateRssFeed("http://127.0.0.1/feed.xml")).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      validateRssFeed("http://169.254.169.254/latest/meta-data"),
    ).rejects.toThrow(BadRequestException);
    await expect(
      validateRssFeed("http://192.168.1.1/feed.rss"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when feed URL returns HTTP error status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers(),
      text: jest.fn().mockResolvedValue(""),
    });

    await expect(
      validateRssFeed("https://example.com/missing-feed.xml"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should reject standard HTML landing pages", async () => {
    const html = `<!DOCTYPE html><html><head><title>My Blog</title></head><body><h1>Welcome</h1></body></html>`;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: jest.fn().mockResolvedValue(html),
    });

    await expect(
      validateRssFeed("https://example.com/homepage"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should reject broken or malformed XML", async () => {
    const brokenXml = `<rss><channel><title>Broken</rss>`;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/xml" }),
      text: jest.fn().mockResolvedValue(brokenXml),
    });

    await expect(
      validateRssFeed("https://example.com/broken.xml"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should successfully parse and return metadata for valid RSS feeds", async () => {
    const validRss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Tech News Daily</title>
  <link>https://technews.example.com</link>
  <description>Latest in tech</description>
  <item>
    <title>AI Breakthrough in 2026</title>
    <link>https://technews.example.com/article-1</link>
    <pubDate>Mon, 02 Sep 2026 12:00:00 GMT</pubDate>
  </item>
  <item>
    <title>New Quantum Chip Unveiled</title>
    <link>https://technews.example.com/article-2</link>
  </item>
</channel>
</rss>`;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/rss+xml" }),
      text: jest.fn().mockResolvedValue(validRss),
    });

    const result = await validateRssFeed(
      "https://technews.example.com/feed.xml",
    );

    expect(result.isValid).toBe(true);
    expect(result.title).toBe("Tech News Daily");
    expect(result.itemCount).toBe(2);
    expect(result.latestItem?.title).toBe("AI Breakthrough in 2026");
    expect(result.latestItem?.link).toBe(
      "https://technews.example.com/article-1",
    );
  });
});
