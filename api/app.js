import express from "express";
import cors from "cors";
import errors from "./middleware/errors.js";
import newsRouter from './route/news.js';
import rankRouter from './route/rank.js';
import usersRouter from "./route/users.js";
import gladiatorRouter from "./route/gladiator.js";
import reportRouter from "./route/report.js";

const port = 3000;
const host = "0.0.0.0";
const app = express();

const allowedOrigins = [
  "https://localtest.me",
  "https://api.localtest.me",
  "https://gc3lapi.werlang.site",
  "https://gc3gweb.werlang.site",
];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.get("/", async (req, res) => {
  res.send({ message: "Hello World!" });
});

app.use('/news', newsRouter);
app.use("/users", usersRouter);
app.use("/gladiators", gladiatorRouter);
app.use('/rank', rankRouter);
app.use('/report', reportRouter);

// error handling
app.use((err, req, res, next) => {
  const code = err.code || 500;
  const message = err.message || "Internal Server Error";
  //console.log({ code: err.code, message: err.message,  data: err.data });
  res.status(code).json({ "message": message });
});

app.use((req, res) => {
  res.status(404).send({ message: "Page not found." });
});

app.listen(port, host, () => {
  console.log(`Web Server running at http://${host}:${port}/`);
});
