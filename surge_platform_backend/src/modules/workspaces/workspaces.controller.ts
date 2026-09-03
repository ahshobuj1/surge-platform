import {
  Controller,
  Patch,
  Param,
  Body,
  Post,
  Get,
  Delete,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { WorkspacesService } from "./workspaces.service";
import { QueueConfigDto } from "./dto/queue-config.dto";
import { AutoPostToggleDto } from "./dto/auto-post-toggle.dto";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { ValidateRssSourceDto } from "./dto/validate-rss-source.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import { RssSchedulerService } from "./rss-scheduler.service";
import { RssSourcesService } from "./rss-sources.service";
import { AutopilotSchedulerService } from "../autopilot/autopilot-scheduler.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";

interface AuthenticatedUser {
  userId: string;
  role: string;
}

@ApiTags("workspaces")
@Controller("workspaces")
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly rssSourcesService: RssSourcesService,
    private readonly scheduler: RssSchedulerService,
    private readonly autopilotScheduler: AutopilotSchedulerService,
  ) {}

  @Post("rss-sources/validate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiOperation({ summary: "Validate an RSS/Atom feed URL" })
  @ApiBody({ type: ValidateRssSourceDto })
  @ApiResponse({ status: 200, description: "RSS feed validated successfully" })
  validateRssSource(@Body() dto: ValidateRssSourceDto) {
    return this.rssSourcesService.validate(dto.url);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiOperation({ summary: "Create a workspace" })
  @ApiBody({ type: CreateWorkspaceDto })
  @ApiResponse({ status: 201, description: "Workspace created successfully" })
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.workspacesService.create(createWorkspaceDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiOperation({ summary: "List workspaces" })
  @ApiResponse({ status: 200, description: "Workspaces returned successfully" })
  findAll(@GetUser() user: AuthenticatedUser) {
    return this.workspacesService.findAll(user);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiOperation({ summary: "Get a workspace by id" })
  @ApiParam({ name: "id", description: "Workspace id" })
  @ApiResponse({ status: 200, description: "Workspace returned successfully" })
  findOne(@Param("id") id: string, @GetUser() user: AuthenticatedUser) {
    return this.workspacesService.findOne(id, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiOperation({ summary: "Update a workspace" })
  @ApiParam({ name: "id", description: "Workspace id" })
  @ApiBody({ type: CreateWorkspaceDto })
  @ApiResponse({ status: 200, description: "Workspace updated successfully" })
  update(
    @Param("id") id: string,
    @Body() updateWorkspaceDto: Partial<CreateWorkspaceDto>,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.workspacesService.update(id, updateWorkspaceDto, user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiOperation({ summary: "Delete a workspace" })
  @ApiParam({ name: "id", description: "Workspace id" })
  @ApiResponse({ status: 200, description: "Workspace deleted successfully" })
  remove(@Param("id") id: string, @GetUser() user: AuthenticatedUser) {
    return this.workspacesService.remove(id, user);
  }

  @Patch(":workspaceId/queue-config")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  async updateQueueConfig(
    @Param("workspaceId") workspaceId: string,
    @Body() dto: QueueConfigDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const updated = await this.workspacesService.updateQueueConfig(
      workspaceId,
      dto,
      user,
    );
    // notify scheduler to reschedule repeatable jobs
    await this.scheduler.onWorkspaceConfigChange(workspaceId);
    await this.autopilotScheduler.syncWorkspaceSchedules(workspaceId, dto);
    return updated;
  }

  @Patch(":workspaceId/auto-post")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  async toggleAutoPost(
    @Param("workspaceId") workspaceId: string,
    @Body() dto: AutoPostToggleDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.workspacesService.updateQueueConfig(
      workspaceId,
      {
        autoPost: dto.autoPost,
      },
      user,
    );
  }

  @Get(":workspaceId/preferences")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiOperation({ summary: "Get workspace editorial preferences" })
  @ApiResponse({
    status: 200,
    description: "Workspace editorial preferences returned successfully",
  })
  getPreferences(
    @Param("workspaceId") workspaceId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.workspacesService.getPreferences(workspaceId, user);
  }

  @Patch(":workspaceId/preferences")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiOperation({ summary: "Update workspace editorial preferences" })
  @ApiBody({ type: UpdatePreferencesDto })
  @ApiResponse({
    status: 200,
    description: "Workspace editorial preferences updated successfully",
  })
  async updatePreferences(
    @Param("workspaceId") workspaceId: string,
    @Body() dto: UpdatePreferencesDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const updated = await this.workspacesService.updatePreferences(
      workspaceId,
      dto,
      user,
    );
    await this.scheduler.onWorkspaceConfigChange(workspaceId);
    return updated;
  }
}
