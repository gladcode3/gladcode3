import express from 'express';
import cors from 'cors';
import errors from './middleware/errors.js';
import newsRouter from './route/news.js';
import usersRouter from './route/users.js';
import rankRouter from './route/rank.js';

const port = 3000;
const host = '0.0.0.0';
const app = express();

const allowedOrigins = [ 'https://localtest.me', 'https://api.localtest.me' ]

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
}));

app.get('/', async (req, res) => {
    res.send({ message: 'Hello World!' });
});

app.use('/news', newsRouter);
app.use('/users', usersRouter);
app.use('/rank', rankRouter);

// error handling
app.use(errors);

app.use((req, res) => {
    res.status(404).send({ message: 'Not found' });
});

app.listen(port, host, () => {
    console.log(`Web Server running at http://${host}:${port}/`);
});


