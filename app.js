const express = require('express');
const taskData = require('./task.json');

const app = express();
const port = 3000;
const priorities = ['low', 'medium', 'high'];
let tasks = taskData.tasks.map((task, index) => ({
    ...task,
    priority: task.priority || 'medium',
    createdAt: task.createdAt || new Date(2026, 0, index + 1).toISOString(),
}));
let nextId = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function isValidTask(task) {
    return task
        && typeof task.title === 'string'
        && task.title.trim() !== ''
        && typeof task.description === 'string'
        && task.description.trim() !== ''
        && typeof task.completed === 'boolean'
        && (task.priority === undefined || priorities.includes(task.priority));
}

function isValidTaskUpdate(task) {
    if (!task || Object.keys(task).length === 0) {
        return false;
    }

    if (task.title !== undefined && (typeof task.title !== 'string' || task.title.trim() === '')) {
        return false;
    }

    if (task.description !== undefined && (typeof task.description !== 'string' || task.description.trim() === '')) {
        return false;
    }

    if (task.completed !== undefined && typeof task.completed !== 'boolean') {
        return false;
    }

    if (task.priority !== undefined && !priorities.includes(task.priority)) {
        return false;
    }

    return true;
}

function getTaskId(id) {
    const taskId = Number(id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return null;
    }

    return taskId;
}

app.get('/tasks', (req, res) => {
    let result = [...tasks];

    if (req.query.completed !== undefined) {
        if (req.query.completed !== 'true' && req.query.completed !== 'false') {
            return res.status(400).json({ message: 'Completed must be true or false' });
        }

        const completed = req.query.completed === 'true';
        result = result.filter((task) => task.completed === completed);
    }

    if (req.query.sortBy === 'createdAt') {
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (req.query.order === 'desc') {
            result.reverse();
        }
    }

    res.status(200).json(result);
});

app.get('/tasks/priority/:level', (req, res) => {
    const level = req.params.level;

    if (!priorities.includes(level)) {
        return res.status(400).json({ message: 'Invalid priority level' });
    }

    const filteredTasks = tasks.filter((task) => task.priority === level);
    return res.status(200).json(filteredTasks);
});

app.get('/tasks/:id', (req, res) => {
    const id = getTaskId(req.params.id);

    if (!id) {
        return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = tasks.find((item) => item.id === id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(task);
});

app.post('/tasks', (req, res) => {
    if (!isValidTask(req.body)) {
        return res.status(400).json({ message: 'Invalid task data' });
    }

    const newTask = {
        id: nextId,
        title: req.body.title.trim(),
        description: req.body.description.trim(),
        completed: req.body.completed,
        priority: req.body.priority || 'medium',
        createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    nextId += 1;

    return res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
    const id = getTaskId(req.params.id);

    if (!id) {
        return res.status(400).json({ message: 'Invalid task id' });
    }

    const taskIndex = tasks.findIndex((item) => item.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (!isValidTaskUpdate(req.body)) {
        return res.status(400).json({ message: 'Invalid task data' });
    }

    if (req.body.title !== undefined) {
        tasks[taskIndex].title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
        tasks[taskIndex].description = req.body.description.trim();
    }

    if (req.body.completed !== undefined) {
        tasks[taskIndex].completed = req.body.completed;
    }

    if (req.body.priority !== undefined) {
        tasks[taskIndex].priority = req.body.priority;
    }

    return res.status(200).json(tasks[taskIndex]);
});

app.delete('/tasks/:id', (req, res) => {
    const id = getTaskId(req.params.id);

    if (!id) {
        return res.status(400).json({ message: 'Invalid task id' });
    }

    const taskIndex = tasks.findIndex((item) => item.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    return res.status(204).send();
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}


module.exports = app;
