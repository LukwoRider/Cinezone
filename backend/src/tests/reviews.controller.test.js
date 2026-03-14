// src/tests/reviews.controller.test.js
import { jest } from "@jest/globals";

/* ============================
   MOCK DATABASE
============================ */
jest.unstable_mockModule("../db/database.js", () => ({
    db: { query: jest.fn() },
}));

const { db } = await import("../db/database.js");
const { getMovieReviews, addReview, updateReview, deleteReview } = await import("../controllers/reviews.controller.js");

/* ============================
   HELPERS
============================ */
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    jest.clearAllMocks();
});

/* ============================
   GET MOVIE REVIEWS
============================ */
describe("GET MOVIE REVIEWS", () => {
    it("should return reviews for a movie", async () => {
        const mockReviews = [
            { id: 1, rating: 8, comment: "Super", user_id: 1, firstname: "John", lastname: "Doe" },
        ];
        db.query.mockResolvedValueOnce([mockReviews]);

        const req = { params: { movieId: "1" } };
        const res = mockResponse();
        await getMovieReviews(req, res);

        expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should return 500 on DB error", async () => {
        db.query.mockRejectedValueOnce(new Error("DB error"));

        const req = { params: { movieId: "1" } };
        const res = mockResponse();
        await getMovieReviews(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

/* ============================
   ADD REVIEW
============================ */
describe("ADD REVIEW", () => {
    it("should return 400 if fields are missing", async () => {
        const req = { user: { id: 1 }, body: {} };
        const res = mockResponse();
        await addReview(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if rating is out of range (0)", async () => {
        const req = { user: { id: 1 }, body: { movieId: 1, rating: 0, comment: "Test" } };
        const res = mockResponse();
        await addReview(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if rating is out of range (11)", async () => {
        const req = { user: { id: 1 }, body: { movieId: 1, rating: 11, comment: "Test" } };
        const res = mockResponse();
        await addReview(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should create a review and return 201", async () => {
        db.query.mockResolvedValueOnce([{ insertId: 10 }]); // INSERT review
        db.query.mockResolvedValueOnce([]); // recalcMovieRating

        const req = { user: { id: 1 }, body: { movieId: 1, rating: 8, comment: "Excellent film" } };
        const res = mockResponse();
        await addReview(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ id: 10, rating: 8 })
        );
    });

    it("should return 409 if review already exists", async () => {
        const dupError = new Error("Duplicate");
        dupError.code = "ER_DUP_ENTRY";
        db.query.mockRejectedValueOnce(dupError);

        const req = { user: { id: 1 }, body: { movieId: 1, rating: 8, comment: "Test" } };
        const res = mockResponse();
        await addReview(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });
});

/* ============================
   UPDATE REVIEW
============================ */
describe("UPDATE REVIEW", () => {
    it("should return 400 if fields are missing", async () => {
        const req = { user: { id: 1 }, params: { id: "1" }, body: {} };
        const res = mockResponse();
        await updateReview(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if review not found or not owned", async () => {
        db.query.mockResolvedValueOnce([[]]); // SELECT reviews

        const req = { user: { id: 1 }, params: { id: "99" }, body: { rating: 7, comment: "Updated" } };
        const res = mockResponse();
        await updateReview(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should update review successfully", async () => {
        db.query.mockResolvedValueOnce([[{ movie_id: 1 }]]); // SELECT review
        db.query.mockResolvedValueOnce([]); // UPDATE review
        db.query.mockResolvedValueOnce([]); // recalcMovieRating

        const req = { user: { id: 1 }, params: { id: "1" }, body: { rating: 9, comment: "Updated" } };
        const res = mockResponse();
        await updateReview(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.any(String) })
        );
    });
});

/* ============================
   DELETE REVIEW
============================ */
describe("DELETE REVIEW", () => {
    it("should return 404 if review not found or not owned", async () => {
        db.query.mockResolvedValueOnce([[]]); // SELECT reviews

        const req = { user: { id: 1 }, params: { id: "99" } };
        const res = mockResponse();
        await deleteReview(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should delete review successfully", async () => {
        db.query.mockResolvedValueOnce([[{ movie_id: 1 }]]); // SELECT review
        db.query.mockResolvedValueOnce([]); // DELETE review
        db.query.mockResolvedValueOnce([]); // recalcMovieRating

        const req = { user: { id: 1 }, params: { id: "1" } };
        const res = mockResponse();
        await deleteReview(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.any(String) })
        );
    });
});
