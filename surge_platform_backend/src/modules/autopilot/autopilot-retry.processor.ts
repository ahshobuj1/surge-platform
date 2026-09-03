import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { PrismaService } from "../../common/context/prisma.service";
import { DispatcherService } from "../dispatcher/dispatcher.service";
import { EncryptionService } from "../../common/security/encryption.service";
import { buildAutopilotDispatchPayload } from "./helpers/autopilot-payload.builder";
import { computeBackoffDelayMs } from "./autopilot.utils";

interface FailedPostRetryPayload {
  logId: string;
  attempt: number;
}

@Injectable()
@Processor("FailedPostsQueue")
export class FailedPostsRetryProcessor extends WorkerHost {
  private readonly logger = new Logger(FailedPostsRetryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatcher: DispatcherService,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  async process(job: Job<FailedPostRetryPayload>) {
    const { logId } = job.data;
    const publishLog = await this.prisma.publishedPostsLog.findUnique({
      where: { id: logId },
      include: {
        generatedDraft: true,
        channel: true,
      },
    });

    if (!publishLog || !publishLog.generatedDraft || !publishLog.channel) {
      return { skipped: true, reason: "not-found" };
    }

    if (publishLog.status === "sent") {
      return { skipped: true, reason: "already-sent" };
    }

    const attemptNumber = job.attemptsMade + 1;
    const delayMs = computeBackoffDelayMs(attemptNumber);
    this.logger.warn(
      `Retrying failed publish ${logId} for channel ${publishLog.channel.platform} on attempt ${attemptNumber} with ${delayMs}ms delay`,
    );

    try {
      const payload = buildAutopilotDispatchPayload(
        publishLog.channel,
        publishLog.generatedDraft,
        this.logger,
        this.encryptionService,
      );

      const result = await this.dispatcher.dispatch(payload);

      if (result.success) {
        await this.prisma.publishedPostsLog.update({
          where: { id: logId },
          data: {
            status: "sent",
            livePostUrl:
              result.url ?? `https://example.local/${publishLog.draftId}`,
            retryCount: attemptNumber,
          },
        });
        await this.prisma.generatedDraft.update({
          where: { id: publishLog.draftId },
          data: { status: "auto_dispatch" },
        });
        return { success: true, logId };
      }

      throw new Error(
        result.error || `Dispatcher failed for ${publishLog.channel.platform}`,
      );
    } catch (err: any) {
      if (attemptNumber >= 3) {
        await this.prisma.publishedPostsLog.update({
          where: { id: logId },
          data: { status: "failed", retryCount: attemptNumber },
        });
        return {
          failed: true,
          reason: "max-retries-exhausted",
          error: err.message,
        };
      }

      await this.prisma.publishedPostsLog.update({
        where: { id: logId },
        data: { status: "retrying", retryCount: attemptNumber },
      });

      throw err;
    }
  }
}
