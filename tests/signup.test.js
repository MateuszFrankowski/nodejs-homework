const request = require("supertest");
const express = require("express");

const authFnc = require("../modules/user/controller.js");
const mongoose = require("mongoose");
const app = express();

import dotenv from "dotenv";
dotenv.config();

// create a router for the auth routes
const authRouter = express.Router();

// define routes in authRouter
authRouter.post("/signup", async (req, res) => {
  authFnc.signup(req, res);
});

authRouter.post("/login", async (req, res) => {
  authFnc.login(req, res);
});

app.use("/api/auth", authRouter);

describe("Test the auth routes", () => {
  let server;
  beforeAll(async () => {
    const PORT = process.env.PORT || 3000;
    const uriDb = process.env.DB_HOST;
    mongoose.Promise = global.Promise;
    await mongoose.connect(uriDb, {
      dbName: `db-contacts`,
    });
    process.on("SIGINT", () => {
      mongoose.disconnect();
      console.log("Database disconnected!");
    });

    server = app.listen(PORT, () => {
      console.log(`Connected to the database.`);
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user", async () => {
      const res = await request(app).post("/signup").send({
        email: "testuser@example.com",
        password: "testpassword123",
      });
      console.log(res.body.url);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.user.email).toEqual("testuser@example.com");
    });

    it("should return an error if the email is already in use", async () => {
      const res = await request(app).post("/signup").send({
        email: "testuser@example.com",
        password: "testpassword123",
      });
      console.log(res.request.url);
      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toEqual("Email is already in use");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return a token and user object if login credentials are correct", async () => {
      const res = await request(app).post("/login").send({
        email: "testuser@example.com",
        password: "testpassword123",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toEqual("testuser@example.com");
      expect(res.body.data.user.subscription).toBeDefined();
    });

    it("should return an error if login credentials are incorrect", async () => {
      const res = await request(app).post("/login").send({
        email: "testuser@example.com",
        password: "wrongpassword",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("Incorrect login or password");
    });
  });
});
