const { Router } = require("express");
const authCheck = require("../middleware/authCheck");
const { LikeController } = require("../controllers");

const likeRouter = Router();

likeRouter.post("/", authCheck, LikeController.create);
likeRouter.delete("/:id", authCheck, LikeController.delete);

module.exports = likeRouter