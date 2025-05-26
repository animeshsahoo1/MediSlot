import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPatient, getPatientDetails } from "../controllers/patient.controller.js";
import { authorizeRole } from "../middlewares/authorizeRole.middleware.js";

const router=Router()

router.route("/create-patient").post(verifyJWT, authorizeRole("patient"), createPatient)
router.route("/get-patient-details").get(verifyJWT,authorizeRole("patient"), getPatientDetails)


export default router