import { Doctor } from "../models/doctor.model.js";
import { Hospital } from "../models/hospital.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Appointment} from "../models/appointment.model.js";
import { isValidObjectId } from "mongoose";
/*
*The populate() method in Mongoose is used to automatically replace a field in a document with the actual data from a related document. It 
*simplifies handling referenced documents and helps replace ObjectIds with the actual data from related collections.
*/
const createDoctor=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const {specialization,experience,HRN,registrationNumber,hourlyRate}=req.body

    if(!specialization.trim() || !experience || !HRN || !registrationNumber || !hourlyRate){
        throw new ApiError(400,"all fields are required");
    }

    const hospital= await Hospital.findOne({HRN});

    const doctor=await Doctor.create({
        user: userId,
        specialization,
        experience,
        registrationNumber,
        hourlyRate,
        hospital: hospital._id
    })

    if(!doctor){
        throw new ApiError(500,"unable to create doctor profile")
    }
    return res.status(201).json(
        new ApiResponse(201, doctor, "doctor profile created successfully")
    );

})

const getDoctorById = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;

    if (!isValidObjectId(doctorId)) {
        throw new ApiError(400, "Invalid doctor ID!");
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new ApiError(404, "doctor not found");
    }

    res.status(200).json(
        new ApiResponse(200, doctor, "doctor fetched successfully")
    );
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId }).populate("user", "-password -refreshToken");
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }
  const deletedoctor=await doctor.deleteOne();//you can use deleteOne on the instance instead of model but it wont return u deletedCount
  //its better to use Model.deletOne instead of using it with instance to confirm deletion but just know this is also a way
   if(!deleteDoctor){
        throw new ApiError(500, "unable to delete hospital")
    }

    res.status(200).json(new ApiResponse(200, deletedoctor, "hospital deleted successfully"))
});

//TODO: modify this in a way it handles case for appointment present during unavailable time
const setUnavailableStatus = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;
  const userId = req.user._id;
  const doctor = await Doctor.findOne({ user: userId }).populate("user", "-password -refreshToken");
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  if (!startDate || !endDate) {
    throw new ApiError(400, "Both startDate and endDate are required");
  }


  const updatedDoc = await Doctor.findByIdAndUpdate(
    doctor._id,
    {
      $push: {
        unavailableStatus: {
          status: true,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        }
      }
    },
    { new: true }
  );

  if (!updatedDoc) {
    throw new ApiError(500, "Unable to set unavailable status");
  }

  res.status(200).json(
    new ApiResponse(200, updatedDoc, "Unavailable period set successfully")
  );
});

const setSchedule = asyncHandler(async (req, res) => {
  const { schedule } = req.body;
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId }).populate("user", "-password -refreshToken");
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  if (!Array.isArray(schedule)) {
    throw new ApiError(400, "Schedule must be an array");
  }

  doctor.schedule = schedule;

  const updatedDoctor = await doctor.save({ validateBeforeSave: false });
  if (!updatedDoctor) {
    throw new ApiError(500, "Failed to update schedule");
  }

  res.status(200).json(new ApiResponse(200, updatedDoctor, "Schedule updated successfully"));
});

const getAllDoctors = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "user.fullName", sortType = 1 } = req.query;

    const sortQuery = { [sortBy]: Number(sortType) };

    const aggregateQuery = Doctor.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },//expand/open the array given by lookup
        {
            $match: {
                $or: [
                    { "user.fullName": { $regex: query, $options: "i" } },
                    { specialization: { $regex: query, $options: "i" } },
                ]
            }
        },
        { $sort: sortQuery }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await Doctor.aggregatePaginate(aggregateQuery, options);

    res.status(200).json(
        new ApiResponse(200, result, "All doctors fetched successfully")
    );
});

const updateDoctor= asyncHandler(async(req,res)=>{
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId }).populate("user", "-password -refreshToken");
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }
  const {specialization, experience, hourlyRate, registrationNumber, HRN}=req.body

  let hospital=null;
  if(HRN){
      const findhospital=await Hospital.findOne(
          {HRN: HRN}
      )
      if(!findhospital){
          throw new ApiError(500, "unable to get the hospital from HRN")
      }
      hospital=findhospital
  }

  if(hospital)doctor.hospital=hospital._id
  if(specialization)doctor.specialization=specialization
  if(experience)doctor.experience=experience
  if(hourlyRate)doctor.hourlyRate=hourlyRate
  if(registrationNumber)doctor.registrationNumber=registrationNumber


  const updatedDoctor = await doctor.save({validateBeforeSave: false});

  if(!updatedDoctor){
      throw new ApiError(500, "unable to update doctor")
  }
  res.status(200).json(new ApiResponse(200, updatedDoctor, "succesfull updated doctor information"))
})

const getAppointmentsForDoctor = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId }).populate("user", "-password -refreshToken");
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  // Optional query parameters for filtering
  const { status } = req.query;
  const query = { doctor: doctor._id };
  if (status) {
    query.status = status; // e.g., 'completed', 'pending', etc.
  }

  const appointments = await Appointment.find(query)
  .populate("patient", "fullName gender")//without populate u will only get patientId not its name or email
  .populate("doctor", "specialization")
  .populate("hospital", "name")
  .sort({ createdAt: -1 });//latest first

  res.status(200).json(
    new ApiResponse(200, appointments, "Doctor's appointments fetched successfully")
  );
});

const updateSchedulePart = asyncHandler(async (req, res) => {
  const { index, newScheduleItem } = req.body; // e.g. index: 2, newScheduleItem: { day: "Monday", slots: [...] }
  const userId = req.user._id;

  if (typeof index !== 'number' || !newScheduleItem || typeof newScheduleItem !== 'object') {
    throw new ApiError(400, "Index and newScheduleItem (object) are required");
  }

  const doctor = await Doctor.findOne({ user: userId }).populate("user", "-password -refreshToken");
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  if (index < 0 || index >= doctor.schedule.length) {
    throw new ApiError(400, "Invalid schedule index");
  }

  // Update only the specific schedule item at index
  doctor.schedule[index] = { ...doctor.schedule[index].toObject(), ...newScheduleItem };

  const updatedDoctor = await doctor.save({ validateBeforeSave: false });
  if (!updatedDoctor) {
    throw new ApiError(500, "Failed to update schedule");
  }

  res.status(200).json(new ApiResponse(200, updatedDoctor, "Schedule updated successfully"));
});



export{
    createDoctor,
    getDoctorById,
    deleteDoctor,
    getAllDoctors,
    updateDoctor,
    getAppointmentsForDoctor,
    setUnavailableStatus,
    setSchedule,
    updateSchedulePart
}