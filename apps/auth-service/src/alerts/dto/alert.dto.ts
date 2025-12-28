import { IsString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
    @ApiProperty({ example: 'BTC', description: 'Cryptocurrency symbol' })
    @IsString()
    symbol: string;

    @ApiProperty({ example: 50000, description: 'Target price to trigger alert' })
    @IsNumber()
    targetPrice: number;

    @ApiProperty({ example: 'above', description: 'Trigger when price goes above or below target' })
    @IsIn(['above', 'below'])
    condition: 'above' | 'below';
}

export class AlertResponseDto {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: string;
    isActive: boolean;
    triggered: boolean;
    triggeredAt?: Date;
    createdAt: Date;
}
