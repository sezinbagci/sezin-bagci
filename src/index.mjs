import express, { request, response } from "express";
import mongoose from "mongoose";
import UserModal from "./models/UserModal.js";
import dotenv from "dotenv";
const app = express();
import cors from "cors";
import FirmModal from "./models/FirmModal.js";
const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
};

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
        const { firmidfilter } = req.query;

        const filter = {};
        if (firmidfilter) filter.firmId = Number(firmidfilter);
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 2;
        const skip = (page - 1) * limit;
        const totalUser = await UserModal.countDocuments(filter);
        const totalPage = Math.ceil(totalUser / limit);
        const users = await UserModal.find(filter).skip(skip).limit(limit);
        res.json({ users: users, totalPage: totalPage, totalUser: totalUser });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            error: "An error occurred while fetching users",
        });
    }
});
app.get("/api/firms", async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 2;
        const skip = (page - 1) * limit;
        const totalFirm = await FirmModal.countDocuments();
        const totalPage = Math.ceil(totalFirm / limit);
        const firms = await FirmModal.find().skip(skip).limit(limit);
        res.json({
            firms: firms,
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

app.post("/api/users", (request, response) => {
    console.log(request.body);
    const { body } = request;
    const newUser = { id: users[users.length - 1].id + 1, ...body };
    users.push(newUser);
    return response.status(201).send(newUser);
});

app.get("/api/firms/:id", async (request, response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId))
        return response.status(400).send({ msg: "Bad Request. Invalid ID!" });

    const findFirm = await FirmModal.findOne({ id: parsedId });
    if (!findFirm) return response.sendStatus(404);
    return response.send(findFirm);
});

app.put("/api/users/:id", (request, response) => {
    const {
        body,
        params: { id },
    } = request;

    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return response.sendStatus(400);

    const findUserIndex = users.findIndex((user) => user.id === parsedId);

    if (findUserIndex === -1) return response.sendStatus(404);

    users[findUserIndex] = { id: parsedId, ...body };
    return response.sendStatus(200);
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

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
});

//localhost:3000
// localhost:3000/users
//localhost:3000/firms
