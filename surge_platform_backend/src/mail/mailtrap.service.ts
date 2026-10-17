import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sendViaHttps } from "./mailtrap-transport.util";
import {
  buildOtpEmailContent,
  buildPasswordResetEmailContent,
  extractOtpFromText,
} from "./mailtrap-templates.util";
import * as https from "https";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailtrapService {
  private token = "";
  private fromEmail = "";
  private fromName = "";
  private inboxId = "";
  private readonly logger = new Logger(MailtrapService.name);

  constructor(private configService: ConfigService) {
    this.refreshConfig();
  }

  private refreshConfig(): void {
    this.token = this.configService.get<string>("MAILTRAP_TOKEN")?.trim() || "";
    this.fromEmail =
      this.configService.get<string>("MAILTRAP_FROM_EMAIL")?.trim() ||
      "verify@zerodraft.ai";
    this.fromName =
      this.configService.get<string>("MAILTRAP_FROM_NAME")?.trim() ||
      "Surge Platform";
    this.inboxId =
      this.configService.get<string>("MAILTRAP_INBOX_ID")?.trim() || "";
  }

  private async trySendViaSmtp(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean | null> {
    const host = this.configService.get<string>("MAIL_HOST")?.trim();
    const user = this.configService.get<string>("MAIL_USER")?.trim();
    const pass = this.configService.get<string>("MAIL_PASS")?.trim();

    if (!host || !user || !pass) {
      return null; // SMTP not configured, proceed to Mailtrap
    }

    try {
      const port = Number(this.configService.get<string>("MAIL_PORT") || 465);
      const secure =
        this.configService.get<string>("MAIL_SECURE") === "true" || port === 465;
      const from =
        this.configService.get<string>("MAIL_FROM")?.trim() ||
        this.fromEmail ||
        user;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"${this.fromName}" <${from}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      this.logger.log(`Real email sent successfully via SMTP (${host}) to ${params.to}`);
      return true;
    } catch (smtpErr: unknown) {
      const msg = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
      this.logger.error(`SMTP delivery to ${params.to} failed: ${msg}. Trying Mailtrap fallback.`);
      return false;
    }
  }

  private async discoverSandboxInbox(): Promise<string | null> {
    if (!this.token) return null;
    return new Promise((resolve) => {
      const options = {
        hostname: "mailtrap.io",
        port: 443,
        path: "/api/inboxes",
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Api-Token": this.token,
        },
        timeout: 5000,
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const inboxes = JSON.parse(data);
            if (Array.isArray(inboxes) && inboxes.length > 0 && inboxes[0].id) {
              const discovered = String(inboxes[0].id);
              this.logger.log(
                `Discovered Mailtrap Sandbox Inbox ID: ${discovered}`,
              );
              resolve(discovered);
              return;
            }
          } catch {
            // Ignore parse errors
          }
          resolve(null);
        });
      });

      req.on("error", () => resolve(null));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(null);
      });
      req.end();
    });
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    this.refreshConfig();

    const smtpSent = await this.trySendViaSmtp(params);
    if (smtpSent === true) {
      return true;
    }

    const isDevelopment =
      this.configService.get<string>("NODE_ENV") === "development";

    if (!this.token) {
      this.logger.warn(
        `Mailtrap token not configured. Falling back to local OTP logging for ${params.to}`,
      );
      return false;
    }

    const payload = {
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      to: [{ email: params.to }],
      subject: params.subject,
      html: params.html,
      text: params.text,
    };

    try {
      let targetInboxId = this.inboxId;
      if (!targetInboxId) {
        // Auto-discover sandbox inbox if not configured explicitly
        targetInboxId = (await this.discoverSandboxInbox()) || "";
        if (targetInboxId) {
          this.inboxId = targetInboxId;
        }
      }

      this.logger.debug(
        `Sending email to ${params.to} via Mailtrap (Inbox/Mode: ${targetInboxId || "Live"}). Token: ${this.token.substring(0, 8)}...`,
      );

      await sendViaHttps(this.token, payload, this.logger, targetInboxId);

      this.logger.log(`Email sent successfully to ${params.to}`);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Mailtrap send failed for ${params.to}: ${errorMsg}. Falling back to local console OTP output.`,
      );

      if (isDevelopment || errorMsg.toLowerCase().includes("unauthorized")) {
        this.logger.warn(
          `=== [LOCAL TESTING OTP FALLBACK] Code for ${params.to} is: ${extractOtpFromText(params.text ?? params.html)} ===`,
        );
      }

      return false;
    }
  }

  async sendOtpEmail(params: {
    to: string;
    otp: string;
    userName?: string;
  }): Promise<boolean> {
    const { html, text } = buildOtpEmailContent(params);

    return this.sendEmail({
      to: params.to,
      subject: "Email Verification OTP",
      html,
      text,
    });
  }

  async sendPasswordResetEmail(params: {
    to: string;
    otp: string;
    userName?: string;
  }): Promise<boolean> {
    const { html, text } = buildPasswordResetEmailContent(params);

    return this.sendEmail({
      to: params.to,
      subject: "Password Reset OTP",
      html,
      text,
    });
  }
}
