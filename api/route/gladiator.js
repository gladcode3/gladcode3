import express from "express";
import Gladiator from "../model/gladiator.js";
import Auth from '../middleware/auth.js';
const router = express.Router();

const gladiator = new Gladiator({});

// Separei cod e nome pra usar name para pesquisa e cod para edição (pois é único)
router.get("/name/:name", async (request, reply) => {
  const { name } = request.params;
  const result = await gladiator.getByName(name);

  if (!result) {
    reply.status(404).json({ error: "Gladiator not found" });
    return;
  }

  reply.json(result);
});

router.get("/cod/:cod", async (request, reply) => {
  const { cod } = request.params;
  const result = await gladiator.getByCod(cod);

  if (!result) {
    reply.status(404).json({ error: "Gladiator not found" });
    return;
  }

  reply.json(result);
});

router.get("/master", async (req, res, next) => {
  try {
    await Auth.check(req);
    const check = req.check;

    if (!check.user) throw check;
    const query = await gladiator.getByMaster(check.user.id);
    
    res.status(200).json(query);

  } catch (error) {
    next(error);
  }
});

router.get("/master/:master/count", async (request, reply) => {
  const { master } = request.params;
  const result = await gladiator.checkGladiatorsNumberByMaster(master);

  if (!result) {
    reply.status(404).json({ error: "User not found" });
    return;
  }

  reply.json(result);
});


export default router;
