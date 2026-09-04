import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../common/context/prisma.service";
import { UpdateCurrentUserDto } from "./dto/update-current-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        avatarKey: true,
        mailingAddress: true,
        isVerified: true,
        isOnboarded: true,
        createdAt: true,
        companies: {
          select: { id: true, name: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const company = user.companies?.[0] || null;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatarKey: user.avatarKey,
      companyName: company?.name || null,
      companyId: company?.id || null,
      mailingAddress: user.mailingAddress || null,
      isVerified: user.isVerified,
      isOnboarded: user.isOnboarded,
      createdAt: user.createdAt,
    };
  }

  async completeOnboarding(userId: string): Promise<{
    message: string;
    user: {
      id: string;
      fullName: string | null;
      email: string;
      phoneNumber: string | null;
      role: string;
      avatarKey: string | null;
      isVerified: boolean;
      isOnboarded: boolean;
      createdAt: Date;
    };
  }> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        avatarKey: true,
        isVerified: true,
        isOnboarded: true,
        createdAt: true,
      },
    });

    return {
      message: "Onboarding completed successfully",
      user,
    };
  }

  async updateMyProfile(userId: string, dto: UpdateCurrentUserDto) {
    if (
      dto.fullName === undefined &&
      dto.phoneNumber === undefined &&
      dto.avatarKey === undefined &&
      dto.companyName === undefined &&
      dto.mailingAddress === undefined &&
      dto.newPassword === undefined
    ) {
      throw new BadRequestException("At least one profile field is required");
    }

    // Verify user exists
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundException("User not found");
    }

    // Handle password update if newPassword provided
    let passwordUpdate: { password?: string; passwordChangedAt?: Date } = {};
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          "Current password is required to set a new password",
        );
      }
      const isMatch = await bcrypt.compare(
        dto.currentPassword,
        currentUser.password,
      );
      if (!isMatch) {
        throw new BadRequestException("Current password is incorrect");
      }
      if (dto.currentPassword === dto.newPassword) {
        throw new BadRequestException(
          "New password cannot be the same as your current password",
        );
      }
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
      passwordUpdate = {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      };
    }

    // Handle companyName update if provided
    if (dto.companyName !== undefined && dto.companyName.trim()) {
      const trimmedName = dto.companyName.trim();
      const existingCompany = await this.prisma.company.findFirst({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
      });

      if (existingCompany) {
        await this.prisma.company.update({
          where: { id: existingCompany.id },
          data: { name: trimmedName },
        });
      } else {
        await this.prisma.company.create({
          data: {
            ownerId: userId,
            name: trimmedName,
            status: "active",
          },
        });
      }
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          fullName:
            dto.fullName !== undefined ? dto.fullName.trim() : undefined,
          phoneNumber:
            dto.phoneNumber !== undefined
              ? dto.phoneNumber.trim() || null
              : undefined,
          avatarKey: dto.avatarKey !== undefined ? dto.avatarKey : undefined,
          mailingAddress:
            dto.mailingAddress !== undefined
              ? dto.mailingAddress.trim() || null
              : undefined,
          ...passwordUpdate,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          avatarKey: true,
          mailingAddress: true,
          isVerified: true,
          isOnboarded: true,
          createdAt: true,
          companies: {
            select: { id: true, name: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      const company = user.companies?.[0] || null;

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatarKey: user.avatarKey,
        companyName: company?.name || null,
        companyId: company?.id || null,
        mailingAddress: user.mailingAddress || null,
        isVerified: user.isVerified,
        isOnboarded: user.isOnboarded,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("User not found");
        }

        if (error.code === "P2002") {
          throw new ConflictException("Phone number is already in use");
        }
      }

      throw error;
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException("Current password is incorrect");
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        "New password cannot be the same as your current password",
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    return {
      message: "Password changed successfully",
    };
  }
}
