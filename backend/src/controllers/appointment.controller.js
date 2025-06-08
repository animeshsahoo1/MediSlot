import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Patient } from "../models/patient.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import stripe from "../utils/stripe.js";
import { sendNotification } from "../utils/sendNotification.js";

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const userId = req.user._id;
  const { startTime, endTime } = req.body;

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctorId");
  }

  if (!startTime || !endTime) {
    throw new ApiError(400, "startTime and endTime are required");
  }

  const patient = await Patient.findOne({ user: userId });

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  const patientId = patient._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId, null, { session });
    if (!doctor) throw new ApiError(404, "Doctor not found");

    // Check for overlapping appointment
    const overlappingAppointment = await Appointment.findOne({
      doctor: doctorId,
      $or: [
        {
          startTime: { $lt: new Date(endTime), $gte: new Date(startTime) }
        },
        {
          endTime: { $gt: new Date(startTime), $lte: new Date(endTime) }
        },
        {
          startTime: { $lte: new Date(startTime) },
          endTime: { $gte: new Date(endTime) }
        }
      ]
    }, null, { session });
    /*
    Model.findOne(filter, projection, options)
    projection: fields to include or exclude, since we dont need that we pass null to move to options

    In Mongoose(and MongoDB), when you use transactions, you must ensure that all operations inside the transaction share the same session.
    That’s why you pass {session} it explicitly ties a Mongoose query to the session you're using for the transaction.
    you can also use .session(session) outside of findOne function does the same work
    */

    if (overlappingAppointment) {
      throw new ApiError(409, "Doctor already booked for this time slot");
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInHours = (end - start) / (1000 * 60 * 60);

    if (durationInHours <= 0) {
      throw new ApiError(400, "End time must be after start time");
    }

    const fee = durationInHours * doctor.hourlyRate;

    // Since create can accept either a single document or an array, it normally returns a single doc or an array. But during transactions 
    // (with session), it only works with the array syntax, even for a single document. so destructure it using []
    const [appointment] = await Appointment.create(
      [{
        doctor: doctorId,
        patient: patientId,
        startTime,
        endTime,
        status: "booked",
        fee
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(
      new ApiResponse(201, appointment, "Appointment booked successfully")
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, error.message);
  }
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!isValidObjectId(appointmentId)) {
    throw new ApiError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

    const patient = await Patient.findById(appointment.patient);//if no patient find returns null
    const doctor = await Doctor.findById(appointment.doctor);//if no doctor find returns null

    const userId = req.user._id.toString();

    const isPatient = patient.user.toString() === userId;
    const isDoctor = doctor.user.toString() === userId;

    if (!isPatient && !isDoctor) {
    throw new ApiError(403, "Unauthorized to delete this appointment");
    }

  let message=`Your appointment with id: ${appointment._id} has been cancelled`
  if(appointment.status=="booked"){
    message=`Your appointment with id: ${appointment._id} has been cancelled, your amount will be refunded within 7 days`
  }

  const deletedAppointment=await Appointment.findByIdAndDelete(appointmentId);//return deletedDocument if found null if not delted
  if(!deletedAppointment){
    throw new ApiError(500, "Unable to delete the appointment")
  }
  const notification=sendNotification(patient,message,appointmentId)//cant pas appointment._id as its deleted
  if(!notification){
    throw new ApiError(500, "unable to send notification")
  }
  res.status(200).json(new ApiResponse(200, null, "Appointment cancelled successfully"));
});

const payUsingStripe = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  // Optional: Fetch appointment info from DB (e.g., amount, doctor, patient)
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,//if payement success redirect user to this url
    cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,//if payement failed redirect user to this url
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Appointment with ${appointment.doctor}`,
          },
          unit_amount: appointment.fee * 100, // amount in cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointment._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  res.status(200).json({ url: session.url });
});

const fetchAppointments = asyncHandler(async (req, res) => {
  const { doctorId, patientId } = req.query;

  if (!doctorId && !patientId) {
    throw new ApiError(400, "doctorId or patientId is required");
  }

  if (doctorId && !isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID");
  }

  if (patientId && !isValidObjectId(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  const filter = doctorId ? { doctor: doctorId } : { patient: patientId };
  //nested populating
  const appointments = await Appointment.find(filter)
    .populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'fullName avatar'
      },
      select: '-__v'
    })
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'fullName avatar'
      },
      select: '-__v'
    })
    .sort({ date: -1 }); // latest first

  res.status(200).json(new ApiResponse(200, appointments, "Appointments fetched successfully"));
});





export{
    bookAppointment,
    deleteAppointment,
    payUsingStripe,
    fetchAppointments
}
