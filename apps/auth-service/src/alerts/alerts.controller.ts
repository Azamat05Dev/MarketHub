import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
    constructor(private alertsService: AlertsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new price alert' })
    async createAlert(@Request() req: any, @Body() dto: CreateAlertDto) {
        return this.alertsService.createAlert(req.user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user alerts' })
    async getAlerts(@Request() req: any) {
        return this.alertsService.getUserAlerts(req.user.userId);
    }

    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Toggle alert active status' })
    async toggleAlert(@Request() req: any, @Param('id') id: string) {
        return this.alertsService.toggleAlert(id, req.user.userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an alert' })
    async deleteAlert(@Request() req: any, @Param('id') id: string) {
        await this.alertsService.deleteAlert(id, req.user.userId);
        return { message: 'Alert deleted successfully' };
    }
}
