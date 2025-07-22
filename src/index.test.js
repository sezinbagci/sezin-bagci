import request from "supertest";
import app from "./index.mjs";

describe("GET /api/users", () => {
    test("Kullanıcıları döndürmeli", async () => {
        const response = await request(app).get("/api/users");
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty("username");
    });
});

describe("GET /api/users/:id", () => {
    test("Geçerli ID ile kullanıcı dönmeli", async () => {
        const response = await request(app).get("/api/users/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("username", "sezin");
    });

    test("Geçersiz ID için 400 dönmeli", async () => {
        const response = await request(app).get("/api/users/abc");
        expect(response.status).toBe(400);
    });

    test("Bulunamayan ID için 404 dönmeli", async () => {
        const response = await request(app).get("/api/users/999");
        expect(response.status).toBe(404);
    });
});

describe("GET /api/products", () => {
    test("Ürünleri döndürmeli", async () => {
        const response = await request(app).get("/api/products");
        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty("name", "chicken breast");
    });
});