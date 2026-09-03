import { Injectable, Optional } from "@nestjs/common";
import {
  BaseDispatcher,
  DispatchPayload,
  DispatchResult,
} from "./interfaces/base-dispatcher.interface";
import { WordpressStrategy } from "./strategies/wordpress.strategy";
import { LinkedinStrategy } from "./strategies/linkedin.strategy";
import { FacebookStrategy } from "./strategies/facebook.strategy";
import { formatPayloadForPlatform } from "./helpers/dispatch-formatter.util";
import { refreshOAuthTokenIfNeeded } from "../publishing-channels/oauth/oauth-token-refresh.helper";
import { PrismaService } from "../../common/context/prisma.service";
import { EncryptionService } from "../../common/security/encryption.service";

@Injectable()
export class DispatcherService {
  private strategies: BaseDispatcher[];

  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly encryptionService?: EncryptionService,
  ) {
    this.strategies = [
      new WordpressStrategy(),
      new LinkedinStrategy(),
      new FacebookStrategy(),
    ];
  }

  async dispatch(payload: DispatchPayload): Promise<DispatchResult> {
    const formattedPayload = formatPayloadForPlatform(payload);
    const channel = formattedPayload.channel;

    const strategy = this.strategies.find((s) => s.handles(channel));

    if (!strategy) {
      return {
        success: false,
        error: `No dispatcher configured for channel: ${channel}`,
      };
    }

    const result = await strategy.dispatch(formattedPayload);

    if (!result.success && result.error?.includes("401")) {
      const refreshedCreds = await refreshOAuthTokenIfNeeded(
        channel,
        formattedPayload.credentials,
      );

      if (refreshedCreds) {
        const channelId =
          formattedPayload.channelId || formattedPayload.metadata?.channelId;
        if (channelId && this.prisma && this.encryptionService) {
          try {
            const encryptedCredentials =
              this.encryptionService.encrypt(refreshedCreds);
            await this.prisma.publishingChannel.update({
              where: { id: channelId },
              data: { encryptedCredentials },
            });
          } catch {
            // Ignore persistence error and proceed
          }
        }

        return strategy.dispatch({
          ...formattedPayload,
          credentials: refreshedCreds,
        });
      }
    }

    return result;
  }

  registerStrategy(strategy: BaseDispatcher) {
    this.strategies.push(strategy);
  }
}
