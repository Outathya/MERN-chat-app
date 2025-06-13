import express from "express"
import { signup, login, logout,updateprofile, checkAuth} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/signup", signup );
router.post("/login", login );
router.post("/logout", logout );

router.put("/update-profile", protectRoute, updateprofile);  // protectroute  is middleware funtion that  will check if user is loged in or authenticated the only updated profile function is calles to update the profile

router.get("/check", protectRoute, checkAuth);
export default router;