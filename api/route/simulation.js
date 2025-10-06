import session from 'express-session';

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUnintialized: true,
    cookie: { secure: false}
}));