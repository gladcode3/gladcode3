import express from "express";
import User from "../model/users.js";
import CustomError from "../core/error.js";
// import Auth from "../middleware/auth.js";
const router = express.Router();

// Registra usuários
const user = new User({});
// router.get("/", /* Auth.check, */ async (req, res) => {
//   try {
//     const jwt = req.user;
//     const user = await new User({
//       id: jwt.id,
//     }).get();

//     // Se o usuário for encontrado, retorna um status 200 OK
//     res.status(200).json(user);

//     // Tratar individualmente erro na query do banco, se o usuário não for encontrado, retorna um status 404 (Not Found)
//     if (!user) {
//       return res.status(404).send({
//         message: "Usuário não encontrado",
//       });
//     }
//   } catch (error) {
//     // tratar erro interno para separar de um simples erro de query e enviar erro para o frontend para mostrar quando necessário, além de melhor debug, se quiser mandar com status enviar status 500 (internal server error)
//     res.status(500).send(error);
//   }
// });

//Atualiza usuários
//Por algum motivo a função precisa de um email, mesmo se estiver vazio
router.put(
  "/",
  /* Auth.check, */ async (req, res, next) => {
    try {
      if (!req.user) throw new CustomError(401, "Missing JWT");
      const jwt = req.user;

      const { email, nickname, firstName, lastName } = req.body;

      if (email !== undefined && email !== null) updateData.email = email;
      if (nickname !== undefined && nickname !== null)
        updateData.nickname = nickname;
      if (firstName !== undefined && firstName !== null)
        updateData.firstName = firstName;
      if (lastName !== undefined && lastName !== null)
        updateData.lastName = lastName;

      await new User({
        id: jwt.id,
        email,
        nickname,
        firstName,
        lastName,
      }).update();
      res.send("User has been updated");
    } catch (error) {
      let code = error.code ?? 500;
      let message = error.message ?? "Internal server error";
      throw new CustomError(code, message);
    }
  }
);

router.delete(
  "/",
  /* Auth.check, */ async (req, res, next) => {
    try {
      const jwt = req.user;
      await new User({ id: jwt.id }).delete();
      res.send(`User ${jwt.id} has been deleted`);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (_, reply) => {
  try {
    const list = await user.getNameList();
    reply.json(list);
  } catch (error) {
    console.log(error);
  }
});

// Busca por usuários
router.get("/nickname/:nickname", async (req, res) => {
  const { nickname } = req.params;
  const users = await user.getByNickname(nickname);

  if (!users) {
    res.status(404).send({
      message: "user not found",
    });
  }

  res.json(users);
});

// Busca por usuários
router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  const users = await user.getById(id);

  if (!users) {
    res.status(404).send({
      message: "user not found",
    });
  }
  res.json(users);
});

router.post("/login", async (req, res, next) => {
  try {
    const login = await Auth.login(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
