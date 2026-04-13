import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = new AuthController();

router.post("/login", (req: Request, res: Response) => {
    return authController.login(req, res);
});

export default router;