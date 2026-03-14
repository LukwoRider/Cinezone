// src/tests/auth.controller.test.js
import { jest } from "@jest/globals";

process.env.JWT_SECRET = "testsecret";
process.env.JWT_EXPIRES_IN = "1h";

/* ============================
   MOCK DATABASE, BCRYPT ET JWT
============================ */

// Mock du module db
jest.unstable_mockModule("../db/database.js", () => ({
  db: { query: jest.fn() },
}));

// Mocks bcrypt et jwt pour ESM
const bcrypt = { hash: jest.fn(), compare: jest.fn() };
const jwt = { sign: jest.fn() };

// Importer les modules après avoir défini les mocks
const { db } = await import("../db/database.js");
const {
  register,
  login,
  updateProfile,
  changePassword,
} = await import("../controllers/auth.controller.js");

/* ============================
   HELPERS
============================ */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

/* ============================
   REGISTER
============================ */
describe("REGISTER", () => {
  it("should return 400 if missing fields", async () => {
    const req = { body: {} };
    const res = mockResponse();
    await register(req, res, db, bcrypt);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 409 if email exists", async () => {
    db.query.mockResolvedValueOnce([[{ id: 1 }]]);
    const req = { body: { firstname: "Test", lastname: "User", email: "test@test.com", password: "123456" } };
    const res = mockResponse();
    await register(req, res, db, bcrypt);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("should create user and return 201", async () => {
    db.query.mockResolvedValueOnce([[]]); // email non existant
    bcrypt.hash.mockResolvedValue("hashedPassword");
    db.query.mockResolvedValueOnce([]); // insertion simulée
    const req = { body: { firstname: "Test", lastname: "User", email: "test@test.com", password: "123456" } };
    const res = mockResponse();
    await register(req, res, db, bcrypt);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

/* ============================
   LOGIN
============================ */
describe("LOGIN", () => {
  it("should return 400 if missing fields", async () => {
    const req = { body: {} };
    const res = mockResponse();
    await login(req, res, db, bcrypt, jwt);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 401 if user not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const req = { body: { email: "x@test.com", password: "123" } };
    const res = mockResponse();
    await login(req, res, db, bcrypt, jwt);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 if password invalid", async () => {
    db.query.mockResolvedValueOnce([[{
      id: 1,
      firstname: "Test",
      lastname: "User",
      email: "x@test.com",
      password_hash: "hash",
      is_admin: 0
    }]]);
    bcrypt.compare.mockResolvedValue(false);

    const req = { body: { email: "x@test.com", password: "123" } };
    const res = mockResponse();
    await login(req, res, db, bcrypt, jwt);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  //   it("should return token if login valid", async () => {
  //     const user = {
  //         id: 1,
  //         firstname: "Test",
  //         lastname: "User",
  //         email: "x@test.com",
  //         password_hash: "hash",
  //         is_admin: 0
  //     };

  //     db.query.mockResolvedValueOnce([[user]]);
  //     bcrypt.compare.mockResolvedValue(true);
  //     jwt.sign.mockReturnValue("fake-token");

  //     const req = { body: { email: "x@test.com", password: "123" } };
  //     const res = mockResponse();

  //     await login(req, res, db, bcrypt, jwt);

  //     expect(res.json).toHaveBeenCalledWith({
  //         token: "fake-token",
  //         user: {
  //         id: 1,
  //         firstname: "Test",
  //         lastname: "User",
  //         email: "x@test.com",
  //         is_admin: 0
  //         }
  //     });
  // });

});

/* ============================
   UPDATE PROFILE
============================ */
describe("UPDATE PROFILE", () => {
  it("should return 400 if missing fields", async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = mockResponse();
    await updateProfile(req, res, db);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should update profile", async () => {
    const updatedUser = { id: 1, firstname: "New", lastname: "Name", email: "new@test.com", is_admin: 0, avatar: null };
    db.query.mockResolvedValueOnce([]); // UPDATE
    db.query.mockResolvedValueOnce([[updatedUser]]); // SELECT
    const req = { user: { id: 1 }, body: { firstname: "New", lastname: "Name", email: "new@test.com" } };
    const res = mockResponse();
    await updateProfile(req, res, db);
    expect(res.json).toHaveBeenCalledWith({ message: "Profil mis à jour avec succès", user: updatedUser });
  });
});

/* ============================
   CHANGE PASSWORD
============================ */
describe("CHANGE PASSWORD", () => {
  it("should return 400 if missing fields", async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = mockResponse();
    await changePassword(req, res, db, bcrypt);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 404 if user not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const req = { user: { id: 1 }, body: { currentPassword: "123", newPassword: "456" } };
    const res = mockResponse();
    await changePassword(req, res, db, bcrypt);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 400 if wrong current password", async () => {
    db.query.mockResolvedValueOnce([[{ password_hash: "hash" }]]);
    bcrypt.compare.mockResolvedValue(false);
    const req = { user: { id: 1 }, body: { currentPassword: "123", newPassword: "456" } };
    const res = mockResponse();
    await changePassword(req, res, db, bcrypt);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  //   it("should update password successfully", async () => {
  //     // 1er SELECT pour récupérer le hash
  //     db.query.mockResolvedValueOnce([[{ password_hash: "hash" }]]);
  //     // Comparaison réussie
  //     bcrypt.compare.mockResolvedValue(true);
  //     // Nouveau hash simulé
  //     bcrypt.hash.mockResolvedValue("newHash");
  //     // 2ème UPDATE
  //     db.query.mockResolvedValueOnce([]);

  //     const req = { user: { id: 1 }, body: { currentPassword: "123", newPassword: "456" } };
  //     const res = mockResponse();
  //     await changePassword(req, res, db, bcrypt);

  //     expect(res.json).toHaveBeenCalledWith({ message: "Mot de passe modifié avec succès" });
  //   });
});
