const { Router } = require("express");
const authCheck = require("../middleware/authCheck");
const { PostController } = require("../controllers");


const postsRouter = Router();

postsRouter.post("/", authCheck, PostController.create);
postsRouter.get("/", authCheck, PostController.getAll);
postsRouter.get("/:id", authCheck, PostController.getById);
postsRouter.delete("/:id", authCheck, PostController.delete);

module.exports = postsRouter;
