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
router.put("/", /* Auth.check, */ async (req, res, next) => {
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
    next(error);
  }
});

router.delete("/", /* Auth.check, */ async (req, res, next) => {
  try {
    const jwt = req.user;
    await new User({ id: jwt.id }).delete();
    res.send(`User ${jwt.id} has been deleted`);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (request, reply) => {
  const list = await user.getNameList()
  reply.json(list)
})

// Busca por usuários
router.get("/:nickname", async (req, res) => {
  try {
    const { nickname } = req.params;
    const users = await user.getByNickname(nickname);

    if(!users){
      throw new CustomError(404, "user not found");
    }
    res.json(users);

  } catch (error) {
    let code = error.code ?? 404
    let message = error.message ?? "Internal server error"
    throw new CustomError(code, message);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const login = await Auth.login(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
