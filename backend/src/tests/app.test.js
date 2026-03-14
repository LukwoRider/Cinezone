import request from "supertest";
import app from "../../app.js";

// Test suite for the root API health check endpoint
describe("GET /test", () => {
  it("should return API status", async () => {
    const response = await request(app).get("/test");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
