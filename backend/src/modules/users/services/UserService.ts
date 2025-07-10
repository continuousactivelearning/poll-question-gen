import { injectable, inject } from 'inversify';
import { NotFoundError } from 'routing-controllers';
import { BaseService } from '#root/shared/classes/BaseService.js';
import { IUserRepository } from '#root/shared/database/interfaces/IUserRepository.js';
import { MongoDatabase } from '#root/shared/database/providers/mongo/MongoDatabase.js';
import { GLOBAL_TYPES } from '#root/types.js';
import type { IUser } from '#shared/interfaces/models.js';

@injectable()
export class UserService extends BaseService {
  constructor(
    @inject(GLOBAL_TYPES.UserRepo) private readonly userRepo: IUserRepository,
    @inject(GLOBAL_TYPES.Database) private readonly database: MongoDatabase,
  ) {
    super(database);
  }

  async findOrCreateByFirebaseUID(firebaseUID: string, data: Partial<IUser>): Promise<IUser> {
    let user = await this.userRepo.findByFirebaseUID(firebaseUID);
    if (!user) {
      const userId = await this.userRepo.create({
        firebaseUID,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        avatar: data.avatar || null,
        roles: ['teacher']
      });
      user = await this.userRepo.findById(userId);
    }
    return user;
  }
  
  
  async findByFirebaseUID(firebaseUID: string): Promise<IUser> {
    const user = await this.userRepo.findByFirebaseUID(firebaseUID);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      id: user._id?.toString() || '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || null,
      role: user.roles[0] || '',
    };
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; avatar?: string }) {
    const updated = await this.userRepo.updateById(userId, data);
    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return {
      id: updated._id?.toString() || '',
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      avatar: updated.avatar || null,
      role: updated.roles[0] || '',
    };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const updatedUser = await this.userRepo.updateById(userId, { avatar: avatarUrl });
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    return {
      success: true,
      message: 'Avatar updated successfully',
      avatar: updatedUser.avatar,
    };
  }
}
