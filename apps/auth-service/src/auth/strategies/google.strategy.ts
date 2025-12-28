import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private prisma: PrismaService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { emails, id, displayName } = profile;
        const email = emails[0].value;

        // Find or create user
        let user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { oauthProvider: 'google', oauthId: id },
                ],
            },
        });

        if (!user) {
            // Create new user with Google OAuth
            user = await this.prisma.user.create({
                data: {
                    email,
                    oauthProvider: 'google',
                    oauthId: id,
                    isVerified: true, // Google accounts are pre-verified
                },
            });
        } else if (!user.oauthId) {
            // Link existing account with Google
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    oauthProvider: 'google',
                    oauthId: id,
                    isVerified: true,
                },
            });
        }

        done(null, user);
    }
}
