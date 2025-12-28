import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private prisma: PrismaService) {
        super({
            clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
            callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/auth/github/callback',
            scope: ['user:email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: Function,
    ): Promise<any> {
        const { emails, id, username } = profile;
        const email = emails && emails[0] ? emails[0].value : `${username}@github.local`;

        // Find or create user
        let user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { oauthProvider: 'github', oauthId: id },
                ],
            },
        });

        if (!user) {
            // Create new user with GitHub OAuth
            user = await this.prisma.user.create({
                data: {
                    email,
                    oauthProvider: 'github',
                    oauthId: id,
                    isVerified: true, // GitHub accounts are pre-verified
                },
            });
        } else if (!user.oauthId) {
            // Link existing account with GitHub
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    oauthProvider: 'github',
                    oauthId: id,
                    isVerified: true,
                },
            });
        }

        done(null, user);
    }
}
