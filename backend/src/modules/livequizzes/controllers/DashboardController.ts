import { JsonController, Get, Param, Authorized } from 'routing-controllers';
import { inject, injectable } from 'inversify';
import { DashboardService } from '../services/DashboardService.js';

@injectable()
@JsonController()
// @Authorized(['admin', 'teacher']) // only teachers/admins can fetch other students
export class DashboardController {
    constructor(
        @inject(DashboardService) private dashboardService: DashboardService
    ) { }

    // Student Dashboard
    @Get('/students/dashboard/:studentId')
    async getStudentDashboard(@Param('studentId') studentId: string) {
        return await this.dashboardService.getStudentDashboardData(studentId);
    }

    // Teacher Dashboard
    @Get('/teachers/dashboard/:teacherId')
    async getTeacherDashboard(@Param('teacherId') teacherId: string) {
        return await this.dashboardService.getTeacherDashboardData(teacherId);
    }
}
