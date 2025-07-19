import 'reflect-metadata';
import Express from 'express';
import request from 'supertest';
import { useExpressServer, useContainer, UnauthorizedError } from 'routing-controllers';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { DashboardController } from '../controllers/DashboardController.js';
import { DashboardService } from '../services/DashboardService.js';
import { HttpErrorHandler } from '#shared/index.js';
import { Container } from 'inversify';
import { IocAdapter } from 'routing-controllers';

// Fixed: Use Inversify to match your controller
export class InversifyAdapter implements IocAdapter {
    constructor(private container: Container) { }

    get<T>(someClass: new (...args: any[]) => T): T {
        return this.container.get<T>(someClass);
    }
}

const mockDashboardService = {
    getStudentDashboardData: vi.fn(),
    getTeacherDashboardData: vi.fn()
};

// Mock HttpErrorHandler if needed
const mockHttpErrorHandler = {
    error: vi.fn()
};

describe('DashboardController Integration Tests', () => {
    let app: Express.Express;
    let container: Container;

    beforeAll(() => {
        // Fixed: Use inversify container instead of tsyringe
        container = new Container();
        container.bind(DashboardService).toConstantValue(mockDashboardService);
        container.bind(DashboardController).toSelf();
        // Bind HttpErrorHandler to fix the binding error
        container.bind(HttpErrorHandler).toConstantValue(mockHttpErrorHandler);

        const appInstance = Express();

        // Fixed: Use inversify adapter
        useContainer(new InversifyAdapter(container));

        app = useExpressServer(appInstance, {
            controllers: [DashboardController],
            // Remove middlewares from routing-controllers config
            // middlewares: [HttpErrorHandler],
            validation: true,
            development: true,
            // Fixed: Proper authorization checking based on token and required roles
            authorizationChecker: async (action, roles) => {
                const authHeader = action.request.headers.authorization;

                // Throw UnauthorizedError for 401 when no auth header is provided
                if (!authHeader) {
                    throw new UnauthorizedError('No authorization header provided');
                }

                // Simple mock: check if token contains the required role
                if (roles) {
                    return roles.some(role => authHeader.includes(role));
                }
                return true;
            },
            currentUserChecker: async (action) => {
                const authHeader = action.request.headers.authorization;
                if (!authHeader) return null;

                // Return user based on what's in the token
                if (authHeader.includes('student')) {
                    return { id: 'mock-student', role: 'student' };
                }
                if (authHeader.includes('teacher')) {
                    return { id: 'mock-teacher', role: 'teacher' };
                }
                return { id: 'mock-user', role: 'unknown' };
            }
        });
    });

    describe('GET /students/dashboard/:studentId', () => {
        it('should return student dashboard data', async () => {
            const studentId = '123';
            const mockData = { pollsTaken: 10, correctAnswers: 8 };
            mockDashboardService.getStudentDashboardData.mockResolvedValue(mockData);

            const response = await request(app)
                .get(`/students/dashboard/${studentId}`)
                .set('Authorization', 'Bearer mock-student-token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockData);
        });

        // Added: Test for unauthorized access
        it('should return 403 when non-student tries to access', async () => {
            const studentId = '123';

            const response = await request(app)
                .get(`/students/dashboard/${studentId}`)
                .set('Authorization', 'Bearer mock-teacher-token');

            expect(response.status).toBe(403);
        });

        it('should return 401 when no auth token provided', async () => {
            const studentId = '123';

            const response = await request(app)
                .get(`/students/dashboard/${studentId}`);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /teachers/dashboard/:teacherId', () => {
        it('should return teacher dashboard data', async () => {
            const teacherId = '456';
            const mockData = { totalPolls: 5, studentsEngaged: 40 };
            mockDashboardService.getTeacherDashboardData.mockResolvedValue(mockData);

            const response = await request(app)
                .get(`/teachers/dashboard/${teacherId}`)
                .set('Authorization', 'Bearer mock-teacher-token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockData);
        });

        // Added: Test for unauthorized access
        it('should return 403 when non-teacher tries to access', async () => {
            const teacherId = '456';

            const response = await request(app)
                .get(`/teachers/dashboard/${teacherId}`)
                .set('Authorization', 'Bearer mock-student-token');

            expect(response.status).toBe(403);
        });

        it('should return 401 when no auth token provided', async () => {
            const teacherId = '456';

            const response = await request(app)
                .get(`/teachers/dashboard/${teacherId}`);

            expect(response.status).toBe(401);
        });
    });
});