import { jest } from "@jest/globals";

jest.unstable_mockModule("../db/database.js", () => ({
    db: { query: jest.fn() },
}));

const { db } = await import("../db/database.js");
const { getAllUsers, deleteUser } = await import("../controllers/users.controller.js");

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    jest.clearAllMocks();
});

// Test suite for user management endpoints (admin only)
describe("GET ALL USERS", () => {
    it("should return list of users", async () => {
        const mockUsers = [
            { id: 1, firstname: "John", lastname: "Doe", email: "john@test.com", is_admin: 0, avatar: null },
            { id: 2, firstname: "Admin", lastname: "User", email: "admin@test.com", is_admin: 1, avatar: "/uploads/avatars/admin.jpg" },
        ];
        db.query.mockResolvedValueOnce([mockUsers]);

        const req = {};
        const res = mockResponse();
        await getAllUsers(req, res);

        expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should return 500 on DB error", async () => {
        db.query.mockRejectedValueOnce(new Error("DB connection failed"));

        const req = {};
        const res = mockResponse();
        await getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) })
        );
    });
});

describe("DELETE USER", () => {
    it("should return 403 if trying to delete own account", async () => {
        const req = { params: { id: "1" }, user: { id: 1 } };
        const res = mockResponse();
        await deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should return 404 if user not found", async () => {
        db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const req = { params: { id: "99" }, user: { id: 1 } };
        const res = mockResponse();
        await deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should delete user successfully", async () => {
        db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const req = { params: { id: "2" }, user: { id: 1 } };
        const res = mockResponse();
        await deleteUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.any(String) })
        );
    });

    it("should return 500 on DB error", async () => {
        db.query.mockRejectedValueOnce(new Error("DB error"));

        const req = { params: { id: "2" }, user: { id: 1 } };
        const res = mockResponse();
        await deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
