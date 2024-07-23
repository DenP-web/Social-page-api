const { Router } = require("express");
const userRouter = Router();
const { UserController } = require("../controllers");
const authCheck = require("../middleware/authCheck");
const multer = require('multer')

const uploadDestination = "uploads";

// Show, where consist static files
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, next) {
    next(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

userRouter.post("/register", UserController.register);
userRouter.post("/login", UserController.login);
userRouter.get("/current", authCheck, UserController.current);
userRouter.get("/:id", authCheck, UserController.getUserById);
userRouter.put("/:id", authCheck, uploads.single('avatar'), UserController.updateUser);

module.exports = userRouter;
