import { BadRequestException } from "@nestjs/common";
import { validateWordpressConnection } from "./wordpress-validator.util";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("wordpress-validator.util", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw BadRequestException if any required parameter is missing", async () => {
    await expect(
      validateWordpressConnection("", "admin", "pwd"),
    ).rejects.toThrow(BadRequestException);
    await expect(
      validateWordpressConnection("https://example.com", "", "pwd"),
    ).rejects.toThrow(BadRequestException);
    await expect(
      validateWordpressConnection("https://example.com", "admin", ""),
    ).rejects.toThrow(BadRequestException);
  });

  it("should block SSRF and private network targets", async () => {
    await expect(
      validateWordpressConnection("http://127.0.0.1:8080", "admin", "pwd"),
    ).rejects.toThrow(BadRequestException);
    await expect(
      validateWordpressConnection("http://localhost:3000", "admin", "pwd"),
    ).rejects.toThrow(BadRequestException);
    await expect(
      validateWordpressConnection(
        "http://169.254.169.254/latest",
        "admin",
        "pwd",
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw a clear error message when WordPress returns 401 Unauthorized", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: jest.fn(),
    });

    await expect(
      validateWordpressConnection(
        "https://myblog.com",
        "admin",
        "wrong-password",
      ),
    ).rejects.toThrow(/Invalid WordPress username or Application Password/);
  });

  it("should throw a clear error message when WordPress REST API returns 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: jest.fn(),
    });

    await expect(
      validateWordpressConnection(
        "https://static-site.com",
        "admin",
        "some-password",
      ),
    ).rejects.toThrow(/WordPress REST API was not found/);
  });

  it("should successfully validate valid WordPress credentials and return site and user metadata", async () => {
    // 1st fetch: /wp-json/wp/v2/users/me
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        id: 42,
        name: "Jane Editor",
        slug: "jane-editor",
        roles: ["administrator"],
        capabilities: { publish_posts: true, edit_posts: true },
      }),
    });

    // 2nd fetch: /wp-json (site root)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        name: "Tech Chronicle",
        description: "Insights on Modern AI",
      }),
    });

    const result = await validateWordpressConnection(
      "https://techchronicle.com/",
      "jane",
      "abcd efgh ijkl mnop",
    );

    expect(result.isValid).toBe(true);
    expect(result.siteUrl).toBe("https://techchronicle.com");
    expect(result.siteName).toBe("Tech Chronicle");
    expect(result.user.id).toBe(42);
    expect(result.user.name).toBe("Jane Editor");
    expect(result.canPublish).toBe(true);
  });
});
