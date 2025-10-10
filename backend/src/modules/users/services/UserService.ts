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
    //console.log("findOrCreateByFirebaseUID - role:", user.role);
    if (!user) {
      const userId = await this.userRepo.create({
        firebaseUID,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        avatar: data.avatar || null,
        role: data.role || "null",
        phoneNumber: data.phoneNumber || null,
        institution: data.institution || null,
        designation: data.designation || null,
        bio: data.bio || null,
        isVerified: data.isVerified || false,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address || undefined,
        emergencyContact: data.emergencyContact || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await this.userRepo.findById(userId);
    }
    return user;
  }

  async findByFirebaseUID(firebaseUID: string): Promise<IUser> {
    const user = await this.userRepo.findByFirebaseUID(firebaseUID);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    return {
      id: user._id?.toString() || '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || null,
      role: user.role || null,
      phoneNumber: user.phoneNumber,
      institution: user.institution,
      designation: user.designation,
      bio: user.bio,
      isVerified: user.isVerified,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      emergencyContact: user.emergencyContact,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(
    userId: string,
    data: Partial<Pick<IUser, 'firstName' | 'lastName' | 'avatar' | 'phoneNumber' | 'bio' | 'institution' | 'designation' | 'dateOfBirth' | 'address' | 'emergencyContact'>>
  ) {
    const updated = await this.userRepo.updateById(userId, {
      ...data,
      updatedAt: new Date(),
    });
    if (!updated) throw new NotFoundError('User not found');

    return {
      id: updated._id?.toString() || '',
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      avatar: updated.avatar || null,
      role: updated.role || null,
      phoneNumber: updated.phoneNumber,
      institution: updated.institution,
      designation: updated.designation,
      bio: updated.bio,
      isVerified: updated.isVerified,
      dateOfBirth: updated.dateOfBirth,
      address: updated.address,
      emergencyContact: updated.emergencyContact,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const updatedUser = await this.userRepo.updateById(userId, {
      avatar: avatarUrl,
      updatedAt: new Date(),
    });
    if (!updatedUser) throw new NotFoundError('User not found');

    return {
      success: true,
      message: 'Avatar updated successfully',
      avatar: updatedUser.avatar,
    };
  }

  async updateRoleByFirebaseUID(firebaseUID: string, role: string) {
    if (!role || typeof role !== 'string') {
      throw new Error('Role must be a non-empty string');
    }

    const updatedUser = await this.userRepo.updateRole(firebaseUID, role);


    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }

  async findUserByEmail(email:string):Promise<IUser>{
    console.log(email)
    const result = await this.userRepo.findByEmail(email)
    return result
  }
}
