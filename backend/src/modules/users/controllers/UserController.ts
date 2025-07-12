import { User } from '#auth/classes/transformers/User.js';
import { UserService } from '#users/services/UserService.js';
import { USERS_TYPES } from '#users/types.js';
import { injectable, inject } from 'inversify';
import {
  JsonController,
  Get,
  Put,
  Post,
  Body,
  HttpCode,
  Param,
  Params,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import {
  UserByFirebaseUIDParams,
  UserByFirebaseUIDResponse,
  UserNotFoundErrorResponse,
} from '../classes/validators/UserValidators.js';

@OpenAPI({ tags: ['Users'] })
@JsonController('/users', { transformResponse: true })
@injectable()
export class UserController {
  constructor(
    @inject(USERS_TYPES.UserService)
    private readonly userService: UserService,
  ) { }

  /**
   * Get user by Firebase UID (full transformer)
   */
  @OpenAPI({
    summary: 'Get user by Firebase UID',
    description: 'Retrieves a user profile using their Firebase UID.',
  })
  @Get('/firebase/:firebaseUID')
  @HttpCode(200)
  @ResponseSchema(UserByFirebaseUIDResponse, {
    description: 'User profile retrieved successfully',
  })
  @ResponseSchema(UserNotFoundErrorResponse, {
    statusCode: 404,
    description: 'User not found',
  })
  async getUserByFirebaseUID(
    @Params() params: UserByFirebaseUIDParams,
  ): Promise<User> {
    const user = await this.userService.findByFirebaseUID(params.firebaseUID);
    return new User(user);
  }

  /**
   * Create or find user by Firebase UID
   */
  @OpenAPI({
    summary: 'Find or create user by Firebase UID',
    description: 'If a user does not exist with the given Firebase UID, creates a new user.',
  })
  @Post('/firebase/:firebaseUID/profile')
  @HttpCode(201)
  async findOrCreateProfileByFirebaseUID(
    @Param('firebaseUID') firebaseUID: string,
    @Body() body: {
      firstName?: string;
      lastName?: string;
      email?: string;
      avatar?: string | null;
      role?: string;
    },
  ) {
    return await this.userService.findOrCreateByFirebaseUID(firebaseUID, body);
  }

  /**
   * Get profile by internal user ID
   */
  @OpenAPI({
    summary: 'Get user profile by internal user ID',
    description: 'Fetches user profile data like firstName, lastName, email, avatar, role.',
  })
  @Get('/:id/profile')
  @HttpCode(200)
  async getProfile(@Param('id') id: string) {
    return await this.userService.getProfile(id);
  }

  /**
   * Update user profile by internal user ID
   */
  @OpenAPI({
    summary: 'Update user profile by internal user ID',
    description: 'Updates firstName, lastName, and/or avatar for a user.',
  })
  @Put('/:id/profile')
  @HttpCode(200)
  async updateProfile(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; avatar?: string },
  ) {
    return await this.userService.updateProfile(id, body);
  }

  /**
   * Get user profile by Firebase UID (simple JSON, no transformer)
   */
  @OpenAPI({
    summary: 'Get user profile by Firebase UID (plain JSON)',
    description: 'Fetches user data by Firebase UID as plain JSON.',
  })
  @Get('/firebase/:firebaseUID/profile')
  @HttpCode(200)
  async getProfileByFirebaseUID(@Param('firebaseUID') firebaseUID: string) {
    const user = await this.userService.findByFirebaseUID(firebaseUID);
    return {
      id: user._id?.toString() || '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || null,
      role: user.roles[0] || '',
    };
  }
}
