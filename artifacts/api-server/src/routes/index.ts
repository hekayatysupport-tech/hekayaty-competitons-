import { Router, type IRouter } from "express";
import healthRouter from "./health";
import uploadRouter from "./upload";
import adminAuthRouter from "./adminAuth";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/upload", uploadRouter);
router.use("/admin/auth", adminAuthRouter);

export default router;
