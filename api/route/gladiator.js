import express from "express";
import Gladiator from "../model/gladiator.js";

const router = express.Router();

const gladiator = new Gladiator({});

router.get("/:name", async (request, reply) => { 
  try {
    const { name } = request.params; 
    const result = await gladiator.getByName(name); 

    if (!result) {
      reply.status(404).json({ error: "User not found" }); 
      return;
    }

    reply.json(result);
  } catch (error) {
    reply.status(error.code || 500).json({ message: error.message || "Internal server error" });
  }
});

router.get("/master/:master", async (request, reply) => { 
  try {
    const { master } = request.params; 
    const result = await gladiator.getByMaster(master); 

    if (!result) {
      reply.status(404).json({ error: "User not found" }); 
      return;
    }

    reply.json(result);
  } catch (error) {
    reply.status(error.code || 500).json({ message: error.message || "Internal server error" });
  }
});


export default router;
