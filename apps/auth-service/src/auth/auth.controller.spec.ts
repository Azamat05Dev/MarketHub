import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        refreshToken: jest.fn(),
        handleOAuthLogin: jest.fn(),
        enable2FA: jest.fn(),
        verify2FA: jest.fn(),
        disable2FA: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerDto = { email: 'test@test.com', password: 'password123' };
            const expectedResult = {
                user: { id: 'uuid', email: registerDto.email, role: 'USER' },
                accessToken: 'token',
                refreshToken: 'refresh-token',
            };

            mockAuthService.register.mockResolvedValue(expectedResult);

            const result = await controller.register(registerDto);

            expect(result).toEqual(expectedResult);
            expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should login user and return tokens', async () => {
            const loginDto = { email: 'test@test.com', password: 'password123' };
            const expectedResult = {
                user: { id: 'uuid', email: loginDto.email, role: 'USER' },
                accessToken: 'token',
                refreshToken: 'refresh-token',
            };

            mockAuthService.login.mockResolvedValue(expectedResult);

            const result = await controller.login(loginDto);

            expect(result).toEqual(expectedResult);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('refresh', () => {
        it('should refresh tokens', async () => {
            const refreshTokenDto = { refreshToken: 'old-refresh-token' };
            const expectedResult = {
                accessToken: 'new-token',
                refreshToken: 'new-refresh-token',
            };

            mockAuthService.refreshToken.mockResolvedValue(expectedResult);

            const result = await controller.refresh(refreshTokenDto);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const user = { id: 'uuid', email: 'test@test.com', role: 'USER' };

            const result = await controller.getProfile(user);

            expect(result.user).toEqual(user);
            expect(result.message).toBe('Successfully retrieved user profile');
        });
    });

    describe('health', () => {
        it('should return health status', () => {
            const result = controller.health();

            expect(result.status).toBe('ok');
            expect(result.service).toBe('auth-service');
            expect(result).toHaveProperty('timestamp');
        });
    });
});
