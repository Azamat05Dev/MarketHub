import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Password (min 8 characters)' })
    @IsString()
    @MinLength(8)
    password: string;
}

export class LoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    @IsString()
    password: string;

    @ApiPropertyOptional({ example: '123456', description: '2FA code if enabled' })
    @IsOptional()
    @IsString()
    twoFACode?: string;
}

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh token to get new access token' })
    @IsString()
    refreshToken: string;
}
