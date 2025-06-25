import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
});

const UserModal = mongoose.model("User", userSchema, "Users");

export default UserModal;
