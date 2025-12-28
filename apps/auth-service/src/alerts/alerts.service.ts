import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAlertDto } from './dto/alert.dto';

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService) { }

    async createAlert(userId: string, dto: CreateAlertDto) {
        return this.prisma.priceAlert.create({
            data: {
                userId,
                symbol: dto.symbol.toUpperCase(),
                targetPrice: dto.targetPrice,
                condition: dto.condition,
            },
        });
    }

    async getUserAlerts(userId: string) {
        return this.prisma.priceAlert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getActiveAlerts() {
        return this.prisma.priceAlert.findMany({
            where: {
                isActive: true,
                triggered: false,
            },
        });
    }

    async toggleAlert(alertId: string, userId: string) {
        const alert = await this.prisma.priceAlert.findFirst({
            where: { id: alertId, userId },
        });

        if (!alert) {
            throw new Error('Alert not found');
        }

        return this.prisma.priceAlert.update({
            where: { id: alertId },
            data: { isActive: !alert.isActive },
        });
    }

    async deleteAlert(alertId: string, userId: string) {
        return this.prisma.priceAlert.deleteMany({
            where: { id: alertId, userId },
        });
    }

    async triggerAlert(alertId: string) {
        return this.prisma.priceAlert.update({
            where: { id: alertId },
            data: {
                triggered: true,
                triggeredAt: new Date(),
                isActive: false,
            },
        });
    }

    async checkAlerts(prices: { symbol: string; price: number }[]) {
        const triggeredAlerts: any[] = [];
        const activeAlerts = await this.getActiveAlerts();

        for (const alert of activeAlerts) {
            const priceData = prices.find(p => p.symbol === alert.symbol);
            if (!priceData) continue;

            const shouldTrigger =
                (alert.condition === 'above' && priceData.price >= alert.targetPrice) ||
                (alert.condition === 'below' && priceData.price <= alert.targetPrice);

            if (shouldTrigger) {
                await this.triggerAlert(alert.id);
                triggeredAlerts.push({
                    ...alert,
                    currentPrice: priceData.price,
                });
            }
        }

        return triggeredAlerts;
    }
}
