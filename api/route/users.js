import express from "express";
import User from "../model/users.js";
import CustomError from "../core/error.js";
import Auth from "../middleware/auth.js";
const router = express.Router();

// Registra usuários
router.get("/", Auth.check, async (req, res) => {
  try {
    const jwt = req.user;
    const user = await new User({
      id: jwt.id,
    }).get();

    if (!user) {
      throw new CustomError(404, "user check failed");
    }

    res.status(200).json(user);
  } catch (error) {
    throw new CustomError(500, "Internal Server Error", error.message);
  }
});

//Atualiza usuários
//Por algum motivo a função precisa de um email, mesmo se estiver vazio
router.put("/", Auth.check, async (req, res) => {
  try {
    if (!req.user) throw new CustomError(401, "Missing JWT");
    const jwt = req.user;

    const updateData = {};
    if (req.body.email !== undefined && req.body.email !== null)
      updateData.email = req.body.email;
    if (req.body.nickname !== undefined && req.body.nickname !== null)
      updateData.nickname = req.body.nickname;
    if (req.body.firstName !== undefined && req.body.firstName !== null)
      updateData.firstName = req.body.firstName;
    if (req.body.lastName !== undefined && req.body.lastName !== null)
      updateData.lastName = req.body.lastName;

    await new User({
      id: jwt.id,
      email: updateData.email,
      nickname: updateData.nickname,
      firstName: updateData.firstName,
      lastName: updateData.lastName,
    }).update();
    res.send("User has been updated");
  } catch (error) {
    throw new CustomError(500, "Internal Server Error", error.message);
  }
});

router.delete("/", Auth.check, async (req, res) => {
  try {
    const jwt = req.user;
    await new User({ id: jwt.id }).delete();
    res.status(200).send(`User ${jwt.id} has been deleted`);
  } catch (error) {
    throw new CustomError(500, "Internal Server Error", error.message);
  }
});

// Busca por usuários
router.get("/:name", async (req, res) => {
  try {
    const users = await new User({
      name: req.params.name,
    }).getNameList();

    if (!users || users.length === 0) {
      throw new CustomError(404, "User not found");
    }
    res.send({
      users,
      message: "User found!",
    });
  } catch (error) {
    throw new CustomError(500, "Internal Server Error", error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    await Auth.login(req, res);
  } catch (error) {
    throw new CustomError(500, "Internal Server Error", error.message);
  }
});

export default router;
