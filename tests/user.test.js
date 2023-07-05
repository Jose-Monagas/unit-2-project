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
  await mongoose.connection.close();
  mongoServer.stop();
  server.close();
});
//  TEST USER ENDPOINTS
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

  test("it should allow a user to login", async () => {
    const user = new User({
      name: "luca",
      email: "luca1@gmail.com",
      password: "test",
    });
    await user.save();
    const response = await request(app)
      .post("/users/login")
      .send({ email: user.email, password: "test" });

    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toEqual("luca1@gmail.com");
    expect(response.body.user.name).toEqual("luca");
    expect(response.body).toHaveProperty("token");
  });

  test("It should update a user", async () => {
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

    expect(response.statusCode).toBe(200);
  });
});

// TEST TODOS ENDPOINTS
describe("Test the todos endpoints", () => {
  test("It should create a new todo", async () => {
    const user = new User({
      name: "luca",
      email: "maria@gmail.com",
      password: "test",
    });
    await user.save();
    const token = await user.generateAuthToken();

    const response = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "read", completed: true });
    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toEqual("read");
    expect(response.body.completed).toBe(true);
    expect(response.body.userEmail).toEqual("maria@gmail.com");
  });
});
