import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    // add email/photo/etc if needed
});

export const UserModel = mongoose.model('User', userSchema);
