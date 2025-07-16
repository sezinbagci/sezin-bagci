import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        id: Number,
        username: String,
        surname: String,
        mail: String,
        tel: String,
        firmName: String,
        firmId: Number,
        status: String,
        role: String,
        birthdate: String,
        gender: String,
        known_language: String,
        password: {
            type: String,
            required: true,
            select: false,
        },
        refreshToken: {
            type: String,
            default: null,
        },
        permissions: {
            edit: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            addUser: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    }
);

const UserModal = mongoose.model("User", userSchema, "Users");

export default UserModal;
