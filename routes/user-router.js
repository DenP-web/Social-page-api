const { Router } = require("express");
const path = require('path')
const userRouter = Router();
const { UserController } = require("../controllers");
const authCheck = require("../middleware/authCheck");
const multer = require('multer')

const uploadDestination = path.resolve(__dirname, '../uploads');
console.log(uploadDestination)

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
userRouter.post("/logout", authCheck, UserController.logout);
userRouter.get("/current", authCheck, UserController.current);
userRouter.get("/:id", authCheck, UserController.getUserById);
userRouter.put("/:id", authCheck, uploads.single('avatar'), UserController.updateUser);

module.exports = userRouter;
