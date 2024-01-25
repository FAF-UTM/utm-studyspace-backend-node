const { register, login, googleLogin } = require("../controllers/authControllers");
const { checkUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/dashboard", checkUser);
router.post("/register", register);
router.post("/login", login);

router.post("/google-login", googleLogin);

module.exports = router;
