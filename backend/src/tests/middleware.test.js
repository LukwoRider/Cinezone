import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "testsecret";

const { authenticate, requireAdmin } = await import("../middlewares/auth.middleware.js");

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Test suite for JWT authentication and admin role verification middlewares
describe("AUTHENTICATE MIDDLEWARE", () => {
    it("should return 401 if no Authorization header", () => {
        const req = { headers: {} };
        const res = mockResponse();
        const next = jest.fn();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid", () => {
        const req = { headers: { authorization: "Bearer invalidtoken" } };
        const res = mockResponse();
        const next = jest.fn();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next() and set req.user if token is valid", () => {
        const payload = { id: 1, is_admin: 1 };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockResponse();
        const next = jest.fn();

        authenticate(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(1);
        expect(req.user.is_admin).toBe(1);
    });
});

describe("REQUIRE ADMIN MIDDLEWARE", () => {
    it("should return 403 if user is not admin", () => {
        const req = { user: { id: 1, is_admin: 0 } };
        const res = mockResponse();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next() if user is admin", () => {
        const req = { user: { id: 1, is_admin: 1 } };
        const res = mockResponse();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it("should return 403 if req.user is undefined", () => {
        const req = {};
        const res = mockResponse();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
