import { jest } from "@jest/globals";

jest.unstable_mockModule("../db/database.js", () => ({
    db: { query: jest.fn() },
}));

const { db } = await import("../db/database.js");
const { addFavorite, removeFavorite, getUserFavorites, isFavorite } = await import("../controllers/favorites.controller.js");

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    jest.clearAllMocks();
});

// Test suite for managing user favorite movies
describe("ADD FAVORITE", () => {
    it("should return 400 if movieId is missing", async () => {
        const req = { user: { id: 1 }, body: {} };
        const res = mockResponse();
        await addFavorite(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should add a favorite and return 201", async () => {
        db.query.mockResolvedValueOnce([]);

        const req = { user: { id: 1 }, body: { movieId: 5 } };
        const res = mockResponse();
        await addFavorite(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.any(String) })
        );
    });

    it("should return 409 if already a favorite", async () => {
        const dupError = new Error("Duplicate");
        dupError.code = "ER_DUP_ENTRY";
        db.query.mockRejectedValueOnce(dupError);

        const req = { user: { id: 1 }, body: { movieId: 5 } };
        const res = mockResponse();
        await addFavorite(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });
});

describe("REMOVE FAVORITE", () => {
    it("should remove a favorite", async () => {
        db.query.mockResolvedValueOnce([]);

        const req = { user: { id: 1 }, params: { movieId: "5" } };
        const res = mockResponse();
        await removeFavorite(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.any(String) })
        );
    });

    it("should return 500 on DB error", async () => {
        db.query.mockRejectedValueOnce(new Error("DB error"));

        const req = { user: { id: 1 }, params: { movieId: "5" } };
        const res = mockResponse();
        await removeFavorite(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe("GET USER FAVORITES", () => {
    it("should return user favorites list", async () => {
        const mockMovies = [
            { id: 1, title: "Movie 1" },
            { id: 2, title: "Movie 2" },
        ];
        db.query.mockResolvedValueOnce([mockMovies]);

        const req = { user: { id: 1 } };
        const res = mockResponse();
        await getUserFavorites(req, res);

        expect(res.json).toHaveBeenCalledWith(mockMovies);
    });
});

describe("IS FAVORITE", () => {
    it("should return true if movie is a favorite", async () => {
        db.query.mockResolvedValueOnce([[{ id: 1 }]]);

        const req = { user: { id: 1 }, params: { movieId: "5" } };
        const res = mockResponse();
        await isFavorite(req, res);

        expect(res.json).toHaveBeenCalledWith({ isFavorite: true });
    });

    it("should return false if movie is not a favorite", async () => {
        db.query.mockResolvedValueOnce([[]]);

        const req = { user: { id: 1 }, params: { movieId: "5" } };
        const res = mockResponse();
        await isFavorite(req, res);

        expect(res.json).toHaveBeenCalledWith({ isFavorite: false });
    });
});
