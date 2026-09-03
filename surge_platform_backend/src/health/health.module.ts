import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { StorageModule } from "../modules/storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [HealthController],
})
export class HealthModule {}
