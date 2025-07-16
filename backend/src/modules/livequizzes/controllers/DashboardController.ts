import { JsonController, Get, Param, Authorized } from 'routing-controllers';
import { inject, injectable } from 'inversify';
import { DashboardService } from '../services/DashboardService.js';

@injectable()
@JsonController('/students')
// @Authorized(['admin', 'teacher']) // only teachers/admins can fetch other students
export class DashboardController {
    constructor(
        @inject(DashboardService) private dashboardService: DashboardService
    ) { }

    @Get('/dashboard/:studentId')
    async getDashboard(@Param('studentId') studentId: string) {
        return await this.dashboardService.getStudentDashboardData(studentId);
    }
}

