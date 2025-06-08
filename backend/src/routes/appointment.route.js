import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { bookAppointment, deleteAppointment, fetchAppointments, payUsingStripe } from "../controllers/appointment.controller.js";

const router=Router()

router.get("/appointments", fetchAppointments); // uses ?doctorId or ?patientId
router.post("/appointments/:doctorId/book", verifyJWT, bookAppointment);
router.delete("/appointments/:appointmentId", verifyJWT, deleteAppointment);
router.post("/appointments/:appointmentId/checkout", verifyJWT, payUsingStripe);




export default router