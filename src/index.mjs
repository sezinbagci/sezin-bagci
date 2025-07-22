import express from "express";

const app = express();

const mockUsers = [
    { id: 1, username: "sezin", displayName: "Sezin" },
    { id: 2, username: "yiğit", displayName: "Yiğit" },
    { id: 3, username: "melike", displayName: "Melike" }
];

app.get('/api/users', (req, res) => {
    res.send(mockUsers);
});

app.get("/api/users/:id", (req, res) => {
    const parsedId = parseInt(req.params.id);
    if (isNaN(parsedId))
        return res.status(400).send({ msg: "Invalid ID" });

    const findUser = mockUsers.find(user => user.id === parsedId);
    if (!findUser) return res.status(404).send({ msg: "User not found" });
    return res.send(findUser);
});

app.get('/api/products', (req, res) => {
    res.send([{ id: 123, name: "chicken breast", price: 12.99 }]);
});

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log("Running on Port", PORT);
    });
}

export default app


