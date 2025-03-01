import exprss from "express";
import { dealerRegister, registerUser, checkOtt, loginDealer, loginUser} from "../controllers/authController.js";

const authRouter = exprss.Router();

//  Register route
authRouter.post("/register-dealer", dealerRegister);
authRouter.post("/register-user", registerUser);
authRouter.post("/check-ott", checkOtt);

//Login route
authRouter.post("/login-dealer", loginDealer);
authRouter.post("/login-user", loginUser);

export default authRouter;
