import express from "express";
import User from "../model/users.js";
import CustomError from "../core/error.js";
import Auth from "../middleware/auth.js";
const router = express.Router();

// Retorna as próprias informações.
router.get("/users", Auth.check, async (req, res) => {
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
    const code = error.code ?? 500;
    const msg = error.message ?? "Failed to check user";
    throw new CustomError(code, msg, error.data);
  }
});

router.put("/users", Auth.check, async (req, res) => {
  try {
    if (!req.user) throw new CustomError(401, "Missing JWT");
    const jwt = req.user;

    const updateData = {};
    //TODO !== ''
        const updateData = {};
        if (req.body.nickname !== undefined && req.body.nickname !== '') updateData.nickname = req.body.nickname;
        if (req.body.pfp !== undefined && req.body.pfp !== '') updateData.profile_picture = req.body.profile_picture;
        if (req.body.prefLanguage !== undefined && req.body.prefLanguage !== '') {
            const prefLanguage = req.body.prefLanguage;
            if(prefLanguage === 'c' || prefLanguage === 'python' || prefLanguage === 'blocks' ) updateData.pref_language = prefLanguage;
        };
    
        const isEmpty = (obj) => JSON.stringify(obj) === '{}';
        if(isEmpty(updateData)) throw new CustomError(400, "No data was sent");

        await new User({
            id: jwt.user.id,
            nickname: updateData.nickname ?? null,
            profile_picture: updateData.pfp ?? null,
            pref_language: updateData.pref_language ?? null
        }).update();
        res.status.(200).send("User has been updated");
    
  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Failed to update user";
    throw new CustomError(code, msg, error.data);
  }
});

router.delete("/users", Auth.check, async (req, res) => {
  try {
    const jwt = req.user;
    await new User({ id: jwt.id }).delete();
    res.status(200).send(`User ${jwt.id} has been deleted`);
  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Failed to delete user";
    throw new CustomError(code, msg, error.data);
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
    res.status(200).send({
      users,
      message: "User found!",
    });
  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Failed to search user";
    throw new CustomError(code, msg, error.data);
  }
});


router.post("/login", async (req, res) => {
  try {
    await Auth.login(req, res);
  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Login failed";
    throw new CustomError(code, msg, error.data);
  }

    }
});

export default router;
