import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../common/context/prisma.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

describe("UsersService", () => {
  let service: UsersService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    company: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getMyProfile", () => {
    it("should return user profile including isOnboarded", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        fullName: "Test User",
        phoneNumber: null,
        role: "customer",
        avatarKey: null,
        isVerified: true,
        isOnboarded: false,
        createdAt: new Date(),
      });

      const profile = await service.getMyProfile("user-123");
      expect(profile.id).toBe("user-123");
      expect(profile.isOnboarded).toBe(false);
      expect(profile.email).toBe("test@example.com");
    });

    it("should throw NotFoundException if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMyProfile("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("completeOnboarding", () => {
    it("should set isOnboarded to true", async () => {
      prisma.user.update.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        fullName: "Test User",
        phoneNumber: null,
        role: "customer",
        avatarKey: null,
        isVerified: true,
        isOnboarded: true,
        createdAt: new Date(),
      });

      const res = await service.completeOnboarding("user-123");
      expect(prisma.user.update).toHaveBeenCalled();
      expect(res.user.isOnboarded).toBe(true);
    });
  });

  describe("updateMyProfile", () => {
    it("should update profile details, company, and mailing address", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        fullName: "Old Name",
        password: "hashedpassword",
      });
      prisma.company.findFirst.mockResolvedValue({
        id: "comp-1",
        name: "Old Company",
      });
      prisma.company.update.mockResolvedValue({
        id: "comp-1",
        name: "New Company",
      });
      prisma.user.update.mockResolvedValue({
        id: "user-123",
        fullName: "New Name",
        email: "test@example.com",
        phoneNumber: "+1234567890",
        role: "customer",
        avatarKey: null,
        mailingAddress: "123 Main St",
        isVerified: true,
        isOnboarded: true,
        createdAt: new Date(),
        companies: [{ id: "comp-1", name: "New Company" }],
      });

      const res = await service.updateMyProfile("user-123", {
        fullName: "New Name",
        phoneNumber: "+1234567890",
        companyName: "New Company",
        mailingAddress: "123 Main St",
      });

      expect(res.fullName).toBe("New Name");
      expect(res.companyName).toBe("New Company");
      expect(res.mailingAddress).toBe("123 Main St");
      expect(prisma.company.update).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it("should create company if user has no company and companyName is provided", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        password: "hashedpassword",
      });
      prisma.company.findFirst.mockResolvedValue(null);
      prisma.company.create.mockResolvedValue({
        id: "comp-new",
        name: "Acme Corp",
      });
      prisma.user.update.mockResolvedValue({
        id: "user-123",
        fullName: "Test",
        email: "test@example.com",
        phoneNumber: null,
        role: "customer",
        avatarKey: null,
        mailingAddress: null,
        isVerified: true,
        isOnboarded: true,
        createdAt: new Date(),
        companies: [{ id: "comp-new", name: "Acme Corp" }],
      });

      const res = await service.updateMyProfile("user-123", {
        companyName: "Acme Corp",
      });

      expect(prisma.company.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ownerId: "user-123",
            name: "Acme Corp",
          }),
        }),
      );
      expect(res.companyName).toBe("Acme Corp");
    });

    it("should update password when valid new and current passwords are provided", async () => {
      const hashedOld = await bcrypt.hash("OldPass123!", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        password: hashedOld,
      });
      prisma.company.findFirst.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue({
        id: "user-123",
        fullName: "Test",
        email: "test@example.com",
        phoneNumber: null,
        role: "customer",
        avatarKey: null,
        mailingAddress: null,
        isVerified: true,
        isOnboarded: true,
        createdAt: new Date(),
        companies: [],
      });

      await service.updateMyProfile("user-123", {
        currentPassword: "OldPass123!",
        newPassword: "NewPass123!",
      });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: expect.any(String),
            passwordChangedAt: expect.any(Date),
          }),
        }),
      );
    });

    it("should throw BadRequestException if current password is wrong during password change", async () => {
      const hashedOld = await bcrypt.hash("OldPass123!", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        password: hashedOld,
      });

      await expect(
        service.updateMyProfile("user-123", {
          currentPassword: "WrongPass!",
          newPassword: "NewPass123!",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("changePassword", () => {
    it("should change password when current password is correct", async () => {
      const hashedOldPassword = await bcrypt.hash("OldPassword123!", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        password: hashedOldPassword,
      });
      prisma.user.update.mockResolvedValue({ id: "user-123" });

      const res = await service.changePassword("user-123", {
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
      });

      expect(res.message).toBe("Password changed successfully");
    });
  });
});
