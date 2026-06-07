# Task Manager API

This is a simple RESTful API built with Node.js and Express.js for managing tasks. It uses in-memory storage, so the data resets when the server restarts.

The API supports creating, reading, updating, deleting, filtering, sorting, and checking tasks by priority.

## Task Schema

```json
{
  "id": 1,
  "title": "Create a new project",
  "description": "Create a new project using Magic",
  "completed": false,
  "priority": "medium",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

## Setup Instructions

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node app.js
```

The server will run on:

```text
http://localhost:3000
```

Run tests:

```bash
npm run test
```

## API Endpoints

### Get All Tasks

```http
GET /tasks
```

Example:

```bash
curl http://localhost:3000/tasks
```

### Filter Tasks by Completed Status

```http
GET /tasks?completed=true
GET /tasks?completed=false
```

Example:

```bash
curl "http://localhost:3000/tasks?completed=false"
```

### Sort Tasks by Creation Date

```http
GET /tasks?sortBy=createdAt
GET /tasks?sortBy=createdAt&order=desc
```

Example:

```bash
curl "http://localhost:3000/tasks?sortBy=createdAt&order=desc"
```

### Get Task by ID

```http
GET /tasks/:id
```

Example:

```bash
curl http://localhost:3000/tasks/1
```

If the task does not exist, the API returns `404`.

### Create a Task

```http
POST /tasks
```

Body:

```json
{
  "title": "New Task",
  "description": "New Task Description",
  "completed": false,
  "priority": "high"
}
```

Example:

```bash
curl -X POST http://localhost:3000/tasks ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"New Task\",\"description\":\"New Task Description\",\"completed\":false,\"priority\":\"high\"}"
```

If `priority` is not provided, it defaults to `medium`.

### Update a Task

```http
PUT /tasks/:id
```

Body:

```json
{
  "title": "Updated Task",
  "description": "Updated Task Description",
  "completed": true,
  "priority": "low"
}
```

Example:

```bash
curl -X PUT http://localhost:3000/tasks/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Updated Task\",\"description\":\"Updated Task Description\",\"completed\":true,\"priority\":\"low\"}"
```

If the task does not exist, the API returns `404`.

### Delete a Task

```http
DELETE /tasks/:id
```

Example:

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

If the task does not exist, the API returns `404`.

### Get Tasks by Priority

```http
GET /tasks/priority/:level
```

Allowed priority levels:

- `low`
- `medium`
- `high`

Example:

```bash
curl http://localhost:3000/tasks/priority/high
```

Invalid priority levels return `400`.

## Validation Rules

- `title` is required and cannot be empty.
- `description` is required and cannot be empty.
- `completed` must be a boolean value: `true` or `false`.
- `priority` must be `low`, `medium`, or `high` if provided.

Invalid input returns `400 Bad Request`.

## Testing with Postman

1. Start the server with `node app.js`.
2. Open Postman.
3. Use `http://localhost:3000` as the base URL.
4. Select the request method, such as `GET`, `POST`, `PUT`, or `DELETE`.
5. For `POST` and `PUT`, go to **Body**, choose **raw**, select **JSON**, and enter the request body.
6. Click **Send** and check the response status code and JSON response.

Example Postman request:

```text
POST http://localhost:3000/tasks
```

Body:

```json
{
  "title": "Test from Postman",
  "description": "Checking the API",
  "completed": false,
  "priority": "medium"
}
```
