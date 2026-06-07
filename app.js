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
let nextId = Math.max(...tasks.map((task) => task.id)) + 1;

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

app.get('/tasks', (req, res) => {
    let result = [...tasks];

    if (req.query.completed === 'true') {
        result = result.filter((task) => task.completed === true);
    }

    if (req.query.completed === 'false') {
        result = result.filter((task) => task.completed === false);
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
    const id = Number(req.params.id);
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
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex((item) => item.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (!isValidTask(req.body)) {
        return res.status(400).json({ message: 'Invalid task data' });
    }

    tasks[taskIndex] = {
        id,
        title: req.body.title.trim(),
        description: req.body.description.trim(),
        completed: req.body.completed,
        priority: req.body.priority || tasks[taskIndex].priority,
        createdAt: tasks[taskIndex].createdAt,
    };

    return res.status(200).json(tasks[taskIndex]);
});

app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex((item) => item.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    const deletedTask = tasks.splice(taskIndex, 1);
    return res.status(200).json(deletedTask[0]);
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
