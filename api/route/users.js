import express from "express";
import User from "../model/users.js";
import CustomError from "../core/error.js";
import Auth from "../middleware/auth.js";
const router = express.Router();

// Retorna as próprias informações.
router.get("/user",  async (req, res) => {
  try {
    await Auth.check(req);

    const check = req.check;
    if(!check.user) throw check;

    const user = await check.user.get();
    res.status(200).json(user);

  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Failed to retrieve user data.";
    console.log({ "Status" : code, "Message" : msg, "Data": error.data || "No Data"}, error);
    res.status(code).json({ "message":msg });
  }
});

// Busca por usuários
router.get("/:name", async (req, res) => {
  try {
    const users = await User.getByNickname(req.params.name);
    res.status(200).json(users);

  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Failure to retrieve users.";
    // console.log({ "Status" : code, "Message" : msg, "Data": error.data || "No Data"}, error);
    res.status(code).json({ "message":msg });
  }
});

router.put("/user", async (req, res) => {
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

    console.log(updateData)

    const user = await new User({
      id: check.user.id,
      nickname: updateData.nickname || undefined,
      profilePicture: updateData.pfp || undefined,
      prefLanguage: updateData.prefLanguage || undefined
    }).update();

    res.status(200).json({ "message": "User has been updated", "user": user });
    
  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Failed to update user.";
    //console.log({ "Status": code, "Message": msg, "Data": error.data || "No Data" }, error);
    res.status(code).json({ "message": msg });
  }
});


router.delete("/user", async (req, res) => {
  try {
    await Auth.check(req);

    const check = req.check;
    if(!check.user) throw check;
    
    await check.user.delete();
    res.status(200).json({"message": "User has been deleted."});

  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Failed to delete user.";
    //console.log({ "Status" : code, "Message" : msg, "Data": error.data || "No Data"}, error);
    res.status(code).json({ "message":msg });
  }
});

router.post("/login", async (req, res) => {
  try {
    const login = await Auth.login(req);
    res.status(login.code).json( { "token":login.token, "message": login.message } );

  } catch (error) {
    const code = error.code ?? 500;
    const msg = error.message ?? "Login failed";
    console.log({ "Status" : code, "Message" : msg, "Data": error.data || "No Data"});
    res.status(code).json({ "message":msg });
  }
});

export default router;