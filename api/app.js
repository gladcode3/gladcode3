import express from 'express';
import errors from './middleware/errors.js';
import newsRouter from './route/news.js'
import usersRouter from './route/users.js'

const port = 3000;
const host = '0.0.0.0';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
    res.send({ message: 'Hello World!' });
});

app.use('/news', newsRouter);
app.use('/users', usersRouter);

// error handling
app.use(errors);

app.use((req, res) => {
    res.status(404).send({ message: 'Not found' });
});

app.listen(port, host, () => {
    console.log(`Web Server running at http://${host}:${port}/`);
});


