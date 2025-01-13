import express from "express";
import User from "../model/users.js";
import CustomError from "../core/error.js";
import Auth from "../middleware/auth.js";
const router = express.Router();

// Retorna as próprias informações.
router.get("/user",  async (req, res, next) => {
  try {
    await Auth.check(req);

    const check = req.check;
    if(!check.user) throw check;

    const user = await check.user.get();
    res.status(200).json(user);

  } catch (error) {
    next(error);
  }
});

// Busca por usuários
router.get("/:name", async (req, res, next) => {
  try {
    const users = await User.getByNickname(req.params.name);
    res.status(200).json(users);

  } catch (error) {
    next(error);
  }
});

router.put("/user", async (req, res, next) => {
  try {
    await Auth.check(req);

    const check = req.check;
    if (!check.user) throw check;

    const updateData = {};
    const isValid = (value, key) => {
      if (key === 'pref_language') {
        if (value === 'c' || value === 'python' || value === 'blocks') updateData[key] = value;
      }
      else if (value !== undefined && value !== null && value !== '') updateData[key] = value;
    };

    isValid(req.body.nickname, 'nickname');
    isValid(req.body.pfp, 'pfp');
    isValid(req.body.prefLanguage, 'prefLanguage');

    const isEmpty = (obj) => Object.keys(obj).length === 0;
    if (isEmpty(updateData)) throw new CustomError(400, "No data was sent");

    const user = await new User({
      id: check.user.id,
      nickname: updateData.nickname || undefined,
      profilePicture: updateData.pfp || undefined,
      prefLanguage: updateData.prefLanguage || undefined
    }).update();

    res.status(200).json({ "message": "User has been updated", "user": user });
    
  } catch (error) {
    next(error);
  }
});


router.delete("/user", async (req, res, next) => {
  try {
    await Auth.check(req);

    const check = req.check;
    if(!check.user) throw check;
    
    await check.user.delete();
    res.status(200).json({"message": "User has been deleted."});

  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const login = await Auth.login(req);
    res.status(login.code).json( { "token":login.token, "message": login.message } );

  } catch (error) {
    next(error);
  }
});

export default router;