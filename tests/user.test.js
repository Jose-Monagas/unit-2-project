const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const server = app.listen(8080, () => console.log("Let's get ready to test"));
const User = require("../models/user");
const Todo = require("../models/todo");
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

  test("It should logout a user", async () => {
    //  create user
    const user = new User({
      name: "Leo",
      email: "leo@gmail.com",
      password: "lemonada",
    });
    await user.save();
    const token = await user.generateAuthToken();
    // call /user/login
    const login = await request(app)
      .post("/users/login")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: user.email, password: "lemonada" });

    // call user/logout
    let response = await request(app)
      .post("/users/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("User successfully logged out!");
    // call get/user/id to make sure isLoggedIn is set to false
    response = await request(app)
      .get("/users/" + user._id.toString())
      .set("Authorization", `Bearer ${token}`);

    expect(response.body.isLoggedIn).toEqual(false);
  });

  test("It should get a user by their user id", async () => {
    // create user
    const user = new User({
      name: "Ivan",
      email: "Ivan@gmail.com",
      password: "lemonada",
    });
    await user.save();

    // call get/user/id endpoint
    response = await request(app).get("/users/" + user._id.toString());

    expect(response.status).toBe(200);
    expect(response.body.name).toEqual(user.name);
    expect(response.body.email).toEqual(user.email);
    expect(response.body.password).toEqual(user.password);
    expect(response.body.todos).toEqual(user.todos);
    expect(response.body.isLoggedIn).toEqual(user.isLoggedIn);
  });
});

// TEST TODOS ENDPOINTS
describe("Test the todos endpoints", () => {
  test("It should create a new todo", async () => {
    // create new user
    const user = new User({
      name: "luca",
      email: "maria@gmail.com",
      password: "test",
    });
    await user.save();
    const token = await user.generateAuthToken();
    // create new todo
    const response = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "read", completed: true });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toEqual("read");
    expect(response.body.completed).toBe(true);
    expect(response.body.userEmail).toEqual("maria@gmail.com");
  });

  test("It should show all the todos from a user", async () => {
    // create new user
    const user = new User({
      name: "Paula",
      email: "Paula@gmail.com",
      password: "test",
    });

    await user.save();
    const token = await user.generateAuthToken();
    // create new todo
    const todo = new Todo({
      title: "chores",
      userEmail: "Paula@gmail.com",
      completed: false,
      priority: 3,
    });

    await todo.save();

    // Mocking the User.find() method to return the predefined
    Todo.find = jest.fn().mockResolvedValue(todo);

    // Sending a GET request to the /todos endpoint
    const response = await request(app)
      .get("/todos/user/" + user._id.toString())
      .set("Authorization", `Bearer ${token}`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body.title).toEqual(todo.title);
    expect(response.body.completed).toEqual(todo.completed);
    expect(response.body.priority).toEqual(todo.priority);
    expect(response.body.tags).toEqual(todo.tags);
    expect(response.body.userEmail).toEqual(todo.userEmail);
  });

  test("It should show all the unfinished todos from all users", async () => {
    // create new user
    const user = new User({
      name: "Raul",
      email: "Raula@gmail.com",
      password: "test",
    });

    await user.save();
    const token = await user.generateAuthToken();

    // create new completed todo
    const todo1 = new Todo({
      title: "ironing",
      userEmail: "Raula@gmail.com",
      completed: false,
      priority: 5,
    });

    // create new incompleted todo
    const todo2 = new Todo({
      title: "book flight",
      userEmail: "Raula@gmail.com",
      completed: true,
      priority: 3,
    });

    await todo1.save();
    await todo2.save();

    const response = await request(app)
      .get("/todos/unfinished")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.completed).toEqual(false);
  });

  test("It should delete a todo", async () => {
    // create new user
    const user = new User({
      name: "Pedro",
      email: "pedro@gmail.com",
      password: "test",
    });

    await user.save();
    const token = await user.generateAuthToken();

    // create new completed todo
    const todo = new Todo({
      title: "ironing",
      userEmail: "pedro@gmail.com",
      completed: true,
      priority: 1,
    });
    await todo.save();

    const response = await request(app)
      .delete("/todos/" + todo._id.toString())
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test("It should update a todo", async () => {
    // create new user
    const user = new User({
      name: "Tomoya",
      email: "tomoya@gmail.com",
      password: "test",
    });

    await user.save();
    const token = await user.generateAuthToken();

    // create new completed todo
    const todo = new Todo({
      title: "feed the dog",
      userEmail: "tomoya@gmail.com",
      completed: false,
      priority: 1,
    });
    await todo.save();

    const response = await request(app)
      .put(`/todos/${todo._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ priority: 0, completed: true });

    // console.log(todo);
    expect(response.statusCode).toBe(200);
    expect(response.body.priority).toEqual(0);
    expect(response.body.completed).toEqual(true);
  });
});
