import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: any) {
        return {
            user,
            message: 'Successfully retrieved user profile',
        };
    }

    @Get('admin-only')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async adminOnly(@CurrentUser() user: any) {
        return {
            message: 'This is an admin-only endpoint',
            user,
        };
    }

    // Google OAuth
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        // Guard initiates Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Req() req: any, @Res() res: Response) {
        const tokens = await this.authService.handleOAuthLogin(req.user);
        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(
            `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
        );
    }

    // GitHub OAuth
    @Get('github')
    @UseGuards(GithubAuthGuard)
    async githubAuth() {
        // Guard initiates GitHub OAuth flow
    }

    @Get('github/callback')
    @UseGuards(GithubAuthGuard)
    async githubAuthCallback(@Req() req: any, @Res() res: Response) {
        const tokens = await this.authService.handleOAuthLogin(req.user);
        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(
            `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
        );
    }

    // 2FA Endpoints
    @Post('2fa/enable')
    @UseGuards(JwtAuthGuard)
    async enable2FA(@CurrentUser() user: any) {
        return this.authService.enable2FA(user.id);
    }

    @Post('2fa/verify')
    @UseGuards(JwtAuthGuard)
    async verify2FA(@CurrentUser() user: any, @Body('code') code: string) {
        return this.authService.verify2FA(user.id, code);
    }

    @Post('2fa/disable')
    @UseGuards(JwtAuthGuard)
    async disable2FA(@CurrentUser() user: any, @Body('code') code: string) {
        return this.authService.disable2FA(user.id, code);
    }

    @Get('health')
    health() {
        return {
            status: 'ok',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
        };
    }
}
