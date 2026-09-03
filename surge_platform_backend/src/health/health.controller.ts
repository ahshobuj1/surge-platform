import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { PrismaService } from "../common/context/prisma.service";
import { StorageService } from "../modules/storage/storage.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: "System Health & Readiness Check" })
  @ApiResponse({ status: 200, description: "System is healthy" })
  @ApiResponse({
    status: 503,
    description: "One or more dependencies are down",
  })
  async checkHealth(@Res() res: Response) {
    const checks: Record<
      string,
      { status: "up" | "down"; latencyMs?: number; error?: string }
    > = {};

    // 1. Database Check
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRawUnsafe("SELECT 1");
      checks.database = { status: "up", latencyMs: Date.now() - dbStart };
    } catch (err: any) {
      checks.database = { status: "down", error: err.message };
    }

    // 2. Storage Check
    const storageStart = Date.now();
    try {
      await this.storage.verifyConnection();
      checks.storage = { status: "up", latencyMs: Date.now() - storageStart };
    } catch (err: any) {
      checks.storage = { status: "down", error: err.message };
    }

    const isHealthy = Object.values(checks).every((c) => c.status === "up");
    const statusCode = isHealthy
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      runtime: "bun",
      checks,
    });
  }
}
