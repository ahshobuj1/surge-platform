import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../common/context/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
});
