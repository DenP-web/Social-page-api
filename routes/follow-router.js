const { Router } = require("express");
const followRouter = Router();
const authCheck = require("../middleware/authCheck");
const { FollowController } = require("../controllers");

followRouter.post("/", authCheck, FollowController.create);
followRouter.delete("/:id", authCheck, FollowController.delete);

module.exports = followRouter;
