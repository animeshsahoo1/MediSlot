import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import  authorizeRole  from "../middlewares/authorizeRole.middleware.js";
import { createHospital, deleteHospital, getAllHospitals, getHospitalById, updateHospital } from "../controllers/hospital.controller.js";

const router= Router()


router.route("/get-all-hospital").get(getAllHospitals)
router.route("/:hospitalId").get( getHospitalById)

//authorized routes
router.route("/create-hospital").post(verifyJWT,authorizeRole("hospital"), createHospital)
router.route("/update-hospital").patch(verifyJWT,authorizeRole("hospital"), updateHospital)
router.route("/delete-hospital").get(verifyJWT,authorizeRole("hospital"), deleteHospital)


export default router