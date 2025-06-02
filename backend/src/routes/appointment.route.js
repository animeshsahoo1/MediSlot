import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { bookAppointment, deleteAppointment, payUsingStripe } from "../controllers/appointment.controller.js";

const router=Router()

router.get("/:appointmentId/delete-appointment", verifyJWT, deleteAppointment);
router.get("/:appointmentId/checkout", verifyJWT, payUsingStripe);
router.post("/book-appointment/:doctorId", verifyJWT, bookAppointment);




export default router