const tap = require("tap");
const supertest = require("supertest");
const app = require("../app");
const server = supertest(app);

tap.test("POST /tasks", async (t) => {
  const newTask = {
    title: "New Task",
    description: "New Task Description",
    completed: false,
  };
  const response = await server.post("/tasks").send(newTask);
  t.equal(response.status, 201);
  t.end();
});

tap.test("POST /tasks with invalid data", async (t) => {
  const newTask = {
    title: "New Task",
  };
  const response = await server.post("/tasks").send(newTask);
  t.equal(response.status, 400);
  t.end();
});

tap.test("POST /tasks with empty title", async (t) => {
  const newTask = {
    title: "   ",
    description: "Task Description",
    completed: false,
  };
  const response = await server.post("/tasks").send(newTask);
  t.equal(response.status, 400);
  t.end();
});

tap.test("GET /tasks", async (t) => {
  const response = await server.get("/tasks");
  t.equal(response.status, 200);
  t.hasOwnProp(response.body[0], "id");
  t.hasOwnProp(response.body[0], "title");
  t.hasOwnProp(response.body[0], "description");
  t.hasOwnProp(response.body[0], "completed");
  t.hasOwnProp(response.body[0], "priority");
  t.hasOwnProp(response.body[0], "createdAt");
  t.type(response.body[0].id, "number");
  t.type(response.body[0].title, "string");
  t.type(response.body[0].description, "string");
  t.type(response.body[0].completed, "boolean");
  t.end();
});

tap.test("GET /tasks filters by completed status", async (t) => {
  const response = await server.get("/tasks?completed=false");
  t.equal(response.status, 200);
  t.ok(response.body.every((task) => task.completed === false));
  t.end();
});

tap.test("GET /tasks sorts by created date", async (t) => {
  const response = await server.get("/tasks?sortBy=createdAt&order=desc");
  t.equal(response.status, 200);
  t.ok(new Date(response.body[0].createdAt) >= new Date(response.body[1].createdAt));
  t.end();
});

tap.test("GET /tasks/priority/:level", async (t) => {
  await server.post("/tasks").send({
    title: "Priority Task",
    description: "Task with high priority",
    completed: false,
    priority: "high",
  });

  const response = await server.get("/tasks/priority/high");
  t.equal(response.status, 200);
  t.ok(response.body.every((task) => task.priority === "high"));
  t.end();
});

tap.test("GET /tasks/priority/:level with invalid priority", async (t) => {
  const response = await server.get("/tasks/priority/urgent");
  t.equal(response.status, 400);
  t.end();
});

tap.test("GET /tasks/:id", async (t) => {
  const response = await server.get("/tasks/1");
  t.equal(response.status, 200);
  const expectedTask = {
    id: 1,
    title: "Set up environment",
    description: "Install Node.js, npm, and git",
    completed: true,
  };
  t.match(response.body, expectedTask);
  t.end();
});

tap.test("GET /tasks/:id with invalid id", async (t) => {
  const response = await server.get("/tasks/999");
  t.equal(response.status, 404);
  t.end();
});

tap.test("PUT /tasks/:id", async (t) => {
  const updatedTask = {
    title: "Updated Task",
    description: "Updated Task Description",
    completed: true,
    priority: "low",
  };
  const response = await server.put("/tasks/1").send(updatedTask);
  t.equal(response.status, 200);
  t.equal(response.body.priority, "low");
  t.end();
});

tap.test("PUT /tasks/:id with invalid id", async (t) => {
  const updatedTask = {
    title: "Updated Task",
    description: "Updated Task Description",
    completed: true,
  };
  const response = await server.put("/tasks/999").send(updatedTask);
  t.equal(response.status, 404);
  t.end();
});

tap.test("PUT /tasks/:id with invalid data", async (t) => {
  const updatedTask = {
    title: "Updated Task",
    description: "Updated Task Description",
    completed: "true",
  };
  const response = await server.put("/tasks/1").send(updatedTask);
  t.equal(response.status, 400);
  t.end();
});

tap.test("PUT /tasks/:id with empty description", async (t) => {
  const updatedTask = {
    title: "Updated Task",
    description: "",
    completed: true,
  };
  const response = await server.put("/tasks/1").send(updatedTask);
  t.equal(response.status, 400);
  t.end();
});

tap.test("DELETE /tasks/:id", async (t) => {
  const response = await server.delete("/tasks/1");
  t.equal(response.status, 200);
  t.end();
});

tap.test("DELETE /tasks/:id with invalid id", async (t) => {
  const response = await server.delete("/tasks/999");
  t.equal(response.status, 404);
  t.end();
});

