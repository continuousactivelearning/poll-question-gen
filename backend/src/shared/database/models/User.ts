import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
    firebaseUID: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    roles?: string[];
    avatar?: string | null;
}
  
const UserSchema = new Schema<IUserDocument>(
    {
        firebaseUID: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true, unique: true },
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        roles: { type: [String], default: ['student'] }, // or your default
        avatar: { type: String, default: '' }
    },
    {
        timestamps: true
    }
);

export const UserModel = mongoose.models.User as mongoose.Model<IUserDocument> || mongoose.model<IUserDocument>('User', UserSchema);