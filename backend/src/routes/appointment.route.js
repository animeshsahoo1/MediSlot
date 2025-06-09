import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizeRole.middleware.js"
import { bookAppointment, deleteAppointment, fetchAppointments, payUsingStripe } from "../controllers/appointment.controller.js";

const router=Router()

router.get("/fetch", fetchAppointments); 
router.post("/:doctorId/book", verifyJWT,authorizeRole("patient"), bookAppointment);
router.delete("/:appointmentId", verifyJWT, deleteAppointment);
router.post("/:appointmentId/checkout", verifyJWT, payUsingStripe);




export default router