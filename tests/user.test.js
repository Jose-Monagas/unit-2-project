const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const server = app.listen(8080, () => console.log("Let's get ready to test"));
const User = require("../models/user");
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connect.close();
  mongoServer.stop();
  server.close();
});

describe("Test the users endpoints", () => {
  test("It should create a new user", async () => {
    const response = await request(app).post("/users").send({
      name: "Mel",
      email: "melb@gmail.com",
      password: "test",
      age: 23,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.user.name).toEqual("Mel");
    expect(response.body.user.email).toEqual("melb@gmail.com");
    expect(response.body.user.age).toEqual(23);
    expect(response.body).toHaveProperty("token");
  });
  test("It should allow a user to login", async () => {
    const user = new User({
      name: "Leo",
      email: "leo@gmail.com",
      password: "test1234",
    });
    await user.save();
    const response = await request(app).post("/users").send({
      name: "Leo",
      email: "leo@gmail.com",
      password: "test1234",
    });

    expect(response.body.user.email).toEqual(user.email);
    expect(response.statusCode).toBe(200);
    expect(response.body.user.name).toEqual(user.name);
    expect(response.body).toHaveProperty("token");
  });
  test("It should updat a user", async () => {
    const user = new User({
      name: "Katya",
      email: "katyazamo@outlook.com",
      password: "password",
    });
    await user.save();
    const token = await user.generateAuthToken();

    const response = await request(app)
      .put(`/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Kimchi", email: "kimchi@gmail.com" });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toEqual("Kimchi");
    expect(response.body.email).toEqual("kimchi@gmail.com");
  });

  test("It should delete a user", async () => {
    const user = new User({
      name: "Lemon",
      email: "lemon@gmail.com",
      password: "lemonada",
    });
    await user.save();
    const token = await user.generateAuthToken();

    const response = await request(app)
      .delete(`/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
  });
});
