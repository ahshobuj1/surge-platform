import * as https from "https";
import { Logger } from "@nestjs/common";

export async function sendViaHttps(
  token: string,
  payload: object,
  logger: Logger,
  inboxId?: string | number,
  attempt: number = 1,
): Promise<void> {
  const maxRetries = 3;

  const isSandbox = Boolean(inboxId);
  const hostname = isSandbox
    ? "sandbox.api.mailtrap.io"
    : "send.api.mailtrap.io";
  const path = isSandbox ? `/api/send/${inboxId}` : "/api/send";

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);

    const options = {
      hostname,
      port: 443,
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Mailtrap API error (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on("error", (error: NodeJS.ErrnoException) => {
      const errorMsg = error.message || String(error);

      if (
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT"
      ) {
        if (attempt < maxRetries) {
          logger.warn(
            `Network error on attempt ${attempt}/${maxRetries}: ${errorMsg}. Retrying...`,
          );
          setTimeout(() => {
            sendViaHttps(token, payload, logger, inboxId, attempt + 1)
              .then(resolve)
              .catch(reject);
          }, 1000 * attempt);
        } else {
          reject(
            new Error(
              `Network error after ${maxRetries} attempts: ${errorMsg}`,
            ),
          );
        }
      } else {
        reject(error);
      }
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.write(postData);
    req.end();
  });
}
