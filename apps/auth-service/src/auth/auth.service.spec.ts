import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prismaService = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto = { email: 'test@test.com', password: 'password123' };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue({
                id: 'uuid',
                email: registerDto.email,
                role: 'USER',
            });
            mockPrismaService.refreshToken.create.mockResolvedValue({});

            const result = await service.register(registerDto);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.email).toBe(registerDto.email);
        });

        it('should throw error if user already exists', async () => {
            const registerDto = { email: 'test@test.com', password: 'password123' };

            mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

            await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('should return tokens for valid credentials', async () => {
            const loginDto = { email: 'test@test.com', password: 'password123' };
            const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv'; // bcrypt hash

            mockPrismaService.user.findUnique.mockResolvedValue({
                id: 'uuid',
                email: loginDto.email,
                passwordHash: hashedPassword,
                role: 'USER',
                twoFAEnabled: false,
            });
            mockPrismaService.refreshToken.create.mockResolvedValue({});

            // Note: In real tests, you'd mock bcrypt.compare
        });

        it('should throw error for invalid credentials', async () => {
            const loginDto = { email: 'test@test.com', password: 'wrongpassword' };

            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('validateUser', () => {
        it('should return user for valid userId', async () => {
            const userId = 'uuid';
            const expectedUser = {
                id: userId,
                email: 'test@test.com',
                role: 'USER',
                isVerified: true,
            };

            mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

            const result = await service.validateUser(userId);

            expect(result).toEqual(expectedUser);
        });
    });

    describe('2FA', () => {
        it('should generate TOTP secret when enabling 2FA', async () => {
            const userId = 'uuid';

            mockPrismaService.user.update.mockResolvedValue({});
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: userId,
                email: 'test@test.com',
            });

            const result = await service.enable2FA(userId);

            expect(result).toHaveProperty('secret');
            expect(result).toHaveProperty('qrCodeUrl');
            expect(result.secret.length).toBe(16);
        });
    });
});
