import { IUserRepository } from '#shared/database/interfaces/IUserRepository.js';
import { IUser } from '#shared/interfaces/models.js';
import { injectable } from 'inversify';
import { NotFoundError, InternalServerError } from 'routing-controllers';
import { UserModel } from '#root/shared/database/models/User.js';

@injectable()
export class UserRepository implements IUserRepository {
  async getDBClient(): Promise<any> {
    // Not needed when using Mongoose; return null or throw if you prefer
    return null;
  }
  
  async create(data: Partial<IUser>): Promise<string> {
    const user = await UserModel.create({
      firebaseUID: data.firebaseUID,   // ✅ this must be named `firebaseUID`
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      role: data.role || 'student'
    });
    return user._id.toString();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).lean<IUser>().exec();
  }

  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true }).lean<IUser>().exec();
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id).lean<IUser>().exec();
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async findByFirebaseUID(firebaseUID: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ firebaseUID }).lean<IUser>().exec();
    return user || null;
  }  

  async updateRole(firebaseUID: string, role: string): Promise<IUser | null> {
    if (!role || typeof role !== 'string') {
      throw new Error('Role must be a non-empty string');
    }
    const updatedUser = await UserModel.findOneAndUpdate(
      { firebaseUID },
      { $set: { role } },  // overwrite the role
      { new: true }
    ).lean<IUser>().exec();
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    return updatedUser;
  }

  async addRole(firebaseUID: string, role: string): Promise<IUser | null> {
    return await UserModel.findOneAndUpdate(
      { firebaseUID },
      { $addToSet: { roles: role } },
      { new: true }
    ).lean<IUser>().exec();
  }

  async removeRole(firebaseUID: string, role: string): Promise<IUser | null> {
    return await UserModel.findOneAndUpdate(
      { firebaseUID },
      { $pull: { roles: role } },
      { new: true }
    ).lean<IUser>().exec();
  }

  async updatePassword(firebaseUID: string, password: string): Promise<IUser | null> {
    return await UserModel.findOneAndUpdate(
      { firebaseUID },
      { $set: { password } },
      { new: true }
    ).lean<IUser>().exec();
  }
}
