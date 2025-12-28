import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password } = registerDto;

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            ...tokens,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check 2FA if enabled
        if (user.twoFAEnabled && !loginDto.twoFACode) {
            return {
                requires2FA: true,
                message: 'Two-factor authentication code required',
            };
        }

        // TODO: Verify 2FA code if provided

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        // Find refresh token in database
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Get user
        const user = await this.prisma.user.findUnique({
            where: { id: tokenRecord.userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Delete old refresh token
        await this.prisma.refreshToken.delete({
            where: { id: tokenRecord.id },
        });

        // Generate new tokens
        return this.generateTokens(user.id, user.email, user.role);
    }

    async validateUser(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                isVerified: true,
            },
        });
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        // Generate access token
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '1h',
        });

        // Generate refresh token
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.prisma.refreshToken.create({
            data: {
                userId,
                token: refreshToken,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    // OAuth Login Handler
    async handleOAuthLogin(user: any) {
        return this.generateTokens(user.id, user.email, user.role);
    }

    // 2FA Methods
    async enable2FA(userId: string) {
        // Generate a simple secret (in production, use speakeasy or otplib)
        const secret = this.generateTOTPSecret();

        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFASecret: secret },
        });

        // Generate QR code URL for authenticator apps
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const otpAuthUrl = `otpauth://totp/MarketHub:${user?.email}?secret=${secret}&issuer=MarketHub`;

        return {
            secret,
            qrCodeUrl: otpAuthUrl,
            message: 'Scan QR code with your authenticator app, then verify with a code',
        };
    }

    async verify2FA(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.twoFASecret) {
            throw new UnauthorizedException('2FA not set up');
        }

        // Simple verification (in production, use TOTP library)
        const isValid = this.verifyTOTP(user.twoFASecret, code);

        if (!isValid) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFAEnabled: true },
        });

        return { message: '2FA enabled successfully' };
    }

    async disable2FA(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.twoFASecret) {
            throw new UnauthorizedException('2FA not enabled');
        }

        const isValid = this.verifyTOTP(user.twoFASecret, code);

        if (!isValid) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFAEnabled: false,
                twoFASecret: null,
            },
        });

        return { message: '2FA disabled successfully' };
    }

    private generateTOTPSecret(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 16; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    }

    private verifyTOTP(secret: string, code: string): boolean {
        // Simple TOTP verification
        // In production, use proper TOTP library like 'otplib'
        // This is a placeholder that accepts any 6-digit code for demo
        return code.length === 6 && /^\d+$/.test(code);
    }
}
