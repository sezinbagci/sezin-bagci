import express, { request, response } from "express";
import mongoose from "mongoose";
import UserModal from "./models/UserModal.js";
import dotenv from "dotenv";
const app = express();
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import FirmModal from "./models/FirmModal.js";
const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
dotenv.config();

async function connect() {
    try {
        await mongoose.connect(process.env.URI);
        console.log("Connected!");
    } catch (error) {
        console.log(error);
    }
}
connect();

const PORT = process.env.PORT || 3000;

app.get("/", (request, response) => {
    response.status(201).send({ msg: "Hello" });
});
app.get("/api/users", async (req, res) => {
    try {
        const { firmidfilter, usernamefilter } = req.query;

        const filter = {};
        if (firmidfilter) filter.firmId = Number(firmidfilter);
        if (usernamefilter)
            filter.username = {
                $regex: usernamefilter,
                $options: "i",
            };
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 2;
        const skip = (page - 1) * limit;
        const totalUser = await UserModal.countDocuments(filter);
        const totalPage = Math.ceil(totalUser / limit);
        const users = await UserModal.find(filter).skip(skip).limit(limit);
        console.log(filter, skip, limit);
        res.json({
            users: users,
            currentPage: page,
            totalPage: totalPage,
            totalUser: totalUser,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            error: "An error occurred while fetching users",
        });
    }
});
app.get("/api/firms", async (req, res) => {
    try {
        const { firmnamefilter } = req.query;
        const filter = {};
        if (firmnamefilter)
            filter.firmName = {
                $regex: firmnamefilter,
                $options: "i",
            };
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const skip = (page - 1) * limit;
        const totalFirm = await FirmModal.countDocuments();
        const totalPage = Math.ceil(totalFirm / limit);
        const firms = await FirmModal.find(filter).skip(skip).limit(limit);
        const firmsWithCount = await Promise.all(
            firms.map(async (firm) => {
                const userCount = await UserModal.countDocuments({
                    firmId: firm.id,
                });
                return {
                    ...firm.toObject(),
                    current_working_person: userCount,
                };
            })
        );
        res.json({
            firms: firmsWithCount,
            totalFirm: totalFirm,
            totalPage: totalPage,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            error: "An error occurred while fetching users",
        });
    }
});

app.post("/api/users", async (request, response) => {
    try {
        console.log(request.body);
        const lastUser = await UserModal.findOne().sort({ id: -1 });
        const newId = lastUser ? lastUser.id + 1 : 1;
        const newUserData = {
            ...request.body,
            id: newId,
        };

        const newUser = await UserModal.create(newUserData);
        return response.status(201).send(newUser);
    } catch (error) {
        console.log("hata", error);
        return response.status(500).json({ error: "Sunucu hatası" });
    }
});

app.post("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const { permissions } = req.body;
    if (!permissions)
        return res.status(400).json({ msg: "Permission required" });
    try {
        const user = await UserModal.findOne({ id: Number(id) });
        if (!user) {
            console.log("Kullanıcı bulunamadı:", id);
            return res.status(404).json({ msg: "User not found" });
        }
        user.permissions = {
            ...user.permissions,
            ...permissions,
        };
        await user.save();
        res.json({ msg: "Permissions updated successfully" });
    } catch (error) {
        console.error("Error updating permissions:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/firms", async (request, response) => {
    const { body } = request;
    const newFirm = await FirmModal.create(request.body);
    return response.status(201).send(newFirm);
});

app.post("/api/register", async (request, response) => {
    const { username, surname, mail, password, firmId, role } = request.body;
    const lastUser = await UserModal.findOne().sort({ id: -1 });
    const newId = lastUser ? lastUser.id + 1 : 1;
    const existingUser = await UserModal.findOne({ mail }).exec();
    if (existingUser) {
        return response.status(400).send({ msg: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModal({
        id: newId,
        username,
        surname,
        mail,
        password: hashedPassword,
        firmId,
        role: role,
    });
    try {
        const savedUser = await newUser.save();
        const token = jwt.sign(
            {
                id: savedUser.id,
                username: savedUser.username,
                surname: savedUser.surname,
                mail: savedUser.mail,
                role: savedUser.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );
        return response.status(201).send({ token, user: savedUser });
    } catch (error) {
        console.error("Error creating user:", error);
        return response.status(500).send({ msg: "Internal Server Error" });
    }
});
app.post("/api/login", async (request, response) => {
    const { mail, password } = request.body;
    console.log(request.body);
    const user = await UserModal.findOne({ mail }).select("+password  ");
    if (!user) {
        return response.status(401).send({ msg: "Invalid user" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return response.status(401).send({ msg: "Invalid password" });
    }

    const accessToken = jwt.sign(
        {
            id: user.id,
            mail: user.mail,
            role: user.role,
            permissions: user.permissions,
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // Short expiry for access token
    );

    const refreshToken = jwt.sign(
        { id: user.id, permissions: user.permissions, type: "refresh" },
        process.env.JWT_REFRESH_SECRET, // Use different secret for refresh tokens
        { expiresIn: "7d" } // Longer expiry for refresh token
    );
    await UserModal.findOneAndUpdate(
        { id: user.id },
        {
            refreshToken: refreshToken,
        },
        { new: true }
    );

    response.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // Use true if using HTTPS
        sameSite: "Lax", // Adjust based on your needs
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return response.status(200).send({ accessToken, user });
});

app.post("/api/refresh-token", async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).send({ msg: "No refresh token" });

    try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        console.log("Payload:", payload);
        const user = await UserModal.findOne({ id: payload.id });
        console.log("User:", user);
        if (!user || user.refreshToken !== token) {
            return res.status(403).send({ msg: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign(
            {
                id: user.id,
                mail: user.mail,
                role: user.role,
                permissions: user.permissions,
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return res.status(200).send({
            accessToken: newAccessToken,
            user: {
                mail: user.mail,
                role: user.role,
                permissions: user.permissions,
            },
        });
    } catch (err) {
        return res
            .status(403)
            .send({ msg: "Refresh token expired or invalid" });
    }
});

// Node.js + Express
app.post("/api/logout", (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "Lax",
        secure: false, // Set to true if you're using HTTPS
    });
    res.sendStatus(200);
});

app.get("/api/firms/:id", async (request, response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId))
        return response.status(400).send({ msg: "Bad Request. Invalid ID!" });
    const currentWorkingCount = await UserModal.countDocuments({
        firmId: parsedId,
    });
    const findFirm = await FirmModal.findOne({ id: parsedId });
    const firmWithCount = {
        ...findFirm.toObject(),
        current_working_person: currentWorkingCount,
    };
    if (!findFirm) return response.sendStatus(404);
    return response.send(firmWithCount);
});

app.put("/api/users/:id", async (request, response) => {
    const {
        body,
        params: { id },
    } = request;

    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return response.sendStatus(400);
    try {
        const updatedUser = await UserModal.findOneAndUpdate(
            { id: parsedId },
            body,
            { new: true }
        );
        if (!updatedUser) return response.sendStatus(404);
        return response.status(200).json(updatedUser);
    } catch (error) {
        console.log(error);
        return response.sendStatus(500);
    }
});

app.put("/api/firms/:id", async (request, response) => {
    const {
        body,
        params: { id },
    } = request;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return response.sendStatus(400);
    try {
        const updatedFirm = await FirmModal.findOneAndUpdate(
            { id: parsedId },
            body,
            { new: true }
        );
        if (!updatedFirm) return response.sendStatus(404);
        return response.status(200).json(updatedFirm);
    } catch (error) {
        console.log(error);
        return response.sendStatus(500);
    }
});

app.get("/api/users/:id", async (request, response) => {
    console.log(request.params);
    const parsedId = parseInt(request.params.id);

    if (isNaN(parsedId))
        return response.status(400).send({ msg: "Bad Request. Invalid ID!" });

    const findUser = await UserModal.findOne({ id: parsedId });
    if (!findUser) return response.sendStatus(404);
    return response.send(findUser);
});

app.delete("/api/users/:id", async (request, response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId)) return response.sendStatus(400);
    const deleteUser = await UserModal.deleteOne({ id: parsedId });
    if (!deleteUser) return response.sendStatus(404);
    return response.send(deleteUser);
});

app.delete("/api/firms/:id", async (request, response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId)) return response.sendStatus(400);
    const deleteFirm = await FirmModal.deleteOne({ id: parsedId });
    if (!deleteFirm) return response.sendStatus(404);
    return response.send(deleteFirm);
});

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
});

//localhost:3000
// localhost:3000/users
//localhost:3000/firms
