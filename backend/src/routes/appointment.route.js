import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { bookAppointment, deleteAppointment, fetchAppointments, payUsingStripe } from "../controllers/appointment.controller.js";

const router=Router()

router.get("/fetch", fetchAppointments); 
router.post("/:doctorId/book", verifyJWT, bookAppointment);
router.delete("/:appointmentId", verifyJWT, deleteAppointment);
router.post("/:appointmentId/checkout", verifyJWT, payUsingStripe);




export default router