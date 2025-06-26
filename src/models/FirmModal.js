import mongoose from "mongoose";

const firmSchema = new mongoose.Schema({
    id: Number,
    firmName: String,
    firmMail: String,
    address: String,
    tel: String,
    current_working_person: Number,
    firmType: String,
    firmStatus: String,
    latitude: Number,
    longitude: Number,
});

const FirmModal = mongoose.model("Firm", firmSchema, "Firms");

export default FirmModal;
