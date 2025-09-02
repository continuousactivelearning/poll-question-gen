import {ObjectId} from 'mongodb';

export interface IUser {
  _id?: string | ObjectId | null;
  firebaseUID: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | null;
  avatar?: string | null; // URL to the user's avatar image

  dateOfBirth?: string; // ISO format recommended: YYYY-MM-DD
  address?: string;
  emergencyContact?: string;
  phoneNumber?: string | null;
  institution?: string | null;
  designation?: string | null;
  bio?: string | null;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ID = string | ObjectId | null;

// Interface for User Specific Anomalies
export interface IUserAnomaly {
  _id?: string | ObjectId | null;
  userId: string | ObjectId;
  courseId: string | ObjectId;
  courseVersionId: string | ObjectId;
  moduleId?: string | ObjectId;
  sectionId?: string | ObjectId;
  itemId?: string | ObjectId;
  anomalyType: string;
}